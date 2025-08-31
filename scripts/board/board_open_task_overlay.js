/**
 * Opens the task overlay and renders the full task information.
 * Initializes editTaskSubtasks and binds checkbox handlers.
 * @param {string} taskId - The ID of the task to open.
 */
async function openTaskOverlay(taskId) {
  const hasUD  = Array.isArray(typeof userData !== 'undefined' ? userData : null) && userData.length;
  const hasWUD = Array.isArray(window.userData) && window.userData.length;
  if (!hasUD && !hasWUD && typeof loadUserData === 'function') {
    await loadUserData();
  }

  const task = await getTaskById(taskId);
  if (!task) return;

  const overlay = document.getElementById('boardOverlay');
  overlay.style.display = 'block';
  overlay.innerHTML = taskOverlayTemplate(task);

  // keep progress/subtasks
  window.editTaskSubtasks = Array.isArray(task.subtasks) ? task.subtasks.map(s => ({...s})) : [];
  bindSubtaskCheckboxHandlers(task);
  if (typeof updateProgressBar === 'function') updateProgressBar();

  overlay.addEventListener('click', function closeOnBackdrop(e){
    if (e.target.id === 'boardOverlay') { overlay.removeEventListener('click', closeOnBackdrop); closeTaskOverlay(); }
  });
}


/**
 * Closes the overlay and clears its content.
 */
function closeTaskOverlay() {
  const overlay = document.getElementById('boardOverlay');
  overlay.style.display = 'none';
  overlay.innerHTML = '';
}


/**
 * Creates the HTML of the overlay for the given task.
 * @param {Object} task - The task to render.
 * @returns {string} The overlay HTML.
 */
function taskOverlayTemplate(task) {
  const subtasksHtml = renderOverlaySubtasks(task);

  const ud = Array.isArray(typeof userData !== 'undefined' ? userData : null)
    ? userData
    : (Array.isArray(window.userData) ? window.userData : []);


  const assignedRaw = task.assigned_to || [];
  const assigned = Array.isArray(assignedRaw)
    ? assignedRaw
    : (assignedRaw && typeof assignedRaw === 'object' ? Object.values(assignedRaw) : []);


  const users = assigned
    .map(id => ud.find(u => String(u.id) === String(id)))
    .filter(Boolean);

  const assignedHTML = users.length
    ? users.map(u => `
        <div class="ot-chip-user">
          <span class="ot-badge" style="background:${u.color || '#999'}">${escapeHtml(u.initials || '')}</span>
          <span class="ot-name">${escapeHtml(u.name || '')}</span>
        </div>
      `).join('')
    : '<span class="ot-muted">No assignees</span>';

  return `
    <div class="open-task-overlay">
      <div class="open-task-card">
        <div class="ot-header">
          ${task.type ? `<span class="ot-chip">${escapeHtml(task.type)}</span>` : ''}
          <button class="ot-close" onclick="closeTaskOverlay()">✕</button>
        </div>

        <h1 class="ot-title">${escapeHtml(task.title || '')}</h1>
        ${task.description ? `<p class="ot-desc">${escapeHtml(task.description)}</p>` : ''}

        <div class="ot-row"><span class="ot-label">Due date:</span><span>${formatDate(task.due_date)}</span></div>
        <div class="ot-row"><span class="ot-label">Priority:</span><span class="ot-priority">${priorityBadge(task.priority)}</span></div>

        <div class="ot-section">
          <div class="ot-subtitle">Assigned To:</div>
          <div id="openTaskAssignedToContainer" class="openTaskAssignedToContainer">
            ${assignedHTML}
          </div>
        </div>

        <div class="ot-section">
          <div class="ot-subtitle">Subtasks</div>
          <div id="ot-subtasks" class="ot-subtasks">${subtasksHtml}</div>
        </div>

        <div class="ot-actions">
          <button class="ot-delete-btn" onclick="handleOverlayDelete('${task.id}')">
            <img src="../assets/icons/delete1.png" alt="" class="ot-ico"> Delete
         </button>
          <button class="ot-edit-btn" onclick="handleOverlayEdit('${task.id}')">
            <img src="../assets/icons/edit1.png" alt="" class="ot-ico"> Edit
          </button>
        </div>
      </div>
    </div>
  `;
}


