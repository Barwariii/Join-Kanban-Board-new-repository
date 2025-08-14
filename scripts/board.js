console.log("mySuperTestFunction: in board.js", typeof mySuperTestFunction);

// Load and render board tasks
let currentDraggedElement = null;
let globalAllTasks = [];

let currentEditedTaskId = null;

function categoryToDbKey(category) {
  const map = {
    toDo: "to_do",
    inProgress: "in_progress",
    awaitFeedback: "await_feedback",
    done: "done"
  };
  return map[category];
}


// Load & render all tasks
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


function renderToDoTasks(data) {
  const container = document.getElementById("toDoTasks");
  container.innerHTML = data.length ? data.map(task => taskTemplate(task, userData)).join('') : noTaskTemplate('"To Do"');
  // After inserting: Attach the event to all cards!
  if (data.length) {
    data.forEach(task => {
      const el = document.getElementById(task.id);
      if (el) {
        el.addEventListener('dragstart', () => startDraggingElement(task.id));
        el.addEventListener('dragend', () => removeClassForRotation(task.id));
      }
    });
  }
}

function renderInProgressTasks(data) {
  const container = document.getElementById("inProgressTasks");
  container.innerHTML = data.length ? data.map(task => taskTemplate(task, userData)).join('') : noTaskTemplate('"In progress"');
}
function renderAwaitFeedbackTasks(data) {
  const container = document.getElementById("awaitFeedbackTasks");
  container.innerHTML = data.length ? data.map(task => taskTemplate(task, userData)).join('') : noTaskTemplate('"Await feedback"');
}
function renderDoneTasks(data) {
  const container = document.getElementById("doneTasks");
  container.innerHTML = data.length ? data.map(task => taskTemplate(task, userData)).join('') : noTaskTemplate('"Done"');
}

// Drag & Drop functions
// Update Board
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


// Change Category Logical functions
// Get categoryIndex & taskIndex
function findTaskAndCategoryIndex(taskId) {
  for (let categoryIndex = 0; categoryIndex < globalAllTasks.length; categoryIndex++) {
    const taskIndex = globalAllTasks[categoryIndex].findIndex(t => t.id === taskId);
    if (taskIndex !== -1) return { categoryIndex, taskIndex };
  }
  return null;
}



// Get category array index
function getCategoryArrayIndex(category) {
  const categoryMap = {
    "toDo": 0,
    "inProgress": 1,
    "awaitFeedback": 2,
    "done": 3
  };

  return categoryMap[category];
}

//! Drag & Drop Functions nochmal überall anschauen wo was ist, wo was hingehört und 
//! dann einmal nochmal alles hier unten überarbeiten bzw. neu machen, Ansatz ist gut
//! aber nicht perfekt.

console.log('currentDraggedElement:', currentDraggedElement);
console.log('Alle Task-IDs:', globalAllTasks.flat().map(t => t.id));


// Move task and re-render
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


// Utilities for highlighting
function addClassForRotation(id) { document.getElementById(id).classList.add("rotateCard"); }
function removeClassForRotation(id) { document.getElementById(id).classList.remove("rotateCard"); }
function addHighlightClass(id) { document.getElementById(id).classList.add("containerGetHovered"); }
function removeHighlightClass(id) { document.getElementById(id).classList.remove("containerGetHovered"); }

// Fix loaded tasks to use correct category names
function fixTaskCategories() {
  const categories = ["toDo", "inProgress", "awaitFeedback", "done"];
  globalAllTasks.forEach((arr, i) => {
    arr.forEach(task => { task.category = categories[i]; });
  });
}


/**
 * open add task overlay
 */
// function openTaskBoard() {
//   // Overlay anzeigen, z.B.:
//   document.querySelector('.boardOverlay').style.display = 'block';
// }

