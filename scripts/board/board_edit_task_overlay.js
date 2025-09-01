/**
 * Edit Overlay State
 */
let currentEditedTaskId = null;
let currentPriority = '';
let editTaskSubtasks = [];


/**
 * Open/Get/Save/Close
 * Open edit overlay for a task and prefill its data.
 * @param {string} taskId
 * @returns {Promise<void>}
 */
async function openEditTaskOverlay(taskId) {
  currentEditedTaskId = taskId;

  /** 1. Fetch the task data */
  const task = await getTaskById(taskId);

  currentPriority = task.priority || '';

  editTaskSubtasks = task.subtasks ? [...task.subtasks] : [];

  /** 2. Prepare HTML fragments using templates */
  const assignedHtml = renderAssignableContacts(task.assigned_to || []);
  const selectedHtml = renderSelectedContacts(task.assigned_to || []);
  const subtasksHtml = renderSubtasks(task.subtasks || []);

  /** 3. Load and initialize the overlay */
  const overlay = document.getElementById('boardOverlay');
  overlay.innerHTML = editTaskOverlayTemplate(task, assignedHtml, selectedHtml, subtasksHtml);

  overlay.style.display = 'block';

  /** When creating the overlay, set the active button */
  setTimeout(() => {
    if (currentPriority) {
      setPriority(currentPriority);
    }
  }, 0);

  updateProgressBar();
}


/**
 * Find a task object by id scanning all categories.
 * @param {string} taskId
 * @returns {Promise<Object|null>}
 */
async function getTaskById(taskId) {
  for (const category of globalAllTasks) {
    const foundTask = category.find(t => t.id === taskId);
    if (foundTask) return foundTask;
  }
  return null;
}


/**
 * Save edited task (PATCH version - original first version).
 * @returns {Promise<void>}
 */