/**
 * Binds change events to all subtask checkboxes inside the overlay.
 * @param {Object} task - The task object currently opened in the overlay.
 */
function bindSubtaskCheckboxHandlers(task) {
  const container = document.getElementById('ot-subtasks');
  if (!container) return;

  container.querySelectorAll('input[type="checkbox"][data-subidx]').forEach(cb => {
    cb.addEventListener('change', async (e) => {
      const index = parseInt(e.target.getAttribute('data-subidx'), 10);
      await toggleOverlaySubtask(task, index, e.target.checked);
    });
  });
}


/**
 * Toggles a single subtask (check/uncheck), updates it in the database
 * and re-renders the updated overlay.
 *
 * @param {Object} task - The task object.
 * @param {number} index - Index of the subtask to toggle.
 * @param {boolean} isChecked - True if the checkbox is checked.
 */
async function toggleOverlaySubtask(task, index, isChecked) {
  try {
    const fresh = await getTaskById(task.id) || task;
    const subtasks = Array.isArray(fresh.subtasks) ? [...fresh.subtasks] : [];
    if (index < 0 || index >= subtasks.length) return;

    // 1) update locally
    subtasks[index] = { ...subtasks[index], completed: !!isChecked };

    // 2) update DB
    let categoryKey = fresh.category ? categoryToDbKey(fresh.category) : null;
    if (!categoryKey && typeof findTaskAndCategoryIndex === 'function') {
      const pos = findTaskAndCategoryIndex(fresh.id);
      if (pos) {
        const map = ['to_do','in_progress','await_feedback','done'];
        categoryKey = map[pos.categoryIndex];
      }
    }
    if (!categoryKey) throw new Error('Category not resolvable for this task');

    const url = `${DATABASE_URL}/tasks/${categoryKey}/${fresh.id}/subtasks.json`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subtasks)
    });
    if (!res.ok) throw new Error(await res.text() || 'Failed to PUT subtasks');

    // 3) update in-memory copy
    if (typeof findTaskAndCategoryIndex === 'function') {
      const pos = findTaskAndCategoryIndex(fresh.id);
      if (pos) globalAllTasks[pos.categoryIndex][pos.taskIndex].subtasks = subtasks;
    }

    // 4) re-render overlay subtasks
    const latestTask = { ...fresh, subtasks, assigned_to: window.currentOverlayAssigned };
    const box = document.getElementById('ot-subtasks');
    if (box) {
      box.innerHTML = renderOverlaySubtasks(latestTask);
      bindSubtaskCheckboxHandlers(latestTask);
    }

    // 5) update global overlay subtasks memory
    window.editTaskSubtasks = subtasks;

    // requestAnimationFrame to ensure DOM is updated before computing progress
    if (typeof updateProgressBar === 'function') {
      requestAnimationFrame(() => updateProgressBar());
    }

  } catch (err) {
    console.error('Failed to toggle subtask:', err);
    alert('Failed to update subtask. Please try again.');
  }
}


/**
 * Handles the click on the "Edit" button inside the task overlay.
 * Closes the current overlay and opens the edit overlay for the given task.
 * @param {string} taskId - The ID of the task to edit.
 */
function handleOverlayEdit(taskId) {
  closeTaskOverlay();
  openEditTaskOverlay(taskId);
}


/**
 * Handles the click on the "Delete" button inside the task overlay.
 * Closes the current overlay and triggers the delete workflow.
 * @param {string} taskId - The ID of the task to delete.
 */
function handleOverlayDelete(taskId) {
  closeTaskOverlay();
  deleteTask(taskId);
}


/**
 * Normalizes different ID formats into a plain array of string IDs.
 * Supports arrays, objects with boolean map entries, and Firebase-style objects.
 *
 * @param {Array|string|Object|null} v - The raw value to normalize.
 * @returns {string[]} Normalized array of ID strings.
 */
