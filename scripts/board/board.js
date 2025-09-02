/**
 * Global State
 */
let currentDraggedElement = null;
let globalAllTasks = [];


/**
 * Mappers & Helpers
 */

/**
 * Map UI category to DB key.
 * @param {string} category
 * @returns {string}
 */
function categoryToDbKey(category) {
  const map = {
    toDo: "to_do",
    inProgress: "in_progress",
    awaitFeedback: "await_feedback",
    done: "done"
  };
  return map[category];
}


/**
 * Get index in globalAllTasks by category name.
 * @param {string} category
 * @returns {number}
 */
function getCategoryArrayIndex(category) {
  const categoryMap = {
    "toDo": 0,
    "inProgress": 1,
    "awaitFeedback": 2,
    "done": 3
  };

  return categoryMap[category];
}


/**
 * Find task indices by id across all categories.
 * @param {string} taskId
 * @returns {{categoryIndex:number, taskIndex:number} | null}
 */
function findTaskAndCategoryIndex(taskId) {
  for (let categoryIndex = 0; categoryIndex < globalAllTasks.length; categoryIndex++) {
    const taskIndex = globalAllTasks[categoryIndex].findIndex(t => t.id === taskId);
    if (taskIndex !== -1) return { categoryIndex, taskIndex };
  }
  return null;
}


/**
 * Add rotate class.
 * @param {string} id
 * @returns {void}
 */
function addClassForRotation(id) { document.getElementById(id).classList.add("rotateCard");  }


/**
 * Remove rotate class.
 * @param {string} id
 * @returns {void}
 */
function removeClassForRotation(id) { document.getElementById(id).classList.remove("rotateCard");  }


/**
 * Add highlight class.
 * @param {string} id
 * @returns {void}
 */
function addHighlightClass(id) { document.getElementById(id).classList.add("containerGetHovered");  }


/**
 * Remove highlight class.
 * @param {string} id
 * @returns {void}
 */
function removeHighlightClass(id) { document.getElementById(id).classList.remove("containerGetHovered");  }


/**
 * Ensure each task has the correct category field based on its column.
 * @returns {void}
 */
function fixTaskCategories() {
  const categories = ["toDo", "inProgress", "awaitFeedback", "done"];
  globalAllTasks.forEach((arr, i) => {
    arr.forEach(task => { task.category = categories[i]; });
  });
}


/**
 * Load & Render Board
 */

/**
 * Load users, fetch tasks, normalize categories, and render lanes.
 * @returns {Promise<void>}
 */
async function loadAndRenderBoardTasks() {
  await loadUserData();
  const [toDo, inProgress, awaitFeedback, done] = await mySuperTestFunction();
  globalAllTasks = [toDo, inProgress, awaitFeedback, done];
  fixTaskCategories();
  renderToDoTasks(globalAllTasks[0]);
  renderInProgressTasks(globalAllTasks[1]);
  renderAwaitFeedbackTasks(globalAllTasks[2]);
  renderDoneTasks(globalAllTasks[3]);
}


/**
 * Render "To Do" lane.
 * @param {Array<Object>} data
 * @returns {void}
 */
function renderToDoTasks(data) {
  const container = document.getElementById("toDoTasks");
  container.innerHTML = data.length ? data.map(task => taskTemplate(task, userData)).join('') : noTaskTemplate('"To Do"');
  if (data.length) {
    data.forEach(task => {
      const el = document.getElementById(task.id);
      if (el) {
        el.addEventListener('dragstart', () => startDraggingElement(task.id));
        el.addEventListener('dragend', () => removeClassForRotation(task.id));
        makeCardPointerDraggable(el, task.id);
        el.addEventListener('click', () => openTaskOverlay(task.id));
      }
    });
  }
}


/**
 * Render "In progress" lane.
 * @param {Array<Object>} data
 * @returns {void}
 */
function renderInProgressTasks(data) {
  const container = document.getElementById("inProgressTasks");
  container.innerHTML = data.length ? data.map(task => taskTemplate(task, userData)).join('') : noTaskTemplate('"In progress"');
  if (data.length) {
    data.forEach(task => {
      const el = document.getElementById(task.id);
      if (el) {
        makeCardPointerDraggable(el, task.id);
        el.addEventListener('click', () => openTaskOverlay(task.id)); 
      }
    });
  }
}


/**
 * Render "Await feedback" lane.
 * @param {Array<Object>} data
 * @returns {void}
 */