async function saveEditedTask() {
  if (!currentEditedTaskId) return;

  const updatedTask = {
    title: document.getElementById('editTaskTitle').value,
    description: document.getElementById('editTaskDescription').value,
    priority: currentPriority
  };

  const task = await getTaskById(currentEditedTaskId);
  const categoryKey = categoryToDbKey(task.category);

  await fetch(`${DATABASE_URL}/tasks/${categoryKey}/${currentEditedTaskId}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedTask)
  });

  loadAndRenderBoardTasks();
  closeEditOverlay();
}


/**
 * Priority Selection
 * Set current priority and update active button classes.
 * @param {"urgent"|"medium"|"low"} priority
 * @returns {void}
 */
function setPriority(priority) {
  currentPriority = priority;

  document.querySelectorAll('.priority-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  const activeBtn = document.getElementById(`edit${priority.charAt(0).toUpperCase() + priority.slice(1)}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
}


/**
 * Contacts (Assignable / Selected)
 * Render list of assignable contacts with checkbox SVGs.
 * @param {string[]} [assignedIds=[]]
 * @returns {string}
 */
function renderAssignableContacts(assignedIds = []) {
  return userData.map((user, i) => {
    const isChecked = assignedIds.includes(user.id);
    return contactOptionTemplate(user, i, isChecked);
  }).join('');
}


/**
 * Render selected contacts badges.
 * @param {string[]} [assignedIds=[]]
 * @returns {string}
 */
function renderSelectedContacts(assignedIds = []) {
  return assignedIds.map(id => {
    const user = userData.find(u => u.id === id);
    if (!user) return '';
    return selectedContactBadgeTemplate(user);
  }).join('');
}


/**
 * Toggle contacts dropdown open/closed.
 * @returns {void}
 */
function toggleContactsDropdown() {
  const dropdown = document.getElementById('contactsDropdown');
  const icon = document.getElementById('contactsDropdownIcon');

  if (dropdown.style.display === 'block') {
    dropdown.style.display = 'none';
    icon.style.transform = 'rotate(0deg)';
  } else {
    dropdown.style.display = 'block';
    icon.style.transform = 'rotate(180deg)';
  }
}


/**
 * Toggle a specific contact selected state and update UI.
 * @param {string} contactId
 * @param {number} index
 * @returns {void}
 */
function toggleContactSelection(contactId, index) {
  const unchecked = document.getElementById(`edit-unCheckedBox${index}`);
  const checked = document.getElementById(`edit-checkedBox${index}`);
  const contactElement = document.getElementById(`contact-option-${index}`);

  if (unchecked.classList.contains('hideCheckBox')) {
    unchecked.classList.remove('hideCheckBox');
    checked.classList.add('hideCheckBox');
    contactElement.classList.remove('active');
  } else {
    unchecked.classList.add('hideCheckBox');
    checked.classList.remove('hideCheckBox');
    contactElement.classList.add('active');
  }

  updateEditedSelectedContacts();
}


/**
 * Remove contact from selected list via badge “×”.
 * @param {string} contactId
 * @returns {void}
 */
function removeContact(contactId) {
  const userIndex = userData.findIndex(u => u.id === contactId);
  if (userIndex !== -1) {
    const unchecked = document.getElementById(`edit-unCheckedBox${userIndex}`);
    const checked = document.getElementById(`edit-checkedBox${userIndex}`);
    const contactElement = document.getElementById(`contact-option-${userIndex}`);

    unchecked.classList.remove('hideCheckBox');
    checked.classList.add('hideCheckBox');
    contactElement.classList.remove('active');
  }
  updateEditedSelectedContacts();
}


/**
 * Collect selected contacts' IDs by checking visible SVG state.
 * @returns {string[]}
 */
function getSelectedContactIds() {
  const selectedIds = [];
  userData.forEach((user, i) => {
    const checked = document.getElementById(`edit-checkedBox${i}`);
    if (checked && !checked.classList.contains('hideCheckBox')) {
      selectedIds.push(user.id);
    }
  });
  return selectedIds;
}


/**
 * Update the badges container for selected contacts.
 * @returns {void}
 */
function updateEditedSelectedContacts() {
  const selectedIds = [];
  userData.forEach((user, i) => {
    const checked = document.getElementById(`edit-checkedBox${i}`);
    if (checked && !checked.classList.contains('hideCheckBox')) {
      selectedIds.push(user.id);
    }
  });

  document.getElementById('selectedContacts').innerHTML = renderSelectedContacts(selectedIds);
}


/**
 * Initialize contact selection state according to assigned IDs.
 * @param {string[]} [assignedIds=[]]
 * @returns {void}
 */
function initializeContactSelection(assignedIds = []) {
  assignedIds.forEach(id => {
    const userIndex = userData.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      const unchecked = document.getElementById(`edit-unCheckedBox${userIndex}`);
      const checked = document.getElementById(`edit-checkedBox${userIndex}`);
      if (unchecked && checked) {
        unchecked.classList.add('hideCheckBox');
        checked.classList.remove('hideCheckBox');
      }
    }
  });
  updateEditedSelectedContacts();
}


/**
 * Subtasks (Edit Overlay)
 * Render subtasks list as HTML.
 * @param {Array<{title:string, completed:boolean}>} [subtasks=[]]
 * @returns {string}
 */
function renderSubtasks(subtasks = []) {
  return subtasks.map((subtask, index) => subtaskItemTemplate(subtask, index)).join('');
}


/**
 * Add new subtask (edit overlay) and re-render.
 * @returns {void}
 */
function addSubtaskForEdit() {
  const input = document.getElementById('newSubtaskInput');
  if (!input || !input.value.trim()) return;

  editTaskSubtasks.push({ title: input.value.trim(), completed: false });
  input.value = '';
  renderSubtasksForEdit();
}


/**
 * Render edit subtasks container from current array.
 * @returns {void}
 */
function renderSubtasksForEdit() {
  const container = document.getElementById('subtasksList');
  if (!container) return;
  container.innerHTML = renderSubtasks(editTaskSubtasks);
  updateProgressBar();
}


/**
 * Remove a subtask by index in edit mode.
 * @param {number} index
 * @returns {void}
 */
function removeEditTaskSubtask(index) {
  editTaskSubtasks.splice(index, 1);
  renderSubtasksForEdit();
}

window.removeEditTaskSubtask = removeEditTaskSubtask;


