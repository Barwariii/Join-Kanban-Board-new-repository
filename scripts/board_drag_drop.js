


// --- drag_drop_board.js ---

// =====================================
// Drag & Drop
// =====================================
function updateBoardHTML() {
  // update board html after dragging
  loadAndRenderBoardTasks();
}

// function startDraggingElement(id) { currentDraggedElement = id; }
function startDraggingElement(id) {
  currentDraggedElement = id;
  console.log('startDraggingElement SET:', id);
}

function handleDragOver(e) { e.preventDefault(); }

function handleDrop(e, category) {
  e.preventDefault();
  moveCardToNewCategory(category);
}

function moveCardToNewCategoryHandler(category) {
  moveCardToNewCategory(category);
}

async function moveCardToNewCategory(category) {
  const indices = findTaskAndCategoryIndex(currentDraggedElement);
  if (!indices) {
    console.error("Can't find Task to move");
    return;
  }
  const { categoryIndex, taskIndex } = indices;
  const task = globalAllTasks[categoryIndex][taskIndex];
  const oldCategory = task.category;
  // 1. Delete task from the old category in the DB
  await fetch(`${DATABASE_URL}/tasks/${categoryToDbKey(oldCategory)}/${task.id}.json`, { method: "DELETE" });
  // 2. Write task in the new category with the SAME ID! in the DB
  await fetch(`${DATABASE_URL}/tasks/${categoryToDbKey(category)}/${task.id}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task)
  });
  // 3. Move locally as usual:
  globalAllTasks[categoryIndex].splice(taskIndex, 1);
  const newIndex = getCategoryArrayIndex(category);
  globalAllTasks[newIndex].push(task);
  // 4. Re-render:
  loadAndRenderBoardTasks();
}


// ================================
  // Touch / Pointer DnD for mobile
  // ================================
  let _touchDragging = false;
  let _touchDragTaskId = null;
  let _ghost = null;

  const COL_IDS = [
    { id: 'toDoContainer', cat: 'toDo' },
    { id: 'inProgressContainer', cat: 'inProgress' },
    { id: 'awaitFeedbackContainer', cat: 'awaitFeedback' },
    { id: 'doneContainer', cat: 'done' }
  ];

  function isTouchLikePointer(e) {
    return (window.matchMedia && matchMedia('(pointer: coarse)').matches) ||
           (e && (e.pointerType === 'touch' || e.pointerType === 'pen')) ||
           ('ontouchstart' in window);
  }

  function makeGhostFrom(el) {
    const g = el.cloneNode(true);
    g.classList.add('drag-ghost');
    g.style.width = el.getBoundingClientRect().width + 'px';
    document.body.appendChild(g);
    return g;
  }

  function highlightContainer(el) {
    COL_IDS.forEach(c => document.getElementById(c.id)?.classList.remove('containerGetHovered'));
    const col = el?.closest?.('.toDoContainer, .inProgressContainer, .awaitFeedbackContainer, .doneContainer');
    if (col) col.classList.add('containerGetHovered');
  }

  function getCategoryFromPoint(x, y) {
    const el = document.elementFromPoint(x, y);
    highlightContainer(el);
    const match = COL_IDS.find(c => el?.closest?.(`#${c.id}`));
    return match?.cat || null;
  }

  function clearTouchDnD() {
    _touchDragging = false;
    _touchDragTaskId = null;
    COL_IDS.forEach(c => document.getElementById(c.id)?.classList.remove('containerGetHovered'));
    if (_ghost) { _ghost.remove(); _ghost = null; }
  }


// =====================================
// Pointer Drag (Mouse + Touch) for Cards
// (vertical threshold + autoScroll + disable text-selection on full page + card)
// =====================================

let _drag = null;
let pointerMoved = false;
const dragThreshold = 20;    // px to start drag
const edgeMargin   = 150;    // px from top/bottom where auto-scroll starts
const scrollSpeed  = 120;     // px per frame

function makeCardPointerDraggable(cardEl, taskId) {
  if (!cardEl || cardEl.__pointerDragBound) return;
  cardEl.__pointerDragBound = true;

  // allow horizontal pan (scroll) but not vertical
  cardEl.style.touchAction = 'pan-x';

  cardEl.addEventListener('pointerdown', onPointerDown);

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

    // disable text-selection on page + card
    document.body.classList.add('no-text-select');
    cardEl.classList.add('no-text-select');

    _drag.ghost = ghost;
    requestAnimationFrame(() => ghost.classList.add('drag-ghost-active'));
  }

  function onPointerMove(ev) {
    if (!_drag) return;

    const dx = ev.clientX - _drag.startX;
    const dy = ev.clientY - _drag.startY;

    // only start drag when movement is mostly vertical
    if (!pointerMoved) {
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      if (absDy > absDx && absDy > dragThreshold) {
        pointerMoved = true;
        startRealDrag();
      } else {
        return; // horizontal scroll
      }
    }

    if (_drag.ghost) {
      // ✳️ keep pointer capture so the ghost is not released during auto-scroll
      if (cardEl.hasPointerCapture(ev.pointerId)) {
        cardEl.setPointerCapture(ev.pointerId);
      }

      highlightDropColumnAt(ev.clientX, ev.clientY);

      // auto-scroll + update startY
      const y = ev.clientY;
      if (y < edgeMargin) {
        window.scrollBy(0, -scrollSpeed);
        _drag.startY -= scrollSpeed;
      } else if (y > window.innerHeight - edgeMargin) {
        window.scrollBy(0, scrollSpeed);
        _drag.startY += scrollSpeed;
      }

      // update the ghost position
      _drag.ghost.style.transform = `translate(${dx}px, ${dy}px)`;
    }
  }

  function onPointerUp(ev) {
    cardEl.removeEventListener('pointermove', onPointerMove);

    if (_drag && _drag.ghost) {
      const dropCategory = getDropCategoryFromPoint(ev.clientX, ev.clientY);
      clearDropHighlights();
      _drag.ghost.remove();

      // re-enable text-selection
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
 * @returns {string|null} The category name or null if no column is matched.
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
 */
function clearDropHighlights() {
  document.querySelectorAll('.board-drop-hover').forEach(el => el.classList.remove('board-drop-hover'));
}