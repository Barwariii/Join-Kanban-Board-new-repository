/** JSDoc: Public exports and local stores. */
window.getUserDataForAddTask = getUserDataForAddTask;
window.addTaskOverlayInit = addTaskOverlayInit;

addTaskUserData = [];

let addTaskSubtasks = [];
let editingSubtaskIndex = null;

/**
 * Fetch users for "Assigned to" source and prime local state.
 * @param {string} [path="/users"]
 * @returns {Promise<void>}
 */
async function getUserDataForAddTask(path = "/users") {
  try {
    let userResponse = await fetch(DATABASE_URL + path + ".json");
    let userResponseJson = await userResponse.json();

    addTaskUserData = [];

    if (userResponseJson) {
      Object.keys(userResponseJson).forEach(key => {
        addTaskUserData.push({
          id: key,
          initials: userResponseJson[key].initials,
          name: userResponseJson[key].name,
          color: userResponseJson[key].color,
          isToggled: false
        });
      });
    }
  } catch (error) {
    console.error("Error loading DB-Data:", error);
  }
}


/**
 * Set default priority to "Medium" (UI only).
 * @returns {void}
 */
function setDefaultPriorityMedium() {
  const { urgent, medium, low } = prioEls();
  if (!urgent || !medium || !low) return;

  medium.classList.add('active');
  medium.classList.remove('mediumHover');

  urgent.classList.remove('active');
  urgent.classList.add('urgentHover');
  low.classList.remove('active');
  low.classList.add('lowHover');
}


/**
 * Template for a single "Assigned to" user (delegates to template file).
 * @param {{id:string, initials:string, name:string, color:string}} singleUser
 * @param {number} i
 * @returns {string}
 */
function assignedToSingleUserTemplate(singleUser, i) {
  return add_task_contact_li_template(singleUser, i);
}


/**
 * Render the "Assigned to" list and current toggle states.
 * @returns {void}
 */
function renderAssignedToList() {
  let ulItem = document.getElementById("assignedContactsUlItem");
  ulItem.innerHTML = "";

  for (let i = 0; i < addTaskUserData.length; i++) {
    const singleUser = addTaskUserData[i];
    ulItem.innerHTML += assignedToSingleUserTemplate(singleUser, i);

    const contactElement = document.getElementById(addTaskUserData[i].id);
    renderToggleCheckbox(contactElement, i);
  }
}
window.renderAssignedToList = renderAssignedToList;

/** JSDoc: Bootstrapping SVG templates for assigned contacts (no logic change). */
const uncheckedSVG = ADD_TASK_UNCHECKED_SVG;
const checkedSVG = ADD_TASK_CHECKED_SVG;

const contacts = document.querySelectorAll('.contact');
for (let i = 0; i < contacts.length; i++) {
  const contact = contacts[i];
  const checkboxDiv = contact.querySelector('.checkbox');
  if (checkboxDiv) checkboxDiv.innerHTML = checkedSVG;
}


/**
 * Toggle a specific contact checkbox and UI active class.
 * @param {HTMLElement} contactElement
 * @param {number} i
 * @returns {void}
 */
function toggleCheckbox(contactElement, i) {
  let unchecked = document.getElementById(`unCheckedBox${i}`);
  let checked = document.getElementById(`checkedBox${i}`);

  if (!unchecked || !checked) {
    unchecked = contactElement.querySelector('.unchecked');
    checked = contactElement.querySelector('.checked');
  }

  if (addTaskUserData[i].isToggled) {
    unchecked.classList.remove('hideCheckBox');
    checked.classList.add('hideCheckBox');
    addTaskUserData[i].isToggled = false;
  } else {
    unchecked.classList.add('hideCheckBox');
    checked.classList.remove('hideCheckBox');
    addTaskUserData[i].isToggled = true;
  }

  contactElement.classList.toggle('active');
}
window.toggleCheckbox = toggleCheckbox;


/**
 * Render current checkbox state for a given contact row.
 * @param {HTMLElement} contactElement
 * @param {number} i
 * @returns {void}
 */