function renderAwaitFeedbackTasks(data) {
  const container = document.getElementById("awaitFeedbackTasks");
  container.innerHTML = data.length ? data.map(task => taskTemplate(task, userData)).join('') : noTaskTemplate('"Await feedback"');
  if (data.length) {
    data.forEach(task => {
      const el = document.getElementById(task.id);
      if (el) {
        makeCardPointerDraggable(el, task.id);
        el.addEventListener('click', () => openTaskOverlay(task.id));
      }
    });
  }
}


/**
 * Render "Done" lane.
 * @param {Array<Object>} data
 * @returns {void}
 */
function renderDoneTasks(data) {
  const container = document.getElementById("doneTasks");
  container.innerHTML = data.length ? data.map(task => taskTemplate(task, userData)).join('') : noTaskTemplate('"Done"');
  if (data.length) {
    data.forEach(task => {
      const el = document.getElementById(task.id);
      if (el) {
        makeCardPointerDraggable(el, task.id);
        el.addEventListener('click', () => openTaskOverlay(task.id));
      }
    });
  }
}


/**
 * Add Task Overlay (Load/Init/Close)
 * =====================================
 * Open the "Add Task" overlay for the board.
 * - Hides the host overlay
 * - Loads and injects the .addTaskOverlay HTML
 * - Applies default priority (medium) if available
 * - Shows the overlay and initializes the add-task overlay
 * @returns {Promise<void>}
 */
async function openTaskBoard() {
  const overlay = document.getElementById('boardOverlay');
  overlay.style.display = 'none';

  await injectAddTaskOverlay(overlay);

  if (typeof window.setDefaultPriorityMedium === 'function') {
    window.setDefaultPriorityMedium();
  }

  overlay.style.display = 'block';

  if (typeof addTaskOverlayInit === 'function') {
    addTaskOverlayInit();
  }
}

/**
 * Fetch, parse, and inject the ".addTaskOverlay" markup into the given overlay element.
 * @param {HTMLElement} overlay - The container element where the overlay HTML will be injected.
 * @returns {Promise<void>}
 */
async function injectAddTaskOverlay(overlay) {
  const resp = await fetch('../pages/board_overlay_add_task.html');
  const html = await resp.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const frag = doc.querySelector('.addTaskOverlay').outerHTML;

  overlay.innerHTML = frag;
}


/**
 * Dynamically load a script file.
 * @param {string} src
 * @returns {Promise<void>}
 */
function loadScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.onload = res;
    s.onerror = rej;
    document.body.appendChild(s);
  });
}


/**
 * Close the "Add Task" overlay and clear content.
 * @returns {void}
 */
function closeTaskBoard() {
  clearTask(); /** Clear any task data */
  const overlay = document.getElementById('boardOverlay');
  overlay.style.display = 'none';
  overlay.innerHTML = '';
}


/**
 * Initialize the "Add Task" overlay (Assigned-To & default priority).
 * @returns {void}
 */
function addTaskOverlayInit() {
  getUserDataForAddTask().then(() => {
    renderAssignedToList();
    /** Bind the click */
    document.getElementById('assignedTo').onclick = () => {
      toggleDropdownAssignedContacts();
      changeDropdownAssignedIcon();
      renderAssignedToList();
    };
  });
  setDefaultPriorityMedium();
}


/** Initialize immediately if overlay is already present. */
if (document.getElementById('assignedContactsUlItem')) {
  addTaskOverlayInit();
}


/**
 * Search Filter
 * =====================================
 * Filter tasks across lanes by search input value, then re-render each lane.
 * @returns {void}
 */
function filterTasksBySearch() {
  const searchTerm = document.getElementById("taskSearchInput").value.toLowerCase();

  /** Filter for each section */
  const [toDo, inProgress, awaitFeedback, done] = globalAllTasks;

  const filteredToDo = toDo.filter(t => taskMatchesSearch(t, searchTerm));
  const filteredInProgress = inProgress.filter(t => taskMatchesSearch(t, searchTerm));
  const filteredAwaitFeedback = awaitFeedback.filter(t => taskMatchesSearch(t, searchTerm));
  const filteredDone = done.filter(t => taskMatchesSearch(t, searchTerm));

  /** Re-render only according to the results */
  renderToDoTasks(filteredToDo);
  renderInProgressTasks(filteredInProgress);
  renderAwaitFeedbackTasks(filteredAwaitFeedback);
  renderDoneTasks(filteredDone);
}


/**
 * Predicate: does task match search term (title/description).
 * @param {{title:string, description:string}} task
 * @param {string} searchTerm
 * @returns {boolean}
 */
function taskMatchesSearch(task, searchTerm) {
  return (
    task.title.toLowerCase().includes(searchTerm) ||
    task.description.toLowerCase().includes(searchTerm)
  );
}
