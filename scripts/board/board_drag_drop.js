/**
 * Update the board HTML after a drag action by reloading and rendering tasks.
 * @returns {void}
 */
function updateBoardHTML() {
  /** update board html after dragging */
  loadAndRenderBoardTasks();
}


/**
 * Set the currently dragged element's task id.
 * @param {string|number} id - The task identifier being dragged.
 * @returns {void}
 */
function startDraggingElement(id) {
  currentDraggedElement = id;
}


/**
 * Prevent default to allow dropping on a valid target.
 * @param {DragEvent} e - The dragover event.
 * @returns {void}
 */
function handleDragOver(e) {
  e.preventDefault();
}


/**
 * Handle drop event: prevent default and move card to the provided category.
 * @param {DragEvent} e - The drop event.
 * @param {"toDo"|"inProgress"|"awaitFeedback"|"done"} category - Target category.
 * @returns {void}
 */
function handleDrop(e, category) {
  e.preventDefault();
  moveCardToNewCategory(category);
}


/**
 * Convenience handler to move a card to a new category.
 * @param {"toDo"|"inProgress"|"awaitFeedback"|"done"} category - Target category.
 * @returns {void}
 */
function moveCardToNewCategoryHandler(category) {
  moveCardToNewCategory(category);
}


/**
 * Move the currently dragged card to a new category:
 * 1) Delete from old category in DB.
 * 2) Write to new category in DB with SAME ID.
 * 3) Update local arrays.
 * 4) Re-render the board.
 * @async
 * @param {"toDo"|"inProgress"|"awaitFeedback"|"done"} category - Target category.
 * @returns {Promise<void>}
 */