function renderToggleCheckbox(contactElement, i) {
  const unchecked = document.getElementById(`unCheckedBox${i}`);
  const checked = document.getElementById(`checkedBox${i}`);

  if (!unchecked || !checked) return;

  if (addTaskUserData[i].isToggled) {
    unchecked.classList.add('hideCheckBox');
    checked.classList.remove('hideCheckBox');
    contactElement.classList.add('active');
  } else {
    unchecked.classList.remove('hideCheckBox');
    checked.classList.add('hideCheckBox');
    contactElement.classList.remove('active');
  }
}
window.renderToggleCheckbox = renderToggleCheckbox;


/**
 * Toggle Assigned-contacts dropdown visibility and refresh preview.
 * @returns {void}
 */
function toggleDropdownAssignedContacts() {
  const assignedContacts = document.getElementById('assignedContacts');
  assignedContacts.classList.toggle('hiddenAssignedContacts');
  updateSelectedContacts();
}
window.toggleDropdownAssignedContacts = toggleDropdownAssignedContacts;

/**
 * Switch "Assigned" chevron icons (up/down), then update preview.
 * @returns {void}
 */
function changeDropdownAssignedIcon() {
  const arrowDown = document.getElementById('arrowDown');
  const arrowUp = document.getElementById('arrowUp');

  if (arrowDown.style.display === 'none') {
    arrowDown.style.display = 'flex';
    arrowUp.style.display = 'none';
  } else {
    arrowDown.style.display = 'none';
    arrowUp.style.display = 'flex';
  }
  updateSelectedContacts();
}
window.changeDropdownAssignedIcon = changeDropdownAssignedIcon;


/**
 * Update chosen contacts preview (avatars) under the input.
 * @returns {void}
 */
function updateSelectedContacts() {
  const selectedContactsContainer = document.querySelector('.showSelectedContact');
  selectedContactsContainer.innerHTML = '';

  const activeContacts = document.querySelectorAll('.contact.active');

  activeContacts.forEach(contact => {
    const contactAvatar = contact.querySelector('.contactAvatar').cloneNode(true);
    contactAvatar.classList.add('showncontactAvatar');
    selectedContactsContainer.appendChild(contactAvatar);
  });
}


/**
 * Return priority elements references each time.
 * @returns {{urgent:HTMLElement|null, medium:HTMLElement|null, low:HTMLElement|null}}
 */
function prioEls() {
  return {
    urgent: document.getElementById('urgent'),
    medium: document.getElementById('medium'),
    low: document.getElementById('low'),
  };
}


/**
 * Toggle "Urgent", "Medium" and "Low" priority button.
 * @returns {void}
 */
function toggleUrgent() {
  const { urgent, medium, low } = prioEls();
  if (!urgent || !medium || !low) return;

  if (urgent.classList.contains('active')) {
    urgent.classList.remove('active');
    urgent.classList.add('urgentHover');
    medium.classList.add('mediumHover');
    low.classList.add('lowHover');
  } else {
    urgent.classList.add('active');
    urgent.classList.remove('urgentHover');
    medium.classList.add('mediumHover');
    low.classList.add('lowHover');
    low.classList.remove('active');
    medium.classList.remove('active');
  }
  validateAddTaskForm();
}
window.toggleUrgent = toggleUrgent;


function toggleMedium() {
  const { urgent, medium, low } = prioEls();
  if (!urgent || !medium || !low) return;

  if (medium.classList.contains('active')) {
    medium.classList.remove('active');
    medium.classList.add('mediumHover');
    urgent.classList.add('urgentHover');
    low.classList.add('lowHover');
  } else {
    medium.classList.add('active');
    medium.classList.remove('mediumHover');
    urgent.classList.add('urgentHover');
    low.classList.add('lowHover');
    urgent.classList.remove('active');
    low.classList.remove('active');
  }
  validateAddTaskForm();
}
window.toggleMedium = toggleMedium;