/**
 * Toggle subtask completion status (completed / not completed).
 * @param {number} index
 * @returns {void}
 */
function toggleSubtaskCompletion(index) {
  if (editTaskSubtasks[index]) {
    editTaskSubtasks[index].completed = !editTaskSubtasks[index].completed;
    renderSubtasksForEdit();
  }
}


/**
 * Update the progress bar based on completed subtasks.
 * @returns {void}
 */
function updateProgressBar() {
  const totalSubtasks = editTaskSubtasks.length;
  const completedSubtasks = editTaskSubtasks.filter(st => st.completed).length;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');

  if (progressFill && progressText) {
    progressFill.style.width = `${progressPercent}%`;
    progressText.textContent = `${completedSubtasks}/${totalSubtasks} done`;
  }
}


/**
 * Save edited task (PUT version with merge).
 * @returns {Promise<void>}
 */
async function saveEditedTask() {
  if (!currentEditedTaskId) return;
  try {
    const updatedTask = buildUpdatedTaskFromForm();
    const task = await getTaskById(currentEditedTaskId);
    const categoryKey = categoryToDbKey(task.category);
    const mergedTask = { ...task, ...updatedTask };
    const ok = await putMergedTask(categoryKey, currentEditedTaskId, mergedTask);
    if (!ok) return;
    loadAndRenderBoardTasks();
    closeEditOverlay();
  } catch (error) {
    console.error("Error saving task:", error);
    alert("Failed to save changes. Please try again.");
  }
}

/**
 * PUT the merged task to Realtime DB and handle API errors.
 * @param {string} categoryKey
 * @param {string} taskId
 * @param {Object} mergedTask
 * @returns {Promise<boolean>} true if saved, false if API error.
 */
async function putMergedTask(categoryKey, taskId, mergedTask) {
  const res = await fetch(`${DATABASE_URL}/tasks/${categoryKey}/${taskId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mergedTask)
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("API error:", err);
    alert("Failed to save changes!\n" + err);
    return false;
  }
  return true;
}


/**
 * Read edited fields and build the updated task object.
 * @returns {{title:string,description:string,due_date:string,priority:any,assigned_to:string[],subtasks:any[]}}
 */
function buildUpdatedTaskFromForm() {
  return {
    title: document.getElementById('editTaskTitle').value,
    description: document.getElementById('editTaskDescription').value,
    due_date: document.getElementById('editTaskDueDate').value,
    priority: currentPriority,
    assigned_to: getSelectedContactIds(),
    subtasks: editTaskSubtasks
  };
}


/**
 * Close Overlay / Delete
 * Close the edit overlay and reset edit state.
 * @returns {void}
 */
function closeEditOverlay() {
  editTaskSubtasks = [];
  const overlay = document.getElementById('boardOverlay');
  overlay.style.display = 'none';
  overlay.innerHTML = '';
  currentEditedTaskId = null;
}


/**
 * Show a simple Yes/No confirm overlay and call onConfirm when confirmed.
 * @param {Function} onConfirm
 * @returns {void}
 */
function showDeleteConfirmOverlay(onConfirm) {
  const overlay = document.getElementById('boardOverlay');
  overlay.innerHTML = deleteConfirmOverlayTemplate();
  overlay.style.display = 'block';

  document.getElementById('deleteConfirmYes').onclick = () => {
    overlay.style.display = 'none';
    overlay.innerHTML = '';
    onConfirm();
  };
  document.getElementById('deleteConfirmNo').onclick = () => {
    overlay.style.display = 'none';
    overlay.innerHTML = '';
  };
}


/**
 * Delete a task after user confirmation, then reload lists.
 * @param {string} taskId
 * @returns {Promise<void>}
 */
async function deleteTask(taskId) {
  showDeleteConfirmOverlay(async () => {
    const task = await getTaskById(taskId);
    if (!task) return;

    const categoryKey = categoryToDbKey(task.category);

    await fetch(`${DATABASE_URL}/tasks/${categoryKey}/${taskId}.json`, {
      method: "DELETE"
    });

    loadAndRenderBoardTasks();
  });
}
