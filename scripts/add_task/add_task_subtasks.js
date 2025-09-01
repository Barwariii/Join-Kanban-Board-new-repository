/**
 * Add a subtask from the input and re-render.
 * @returns {void}
 */
function addSubtask() {
  const input = document.getElementById('subtasks');
  const subtaskText = input.value.trim();

  if (subtaskText) {
    subtasks.push(subtaskText);
    input.value = '';
    renderSubtasks();
  }
}


/**
 * Remove subtask by index and re-render.
 * @param {number} index
 * @returns {void}
 */
function removeSubtask(index) {
  subtasks.splice(index, 1);
  renderSubtasks();
}


/** Current inline-editing index for subtasks (or null if none). */
let editingSubtaskIndex = null;


/**
 * Enter edit mode for a subtask and focus its input.
 * @param {number} i
 * @returns {void}
 */
function editSubtask(i) {
  editingSubtaskIndex = i;
  renderSubtasks();
  setTimeout(() => document.getElementById(`editSubtaskInput${i}`)?.focus(), 0);
}


/**
 * Save an edited subtask content and exit edit mode.
 * @param {number} i
 * @returns {void}
 */
function saveSubtask(i) {
  const el = document.getElementById(`editSubtaskInput${i}`);
  if (!el) return;
  const val = el.value.trim();
  if (val) subtasks[i] = val;
  editingSubtaskIndex = null;
  renderSubtasks();
}


/**
 * Cancel editing mode for subtasks and re-render.
 * @returns {void}
 */
function cancelEdit() {
  editingSubtaskIndex = null;
  renderSubtasks();
}


/**
 * Handle Enter/Escape keys while editing a subtask.
 * @param {KeyboardEvent} e
 * @param {number} i
 * @returns {void}
 */
function handleEditKey(e, i) {
  if (e.key === 'Enter') saveSubtask(i);
  if (e.key === 'Escape') cancelEdit();
}


/**
 * Escape unsafe HTML characters for safe output.
 * @param {string} s
 * @returns {string}
 */
function escHtml(s) {
  return s.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}


/** Bind the “add subtask” button to addSubtask (once). */
document.querySelector('.add-subtask-btn').addEventListener('click', addSubtask);