function toggleLow() {
  const { urgent, medium, low } = prioEls();
  if (!urgent || !medium || !low) return;

  if (low.classList.contains('active')) {
    low.classList.remove('active');
    low.classList.add('lowHover');
    urgent.classList.add('urgentHover');
    medium.classList.add('mediumHover');
  } else {
    low.classList.add('active');
    low.classList.remove('lowHover');
    urgent.classList.add('urgentHover');
    medium.classList.add('mediumHover');
    urgent.classList.remove('active');
    medium.classList.remove('active');
  }
}
window.toggleLow = toggleLow;


/**
 * Toggle Category dropdown visibility.
 * @returns {void}
 */
function toggleDropdownCategory() {
  const categoryTasks = document.getElementById('categoryTasks');
  categoryTasks.classList.toggle('hiddenCategoryTasks');
}


/**
 * Switch category chevrons and keep state in UI.
 * @returns {void}
 */
function changeDropdownCategoryIcon() {
  const arrowDown = document.getElementById('arrowDownCategory');
  const arrowUp = document.getElementById('arrowUpCategory');

  if (arrowDown.style.display === 'none') {
    arrowDown.style.display = 'flex';
    arrowUp.style.display = 'none';
  } else {
    arrowDown.style.display = 'none';
    arrowUp.style.display = 'flex';
  }
}


/**
 * Select a category, validate, close dropdown, and flip icon.
 * @param {string} category
 * @returns {void}
 */
function selectCategory(category) {
  const selectedCategoryElement = document.getElementById('selectedCategory');
  selectedCategoryElement.textContent = category;
  validateAddTaskForm();
  toggleDropdownCategory();
  changeDropdownCategoryIcon();
}
window.selectCategory = selectCategory;


/**
 * Add a subtask (Add-Task overlay) and re-render list.
 * @returns {void}
 */
function addSubtaskForAddTask() {
  const input = document.getElementById('subtasks');
  const subtaskText = input.value.trim();

  if (subtaskText) {
    addTaskSubtasks.push(subtaskText);
    input.value = '';
    renderSubtasksForAddTask();
  }
}


/**
 * Render all subtasks rows in Add-Task overlay.
 * @returns {void}
 */
function renderSubtasksForAddTask() {
  const container = document.getElementById('showAddedSubtasks');
  container.innerHTML = '';

  addTaskSubtasks.forEach((task, index) => {
    const taskEscaped = escHtml(task);
    if (editingSubtaskIndex === index) {
      container.innerHTML += add_task_subtask_row_edit_template(index, taskEscaped);
    } else {
      container.innerHTML += add_task_subtask_row_template(index, taskEscaped);
    }
  });
}


/**
 * Remove a subtask by index (Add-Task overlay) and re-render.
 * @param {number} index
 * @returns {void}
 */
function removeAddTaskSubtask(index) {
  addTaskSubtasks.splice(index, 1);
  renderSubtasksForAddTask();
}


/**
 * Switch a subtask row into editing mode.
 * @param {number} i
 * @returns {void}
 */
function editSubtask(i) {
  editingSubtaskIndex = i;
  renderSubtasksForAddTask();
  setTimeout(() => document.getElementById(`editSubtaskInput${i}`)?.focus(), 0);
}


/**
 * Save edited subtask and exit editing mode.
 * @param {number} i
 * @returns {void}
 */
function saveSubtask(i) {
  const el = document.getElementById(`editSubtaskInput${i}`);
  if (!el) return;
  const val = el.value.trim();
  if (val) addTaskSubtasks[i] = val;
  editingSubtaskIndex = null;
  renderSubtasksForAddTask();
}


/**
 * Cancel editing mode for subtasks.
 * @returns {void}
 */
function cancelEdit() {
  editingSubtaskIndex = null;
  renderSubtasksForAddTask();
}


/**
 * Handle Enter/Escape while editing a subtask inline.
 * @param {KeyboardEvent} e
 * @param {number} i
 * @returns {void}
 */
function handleEditKey(e, i) {
  if (e.key === 'Enter') saveSubtask(i);
  if (e.key === 'Escape') cancelEdit();
}


/**
 * Safe HTML escaping helper for inline text.
 * @param {string} s
 * @returns {string}
 */
function escHtml(s) {
  return s.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#39;'
  }[m]));
}