// function openTaskBoard() {
//   document.querySelector('.boardOverlay').style.display = 'block';
//   // Optional: Den Iframe reloaden, damit Formular immer leer ist:
//   document.getElementById('addTaskIframe').contentWindow.location.reload(true);
// }

// function closeTaskBoard() {
//   document.querySelector('.boardOverlay').style.display = 'none';
// }

// ... wie oben, nochmal zur Sicherheit:
async function openTaskBoard() {
  const overlay = document.getElementById('boardOverlay');
  overlay.style.display = 'none';

  // 1) Fetch the HTML
  const resp = await fetch('../pages/board_overlay_add_task.html');
  const html = await resp.text();

  // 2) Parse and extract only the .addTaskOverlay element
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const frag = doc.querySelector('.addTaskOverlay').outerHTML;
  overlay.innerHTML = frag;

  // 3) Load the required scripts
  await loadScript('../scripts/database.js');
  await loadScript('../scripts/board_overlay_add_task.js');

  // 4) Show the overlay and start initialization
  overlay.style.display = 'block';
  addTaskOverlayInit();
}

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








function closeTaskBoard() {
  clearTask(); // Clear any task data
  const overlay = document.getElementById('boardOverlay');
  overlay.style.display = 'none';
  overlay.innerHTML = '';
}


function addTaskOverlayInit() {
  getUserDataForAddTask().then(() => {
    renderAssignedToList();
    // Bind the click
    document.getElementById('assignedTo').onclick = () => {
      toggleDropdownAssignedContacts();
      changeDropdownAssignedIcon();
      renderAssignedToList();
    };
  });
}





// Beim Laden des JS (falls Overlay offen), sofort initialisieren:
if (document.getElementById('assignedContactsUlItem')) {
  addTaskOverlayInit();
}


/**
 * 
 * open edit task overlay 
 */