async function moveCardToNewCategory(category) {
  const indices = findTaskAndCategoryIndex(currentDraggedElement);
  if (!indices) {
    console.error("Can't find Task to move");
    return;
  }

  const { categoryIndex, taskIndex } = indices;
  const task = globalAllTasks[categoryIndex][taskIndex];
  const oldCategory = task.category;

  /** 1. Delete task from the old category in the DB */
  await fetch(`${DATABASE_URL}/tasks/${categoryToDbKey(oldCategory)}/${task.id}.json`, { method: "DELETE" });

  /** 2. Write task in the new category with the SAME ID! in the DB */
  await fetch(`${DATABASE_URL}/tasks/${categoryToDbKey(category)}/${task.id}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task)
  });

  /** 3. Move locally as usual */
  globalAllTasks[categoryIndex].splice(taskIndex, 1);
  const newIndex = getCategoryArrayIndex(category);
  globalAllTasks[newIndex].push(task);

  /** 4. Re-render */
  loadAndRenderBoardTasks();
}


/**
 * ================================
 * Touch / Pointer DnD for mobile
 * ================================
 */

/** @type {boolean} */
let _touchDragging = false;
/** @type {string|number|null} */
let _touchDragTaskId = null;
/** @type {HTMLElement|null} */
let _ghost = null;

/**
 * Column containers mapping for hit-testing.
 * @type {{id:string,cat:"toDo"|"inProgress"|"awaitFeedback"|"done"}[]}
 */
const COL_IDS = [
  { id: 'toDoContainer', cat: 'toDo' },
  { id: 'inProgressContainer', cat: 'inProgress' },
  { id: 'awaitFeedbackContainer', cat: 'awaitFeedback' },
  { id: 'doneContainer', cat: 'done' }
];


/**
 * Determine whether the pointer is touch-like (coarse).
 * @param {PointerEvent|TouchEvent|Event} [e] - Optional event for checking pointerType.
 * @returns {boolean} True if touch or pen or coarse pointer is detected.
 */
function isTouchLikePointer(e) {
  return (window.matchMedia && matchMedia('(pointer: coarse)').matches) ||
    (e && (/** @type {any} */(e).pointerType === 'touch' || /** @type {any} */(e).pointerType === 'pen')) ||
    ('ontouchstart' in window);
}


/**
 * Create and append a visual ghost element cloned from a given element.
 * @param {HTMLElement} el - The original element to clone.
 * @returns {HTMLElement} The ghost element.
 */
function makeGhostFrom(el) {
  const g = el.cloneNode(true);
  g.classList.add('drag-ghost');
  g.style.width = el.getBoundingClientRect().width + 'px';
  document.body.appendChild(g);
  return g;
}


/**
 * Highlight the column container of a given element.
 * @param {Element|null} el - The element under the pointer.
 * @returns {void}
 */
function highlightContainer(el) {
  COL_IDS.forEach(c => document.getElementById(c.id)?.classList.remove('containerGetHovered'));
  const col = el?.closest?.('.toDoContainer, .inProgressContainer, .awaitFeedbackContainer, .doneContainer');
  if (col) col.classList.add('containerGetHovered');
}


/**
 * Get category name based on a screen coordinate (x, y).
 * @param {number} x - Client X.
 * @param {number} y - Client Y.
 * @returns {"toDo"|"inProgress"|"awaitFeedback"|"done"|null} Matched category or null.
 */
function getCategoryFromPoint(x, y) {
  const el = document.elementFromPoint(x, y);
  highlightContainer(el);
  const match = COL_IDS.find(c => el?.closest?.(`#${c.id}`));
  return match?.cat || null;
}


/**
 * Clear all touch DnD state and UI highlights (and remove ghost if present).
 * @returns {void}
 */
function clearTouchDnD() {
  _touchDragging = false;
  _touchDragTaskId = null;
  COL_IDS.forEach(c => document.getElementById(c.id)?.classList.remove('containerGetHovered'));
  if (_ghost) { _ghost.remove(); _ghost = null; }
}


/**
 * =====================================
 * Pointer Drag (Mouse + Touch) for Cards
 * (vertical threshold + autoScroll + disable text-selection on full page + card)
 * =====================================
 */

/** @type {{taskId:string|number, ghost:HTMLElement|null, startX:number, startY:number}|null} */
let _drag = null;
/** @type {boolean} */
let pointerMoved = false;
/** @type {number} px to start drag */
const dragThreshold = 20;
/** @type {number} px from top/bottom where auto-scroll starts */
const edgeMargin = 150;
/** @type {number} px per frame */
const scrollSpeed = 120;


/**
 * Make a card element draggable using Pointer Events with vertical drag threshold and auto-scroll.
 * @param {HTMLElement} cardEl - The card element.
 * @param {string|number} taskId - The task id associated with the card.
 * @returns {void}
 */
function makeCardPointerDraggable(cardEl, taskId) {
  if (!cardEl || cardEl.__pointerDragBound) return;
  cardEl.__pointerDragBound = true;

  /** allow horizontal pan (scroll) but not vertical */
  cardEl.style.touchAction = 'pan-x';

  cardEl.addEventListener('pointerdown', onPointerDown);

  /**
   * Handle pointer down: begin tracking and set capture.
   * @param {PointerEvent} ev - Pointer down event.
   * @returns {void}
   */
  function onPointerDown(ev) {
    if (ev.button && ev.button !== 0) return;
    if (ev.target.closest('.edit-task-btn, .delete-task-btn')) return;

    currentDraggedElement = taskId;
    pointerMoved = false;

    _drag = {
      taskId,
      ghost: null,
      startX: ev.clientX,
      startY: ev.clientY
    };

    cardEl.setPointerCapture?.(ev.pointerId);
    cardEl.addEventListener('pointermove', onPointerMove);
    cardEl.addEventListener('pointerup', onPointerUp, { once: true });
    cardEl.addEventListener('pointercancel', onPointerUp, { once: true });
  }


  /**
   * Start the "real" drag by creating a floating ghost and disabling text selection.
   * @returns {void}
   */
  function startRealDrag() {
    const rect = cardEl.getBoundingClientRect();
    const ghost = cardEl.cloneNode(true);

    ghost.style.position = 'fixed';
    ghost.style.left = rect.left + 'px';
    ghost.style.top = rect.top + 'px';
    ghost.style.width = rect.width + 'px';
    ghost.style.pointerEvents = 'none';
    ghost.style.zIndex = 9999;
    ghost.classList.add('drag-ghost');

    document.body.appendChild(ghost);

    /** disable text-selection on page + card */
    document.body.classList.add('no-text-select');
    cardEl.classList.add('no-text-select');

    _drag.ghost = ghost;
    requestAnimationFrame(() => ghost.classList.add('drag-ghost-active'));
  }


  /**
   * Handle pointer move:
   * - Start drag after vertical threshold.
   * - Keep pointer capture.
   * - Auto-scroll near edges.
   * - Move ghost element.
   * @param {PointerEvent} ev - Pointer move event.
   * @returns {void}
   */
  function onPointerMove(ev) {
    if (!_drag) return;

    const dx = ev.clientX - _drag.startX;
    const dy = ev.clientY - _drag.startY;

    /** only start drag when movement is mostly vertical */
    if (!pointerMoved) {
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      if (absDy > absDx && absDy > dragThreshold) {
        pointerMoved = true;
        startRealDrag();
      } else {
        /** horizontal scroll */
        return;
      }
    }

    if (_drag.ghost) updateDragFrame(ev, dx, dy);
  }


  /**
 * Update visual frame during drag:
 * - Keep pointer capture
 * - Highlight drop column
 * - Auto-scroll and adjust startY
 * - Move ghost element
 * @param {PointerEvent} ev
 * @param {number} dx
 * @param {number} dy
 * @returns {void}
 */
  function updateDragFrame(ev, dx, dy) {
    /** keep pointer capture so the ghost is not released during auto-scroll */
    if (cardEl.hasPointerCapture(ev.pointerId)) {
      cardEl.setPointerCapture(ev.pointerId);
    }

    highlightDropColumnAt(ev.clientX, ev.clientY);
    autoScrollAndAdjustStartY(ev.clientY);

    /** update the ghost position */
    _drag.ghost.style.transform = `translate(${dx}px, ${dy}px)`;
  }


  /**
 * Auto-scroll near edges and update _drag.startY accordingly.
 * @param {number} y
 * @returns {void}
 */
  function autoScrollAndAdjustStartY(y) {
    if (y < edgeMargin) {
      window.scrollBy(0, -scrollSpeed);
      _drag.startY -= scrollSpeed;
    } else if (y > window.innerHeight - edgeMargin) {
      window.scrollBy(0, scrollSpeed);
      _drag.startY += scrollSpeed;
    }
  }


  /**
   * Handle pointer up:
   * - Remove listeners.
   * - Drop to column if valid.
   * - Cleanup ghost and selection state.
   * @param {PointerEvent} ev - Pointer up/cancel event.
   * @returns {void}
   */
  function onPointerUp(ev) {
    cardEl.removeEventListener('pointermove', onPointerMove);

    if (_drag && _drag.ghost) {
      const dropCategory = getDropCategoryFromPoint(ev.clientX, ev.clientY);
      clearDropHighlights();
      _drag.ghost.remove();

      /** re-enable text-selection */
      document.body.classList.remove('no-text-select');
      cardEl.classList.remove('no-text-select');

      if (dropCategory) {
        moveCardToNewCategory(dropCategory);
      }
    }

    pointerMoved = false;
    _drag = null;
  }
}


/**
 * Get the column category from a screen point.
 * @param {number} x - The x coordinate.
 * @param {number} y - The y coordinate.
 * @returns {"toDo"|"inProgress"|"awaitFeedback"|"done"|null} The category name or null if no column is matched.
 */
function getDropCategoryFromPoint(x, y) {
  const cols = [
    { id: 'toDoTasks', cat: 'toDo' },
    { id: 'inProgressTasks', cat: 'inProgress' },
    { id: 'awaitFeedbackTasks', cat: 'awaitFeedback' },
    { id: 'doneTasks', cat: 'done' }
  ];

  for (const c of cols) {
    const el = document.getElementById(c.id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
      return c.cat;
    }
  }
  return null;
}


/**
 * Highlight a column while dragging (drop indicator).
 * @param {number} x - The x coordinate of the cursor.
 * @param {number} y - The y coordinate of the cursor.
 * @returns {void}
 */
function highlightDropColumnAt(x, y) {
  clearDropHighlights();
  const cat = getDropCategoryFromPoint(x, y);
  if (!cat) return;
  const id = {
    toDo: 'toDoTasks',
    inProgress: 'inProgressTasks',
    awaitFeedback: 'awaitFeedbackTasks',
    done: 'doneTasks'
  }[cat];
  const el = document.getElementById(id);
  if (el) el.classList.add('board-drop-hover');
}


/**
 * Remove drop highlight classes from all columns.
 * @returns {void}
 */
function clearDropHighlights() {
  document.querySelectorAll('.board-drop-hover').forEach(el => el.classList.remove('board-drop-hover'));
}