function normalizeIds(v) {
  if (Array.isArray(v)) return v.filter(Boolean);
  if (typeof v === 'string') return [v];
  if (v && typeof v === 'object') {
    const vals = Object.values(v);
    if (vals.every(x => typeof x === 'string')) return vals;
    return Object.keys(v).filter(k => v[k]);
  }
  return [];
}

/**
 * General state holder for the current overlay's assigned users.
 * Stored globally on the window object.
 * 
 * @type {string[]} Array of user IDs assigned to the currently opened overlay.
 */
window.currentOverlayAssigned = [];


/**
 * Updates the overlay assignee state and re-renders the assigned contact chips.
 * @param {Array|string|Object} value - The new value for assigned users.
 * @param {HTMLElement} rootEl - The root element to use for rendering (overlay container).
 */
function setOverlayAssignees(value, rootEl) {
  window.currentOverlayAssigned = normalizeIds(value).map(String);
  renderTaskAssignedTo('openTaskAssignedToContainer', window.currentOverlayAssigned, rootEl);
}


/**
 * Renders the assignee chips used in both the board and the overlay.
 * @param {string} containerId - ID of the container to render into.
 * @param {string[]} ids - Array of user IDs.
 * @param {Document|HTMLElement} [root=document] - Root element in which to search for the container.
 */
function renderTaskAssignedTo(containerId, ids, root = document) {
  const box = root.querySelector(`#${containerId}`);
  if (!box) return;

  const users = (window.userData || []).filter(u => ids.includes(String(u.id)));
  if (!users.length) {
    box.innerHTML = '<span class="ot-muted">No assignees</span>';
    return;
  }

  box.innerHTML = users.map(u => `
    <div class="taskSingleContact" style="background-color:${u.color || '#999'}">
      <span>${escapeHtml(u.initials || '??')}</span>
    </div>
  `).join('');
}


/**
 * Renders the list of subtasks as checkbox items.
 * @param {Object} task - The task containing the subtasks.
 * @returns {string} HTML markup of the subtasks.
 */
function renderOverlaySubtasks(task) {
  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
  if (subtasks.length === 0) {
    return `<div class="ot-muted">No subtasks</div>`;
  }
  return subtasks.map((st, i) => `
    <label class="ot-subtask">
      <input type="checkbox" data-subidx="${i}" ${st.completed ? 'checked' : ''} />
      <span class="ot-subtask-text ${st.completed ? 'is-done' : ''}">${escapeHtml(st.title || '')}</span>
    </label>
  `).join('');
}


/**
 * Returns an HTML badge element representing the priority.
 * @param {string} priority - The priority (e.g. 'urgent', 'low', 'medium').
 * @returns {string} HTML string used to display the priority badge.
 */
function priorityBadge(priority) {
  const p = (priority || '').toLowerCase();
  if (p === 'urgent') return `<span class="pill pill-urgent">Urgent</span>`;
  if (p === 'low')    return `<span class="pill pill-low">Low</span>`;
  return `<span class="pill pill-medium">Medium</span>`;
}


/**
 * Formats a date string as DD/MM/YYYY.
 * @param {string|Date} d - Raw date value or ISO string.
 * @returns {string} Formatted date string or a placeholder if invalid.
 */
function formatDate(d) {
  if (!d) return `<span class="ot-muted">—</span>`;
  try {
    const dt = new Date(d);
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yy = dt.getFullYear();
    return `${dd}/${mm}/${yy}`;
  } catch {
    return escapeHtml(d);
  }
}


/**
 * Escapes special HTML characters in a string in order to prevent XSS.
 * @param {string} str - The raw string to escape.
 * @returns {string} Escaped/encoded string safe for innerHTML usage.
 */
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, s => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[s]));
}


/**
 * Closes the task overlay and reloads the board tasks (same as after a save).
 */
function closeTaskOverlay() {
  const overlay = document.getElementById('boardOverlay');
  overlay.style.display = 'none';
  overlay.innerHTML = '';

  if (typeof loadAndRenderBoardTasks === 'function') {
    loadAndRenderBoardTasks();
  }
}