async function openEditTaskOverlay(taskId) {
  currentEditedTaskId = taskId;

  // 1. Fetch the task data
  const task = await getTaskById(taskId);

  currentPriority = task.priority || '';

  editTaskSubtasks = task.subtasks ? [...task.subtasks] : [];

  // 2. Load and initialize the overlay
  const overlay = document.getElementById('boardOverlay');
  overlay.innerHTML = `
    <div class="edit-task-overlay">
      <h2>Edit Task</h2>
      
      <div class="form-group">
        <label>Title:</label>
        <input type="text" id="editTaskTitle" value="${task.title || ''}">
      </div>
      
      <div class="form-group">
        <label>Description:</label>
        <textarea id="editTaskDescription">${task.description || ''}</textarea>
      </div>
      
      <div class="form-group">
        <label>Due Date:</label>
        <input type="date" id="editTaskDueDate" value="${task.due_date || ''}">
      </div>
      
<div class="form-group">
  <label>Priority:</label>
  <div class="priority-options">
    <!-- زر Urgent -->
    <div id="editUrgent" class="priority-btn urgent-btn urgent-btn-hover ${task.priority === 'urgent' ? 'active' : ''}" 
         onclick="setPriority('urgent')">
      <span>Urgent</span>
      <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- SVG لرمز Urgent -->
        <path d="M18.9041 14.7547C18.6695 14.7551 18.441 14.6803 18.2521 14.5412L10 8.458L1.74797 14.5412C1.63212 14.6267 1.50054 14.6887 1.36073 14.7234C1.22093 14.7582 1.07565 14.7651 0.933183 14.7437C0.790715 14.7223 0.653851 14.6732 0.530406 14.599C0.406961 14.5247 0.299352 14.427 0.213723 14.3112C0.128094 14.1954 0.0661217 14.0639 0.031345 13.9243C-0.00343163 13.7846 -0.0103318 13.6394 0.0110384 13.497C0.0541974 13.2095 0.209888 12.9509 0.44386 12.7781L9.34797 6.20761C9.53667 6.06802 9.76524 5.99268 10 5.99268C10.2348 5.99268 10.4634 6.06802 10.6521 6.20761L19.5562 12.7781C19.7421 12.915 19.88 13.1071 19.9501 13.327C20.0203 13.5469 20.0191 13.7833 19.9468 14.0025C19.8745 14.2216 19.7348 14.4124 19.5475 14.5475C19.3603 14.6826 19.1351 14.7551 18.9041 14.7547Z" fill="#FF3D00"/>
        <path d="M18.9042 9.00568C18.6695 9.00609 18.441 8.93124 18.2521 8.79214L10.0001 2.70898L1.748 8.79214C1.51403 8.96495 1.22095 9.0378 0.933218 8.99468C0.645491 8.95155 0.386693 8.79597 0.213758 8.56218C0.0408221 8.32838 -0.0320856 8.03551 0.0110734 7.74799C0.0542325 7.46048 0.209923 7.20187 0.443895 7.02906L9.348 0.458588C9.5367 0.318997 9.76528 0.243652 10.0001 0.243652C10.2348 0.243652 10.4634 0.318997 10.6521 0.458588L19.5562 7.02906C19.7421 7.16598 19.88 7.35809 19.9502 7.57797C20.0203 7.79785 20.0192 8.03426 19.9469 8.25344C19.8746 8.47262 19.7348 8.66338 19.5476 8.79847C19.3603 8.93356 19.1351 9.00608 18.9042 9.00568Z" fill="#FF3D00"/>
      </svg>
    </div>
    
    <!-- زر Medium -->
    <div id="editMedium" class="priority-btn medium-btn medium-btn-hover ${task.priority === 'medium' ? 'active' : ''}" 
         onclick="setPriority('medium')">
      <span>Medium</span>
      <svg width="20" height="9" viewBox="0 0 20 9" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- SVG لرمز Medium -->
        <path d="M18.9041 8.22528H1.09589C0.805242 8.22528 0.526498 8.10898 0.320979 7.90197C0.11546 7.69495 0 7.41419 0 7.12143C0 6.82867 0.11546 6.5479 0.320979 6.34089C0.526498 6.13388 0.805242 6.01758 1.09589 6.01758H18.9041C19.1948 6.01758 19.4735 6.13388 19.679 6.34089C19.8845 6.5479 20 6.82867 20 7.12143C20 7.41419 19.8845 7.69495 19.679 7.90197C19.4735 8.10898 19.1948 8.22528 18.9041 8.22528Z" fill="#ffa800"/>
        <path d="M18.9041 2.98211H1.09589C0.805242 2.98211 0.526498 2.86581 0.320979 2.6588C0.11546 2.45179 0 2.17102 0 1.87826C0 1.5855 0.11546 1.30474 0.320979 1.09772C0.526498 0.890712 0.805242 0.774414 1.09589 0.774414L18.9041 0.774414C19.1948 0.774414 19.4735 0.890712 19.679 1.09772C19.8845 1.30474 20 1.5855 20 1.87826C20 2.17102 19.8845 2.45179 19.679 2.6588C19.4735 2.86581 19.1948 2.98211 18.9041 2.98211Z" fill="#ffa800"/>
      </svg>
    </div>
    
    <!-- زر Low -->
    <div id="editLow" class="priority-btn low-btn low-btn-hover ${task.priority === 'low' ? 'active' : ''}" 
         onclick="setPriority('low')">
      <span>Low</span>
      <svg width="21" height="15" viewBox="0 0 21 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- SVG لرمز Low -->
        <path d="M10.5 9.00614C10.2654 9.00654 10.0369 8.9317 9.84802 8.79262L0.944913 2.22288C0.829075 2.13733 0.731235 2.02981 0.65698 1.90647C0.582724 1.78313 0.533508 1.64638 0.51214 1.50404C0.468986 1.21655 0.541885 0.923717 0.714802 0.689945C0.887718 0.456173 1.14649 0.300615 1.43418 0.257493C1.72188 0.21437 2.01493 0.287216 2.24888 0.460004L10.5 6.54248L18.7511 0.460004C18.867 0.374448 18.9985 0.312529 19.1383 0.277782C19.2781 0.243035 19.4234 0.236141 19.5658 0.257493C19.7083 0.278844 19.8451 0.328025 19.9685 0.402225C20.092 0.476425 20.1996 0.574193 20.2852 0.689945C20.3708 0.805697 20.4328 0.937168 20.4676 1.07685C20.5023 1.21653 20.5092 1.36169 20.4879 1.50404C20.4665 1.64638 20.4173 1.78313 20.343 1.90647C20.2688 2.02981 20.1709 2.13733 20.0551 2.22288L11.152 8.79262C10.9631 8.9317 10.7346 9.00654 10.5 9.00614Z" fill="#7AE229"/>
        <path d="M10.5 14.7547C10.2654 14.7551 10.0369 14.6802 9.84802 14.5412L0.944913 7.97142C0.710967 7.79863 0.555294 7.54005 0.51214 7.25257C0.468986 6.96509 0.541886 6.67225 0.714802 6.43848C0.887718 6.20471 1.14649 6.04915 1.43418 6.00603C1.72188 5.96291 2.01493 6.03575 2.24888 6.20854L10.5 12.291L18.7511 6.20854C18.9851 6.03575 19.2781 5.96291 19.5658 6.00603C19.8535 6.04915 20.1123 6.20471 20.2852 6.43848C20.4581 6.67225 20.531 6.96509 20.4879 7.25257C20.4447 7.54005 20.289 7.79863 20.0551 7.97142L11.152 14.5412C10.9631 14.6802 10.7346 14.7551 10.5 14.7547Z" fill="#7AE229"/>
      </svg>
    </div>
  </div>
</div>
      
      <div class="form-group">
        <label>Assigned Contacts:</label>
        <div class="assigned-to-dropdown">
          <div class="dropdown-input" onclick="toggleContactsDropdown()">
            <span>Select contacts</span>
            <img src="../assets/icons/arrow_drop_down.svg" alt="dropdown" id="contactsDropdownIcon">
          </div>
          <div class="dropdown-content" id="contactsDropdown">
            ${renderAssignableContacts(task.assigned_to || [])}
          </div>
          <div class="selected-contacts" id="selectedContacts">
            ${renderSelectedContacts(task.assigned_to || [])}
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <label>Subtasks:</label>
        <div class="edit-new-subtask">
          <input type="text" id="newSubtaskInput" placeholder="New subtask">
          <button onclick="addSubtaskForEdit()">+</button>
        </div>
        <div id="subtasksList">
          ${renderSubtasks(task.subtasks || [])}
        </div>
      </div>
      
      <div class="edit-task-actions">
        <button onclick="saveEditedTask()" class="save-btn">Save Changes</button>
        <button onclick="closeEditOverlay()" class="cancel-btn">Cancel</button>
      </div>
    </div>
  `;

  overlay.style.display = 'block';

    // When creating the overlay, make sure to set the active button
  setTimeout(() => {
    if (currentPriority) {
      setPriority(currentPriority);
    }
  }, 0);
}

async function getTaskById(taskId) {
  // Search for the task in all stages
  for (const category of globalAllTasks) {
    const foundTask = category.find(t => t.id === taskId);
    if (foundTask) return foundTask;
  }
  return null;
}


async function saveEditedTask() {
  if (!currentEditedTaskId) return;

  // 1. Collect the modified data
  const updatedTask = {
    title: document.getElementById('editTaskTitle').value,
    description: document.getElementById('editTaskDescription').value,
    priority: currentPriority,
    // You can add more fields here
  };

  // 2. Update the task in the database
  const task = await getTaskById(currentEditedTaskId);
  const categoryKey = categoryToDbKey(task.category);

  await fetch(`${DATABASE_URL}/tasks/${categoryKey}/${currentEditedTaskId}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedTask)
  });

  // 3. Reload the data and close the overlay
  loadAndRenderBoardTasks();
  closeEditOverlay();
}


/**
 * priority functions
 */
let currentPriority = ''; // To store the selected value

function setPriority(priority) {
  currentPriority = priority;

  // Remove the active class from all buttons
  document.querySelectorAll('.priority-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Add the active class to the selected button
  const activeBtn = document.getElementById(`edit${priority.charAt(0).toUpperCase() + priority.slice(1)}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
}

/**
 * helper function to render assignable contacts, substasks, etc.
 */

/**
 * 
 * @param {*} assignedIds 
 * @returns 
 * Display the assignable contacts
 * Display the contacts in the dropdown menu
 */
function renderAssignableContacts(assignedIds = []) {
  return userData.map(user => `
    <div class="contact-option" onclick="toggleContactSelection('${user.id}')">
      <div class="contact-badge" style="background-color:${user.color}">
        ${user.initials}
      </div>
      <span>${user.name}</span>
      <input type="checkbox" 
             id="contact-${user.id}" 
             value="${user.id}" 
             ${assignedIds.includes(user.id) ? 'checked' : ''}
             style="display:none">
    </div>
  `).join('');
}


/**
 * 
 * @param {*} assignedIds 
 * @returns Display the selected contacts
 */
function renderSelectedContacts(assignedIds = []) {
  return assignedIds.map(id => {
    const user = userData.find(u => u.id === id);
    if (!user) return '';
    return `
      <div class="selected-contact" data-id="${user.id}">
        <span style="background-color:${user.color}">${user.initials}</span>
        <span class="contact-name">${user.name}</span>
        <span class="remove-contact" onclick="removeContact('${user.id}')">×</span>
      </div>
    `;
  }).join('');
}


/**
 * Toggle the display of the dropdown menu
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
 * 
 * @param {*} contactId 
 * Select/deselect a contact
 */
function toggleContactSelection(contactId) {
  const checkbox = document.getElementById(`contact-${contactId}`);
  checkbox.checked = !checkbox.checked;
  updateSelectedContacts();
}


/**
 * 
 * @param {*} contactId 
 * Remove a selected contact
 */
function removeContact(contactId) {
  const checkbox = document.getElementById(`contact-${contactId}`);
  if (checkbox) checkbox.checked = false;
  updateSelectedContacts();
}


/**
 * Update the display of selected contacts
 */
function updateSelectedContacts() {
  const selectedIds = Array.from(document.querySelectorAll('.contact-option input[type="checkbox"]:checked'))
    .map(checkbox => checkbox.value);

  document.getElementById('selectedContacts').innerHTML = renderSelectedContacts(selectedIds);
}


/**
 * 
 * @param {*} subtasks 
 * @returns Display the subtasks
 */
function renderSubtasks(subtasks = []) {
  return subtasks.map((subtask, index) => `
    <div class="subtask-item" data-index="${index}">
      <span id="subtaskInput">${subtask.title}</span>
      <button onclick="removeEditTaskSubtask(${index})" class="remove-subtask">×</button>
    </div>
  `).join('');
}


/**
 * 
 * @returns Add a new subtask
 */
function addSubtaskForEdit() {
  const input = document.getElementById('newSubtaskInput');
  if (!input || !input.value.trim()) return;

  editTaskSubtasks.push({ title: input.value.trim(), completed: false });
  input.value = '';
  renderSubtasksForEdit();
}

function renderSubtasksForEdit() {
  const container = document.getElementById('subtasksList');
  if (!container) return;

  container.innerHTML = editTaskSubtasks.map((subtask, index) => `
    <div class="subtask-item" data-index="${index}">
      <span id="subtaskInput">${subtask.title}</span>
      <button onclick="removeEditTaskSubtask(${index})" class="remove-subtask">×</button>
    </div>
  `).join('');
}

function removeEditTaskSubtask(index) {
  editTaskSubtasks.splice(index, 1);
  renderSubtasksForEdit();
}

window.removeEditTaskSubtask = removeEditTaskSubtask;






/**
 * save edited Task
 */
async function saveEditedTask() {
  if (!currentEditedTaskId) return;

  try {
    // Collect the data from the form
    const updatedTask = {
      title: document.getElementById('editTaskTitle').value,
      description: document.getElementById('editTaskDescription').value,
      due_date: document.getElementById('editTaskDueDate').value,
      priority: currentPriority,

      // Collect the selected contacts
      assigned_to: Array.from(document.querySelectorAll('.contact-option input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value),

      // Collect the subtasks
      subtasks: editTaskSubtasks
    };

    const task = await getTaskById(currentEditedTaskId);
    const categoryKey = categoryToDbKey(task.category);

    // Merge the changes with the original data
    const mergedTask = { ...task, ...updatedTask };

    console.log('Saving to:', `${DATABASE_URL}/tasks/${categoryKey}/${currentEditedTaskId}.json`);
    console.log('Data:', mergedTask);

    const res = await fetch(`${DATABASE_URL}/tasks/${categoryKey}/${currentEditedTaskId}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mergedTask)
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("API error:", err);
      alert("Failed to save changes!\n" + err);
      return;
    }


    loadAndRenderBoardTasks();
    closeEditOverlay();
  } catch (error) {
    console.error("Error saving task:", error);
    alert("Failed to save changes. Please try again.");
  }
}


/**
 * close edit overlay
 */
function closeEditOverlay() {
  editTaskSubtasks = [];
  const overlay = document.getElementById('boardOverlay');
  overlay.style.display = 'none';
  overlay.innerHTML = '';
  currentEditedTaskId = null;
}




/**
 *  delete task
 */
function showDeleteConfirmOverlay(onConfirm) {
  const overlay = document.getElementById('boardOverlay');
  overlay.innerHTML = `
    <div class="delete-confirm-overlay">
      <div class="delete-confirm-box">
        <span>Are you sure you want to delete this task?</span>
        <div class="delete-confirm-actions">
          <button id="deleteConfirmYes" class="confirm-btn">Yes</button>
          <button id="deleteConfirmNo" class="cancel-btn">No</button>
        </div>
      </div>
    </div>
  `;
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

async function deleteTask(taskId) {
  showDeleteConfirmOverlay(async () => {
    // 1. Search for the task to know which category it belongs to
    const task = await getTaskById(taskId);
    if (!task) return;

    const categoryKey = categoryToDbKey(task.category);

    // 2. Delete the task from the database
    await fetch(`${DATABASE_URL}/tasks/${categoryKey}/${taskId}.json`, {
      method: "DELETE"
    });

    // 3. Reload the data
    loadAndRenderBoardTasks();
  });
}


// search input
function filterTasksBySearch() {
  const searchTerm = document.getElementById("taskSearchInput").value.toLowerCase();

  // Filter for each section
  const [toDo, inProgress, awaitFeedback, done] = globalAllTasks;

  const filteredToDo = toDo.filter(t => taskMatchesSearch(t, searchTerm));
  const filteredInProgress = inProgress.filter(t => taskMatchesSearch(t, searchTerm));
  const filteredAwaitFeedback = awaitFeedback.filter(t => taskMatchesSearch(t, searchTerm));
  const filteredDone = done.filter(t => taskMatchesSearch(t, searchTerm));

  // Re-render only according to the results
  renderToDoTasks(filteredToDo);
  renderInProgressTasks(filteredInProgress);
  renderAwaitFeedbackTasks(filteredAwaitFeedback);
  renderDoneTasks(filteredDone);
}

function taskMatchesSearch(task, searchTerm) {
  return (
    task.title.toLowerCase().includes(searchTerm) ||
    task.description.toLowerCase().includes(searchTerm)
  );
}
