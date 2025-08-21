// =====================================
// Globals
// =====================================
addTaskUserData = [];
let subtasks = [];


// =====================================
// Fetch Users (Assigned-To source)
// =====================================
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
          isToggled: false // here initialize isToggled
        });
      });
      console.log(addTaskUserData);
    }

  } catch (error) {
    console.error("Error loading DB-Data:", error);
  }
}


// =====================================
// Priority Default (Medium)
// =====================================
function setDefaultPriorityMedium() {
  // Medium aktiv
  medium.classList.add('active');
  medium.classList.remove('mediumHover');

  // Andere auf Hover-Style setzen
  urgent.classList.remove('active');
  urgent.classList.add('urgentHover');
  low.classList.remove('active');
  low.classList.add('lowHover');
}


// =====================================
// Assigned-To: Template & Render
// =====================================
//! Template function for assigned to
function assignedToSingleUserTemplate(singleUser, i) {
  return /*html*/`
                                  <li>
                                    <div id="${singleUser.id}" class="contact" onclick="toggleCheckbox(this, ${i})">
                                        <div class="contactIformation">
                                            <span class="contactAvatar" style="background-color: ${singleUser.color}">${singleUser.initials}</span>
                                            <span>${singleUser.name}</span>
                                        </div>

                                        <div class="checkbox" id="checkbox">
                                          <svg id="unCheckedBox${i}" class="unchecked" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                              <rect x="4" y="4.96582" width="16" height="16" rx="3" stroke="#4589FF" stroke-width="2"/>
                                          </svg>
                                          <svg id="checkedBox${i}" class="checked hideCheckBox" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                              <path d="M20 11.9658V17.9658C20 19.6227 18.6569 20.9658 17 20.9658H7C5.34315 20.9658 4 19.6227 4 17.9658V7.96582C4 6.30897 5.34315 4.96582 7 4.96582H15" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
                                              <path d="M8 12.9658L12 16.9658L20 5.46582" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                          </svg>
                                        </div>
                                    </div>
                                  </li>
  `;
}

function renderAssignedToList() {
  let ulItem = document.getElementById("assignedContactsUlItem");
  ulItem.innerHTML = "";

  for (let i = 0; i < addTaskUserData.length; i++) {
    const singleUser = addTaskUserData[i];
    ulItem.innerHTML += assignedToSingleUserTemplate(singleUser, i);

    // Render Checkbox state
    const contactElement = document.getElementById(singleUser.id);
    renderToggleCheckbox(contactElement, i);
  }
}


// =====================================
// Assigned-To: SVG Templates & Bootstrapping
// =====================================
// * Select assigned Contacts
// Add the SVG only once as a template
const uncheckedSVG = `
  <svg class="unchecked" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4.96582" width="16" height="16" rx="3" stroke="#4589FF" stroke-width="2"/>
  </svg>`;

const checkedSVG = `
  <svg class="checked hideCheckBox" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 11.9658V17.9658C20 19.6227 18.6569 20.9658 17 20.9658H7C5.34315 20.9658 4 19.6227 4 17.9658V7.96582C4 6.30897 5.34315 4.96582 7 4.96582H15" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
      <path d="M8 12.9658L12 16.9658L20 5.46582" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

//* Get all contacts
const contacts = document.querySelectorAll('.contact');

// For loop through all contacts
for (let i = 0; i < contacts.length; i++) {
  const contact = contacts[i];

  // Add checkbox (once)
  const checkboxDiv = contact.querySelector('.checkbox');
  checkboxDiv.innerHTML = checkedSVG;
}


// =====================================
// Assigned-To: Toggle + Render Toggle
// =====================================
//! Funktion für Checkbox umschalten
function toggleCheckbox(contactElement, i) {

  const unchecked = document.getElementById(`unCheckedBox${i}`);
  const checked = document.getElementById(`checkedBox${i}`);

  // Toggle visibility of the checkbox
  if (addTaskUserData[i].isToggled) {
    unchecked.classList.remove('hideCheckBox');
    checked.classList.add('hideCheckBox');

    addTaskUserData[i].isToggled = false;
  } else {
    unchecked.classList.add('hideCheckBox');
    checked.classList.remove('hideCheckBox');

    addTaskUserData[i].isToggled = true;
  }

  // Mark the contact as active (light blue)
  contactElement.classList.toggle('active');

}

//! Funktion für Checkbox umschalten
function renderToggleCheckbox(contactElement, i) {

  const unchecked = document.getElementById(`unCheckedBox${i}`);
  const checked = document.getElementById(`checkedBox${i}`);

  if (!unchecked || !checked) return;

  // Toggle visibility of the checkbox
  if (addTaskUserData[i].isToggled) {
    unchecked.classList.add('hideCheckBox');
    checked.classList.remove('hideCheckBox');

    // Add the class 'active' if isToggled is true
    contactElement.classList.add('active');

  } else {
    unchecked.classList.remove('hideCheckBox');
    checked.classList.add('hideCheckBox');

    // Remove the class 'active' if isToggled is false
    contactElement.classList.remove('active');
  }
}


// =====================================
// Assigned-To Dropdown (open/close + outside/esc)
// =====================================
// verhindert Bubbling im Dropdown (Alternative zu onclick im HTML)
(function initAssignedDropdownShield() {
  const dd = document.getElementById('assignedContacts');
  if (dd) dd.addEventListener('click', e => e.stopPropagation());
})();

function toggleDropdownAssignedContacts(ev) {
  if (ev) ev.stopPropagation(); // Klick auf das Feld selbst nicht als Outside zählen
  const dd = document.getElementById('assignedContacts');
  dd.classList.toggle('hiddenAssignedContacts');
  const isOpen = !dd.classList.contains('hiddenAssignedContacts');

  if (isOpen) {
    document.addEventListener('click', handleOutsideAssignedClick);
    document.addEventListener('keydown', handleEscapeAssigned);
  } else {
    document.removeEventListener('click', handleOutsideAssignedClick);
    document.removeEventListener('keydown', handleEscapeAssigned);
  }
  updateSelectedContacts();
}

function handleOutsideAssignedClick(e) {
  const dd = document.getElementById('assignedContacts');
  const toggle = document.getElementById('assignedTo'); // dein Feld
  if (!dd.contains(e.target) && !toggle.contains(e.target)) {
    closeAssignedDropdown();
  }
}

function handleEscapeAssigned(e) {
  if (e.key === 'Escape') closeAssignedDropdown();
}

function closeAssignedDropdown() {
  const dd = document.getElementById('assignedContacts');
  if (!dd || dd.classList.contains('hiddenAssignedContacts')) return;
  dd.classList.add('hiddenAssignedContacts');

  // Pfeil zurücksetzen (optional)
  const arrowDown = document.getElementById('arrowDown');
  const arrowUp = document.getElementById('arrowUp');
  if (arrowDown && arrowUp) { arrowDown.style.display = 'flex'; arrowUp.style.display = 'none'; }

  document.removeEventListener('click', handleOutsideAssignedClick);
  document.removeEventListener('keydown', handleEscapeAssigned);

  updateSelectedContacts();
}

// change assiend icon
function changeDropdownAssignedIcon() {
  const arrowDown = document.getElementById('arrowDown');
  const arrowUp = document.getElementById('arrowUp');

  if (arrowDown.style.display === 'none') {
    // Show arrow down, hide arrow up
    arrowDown.style.display = 'flex';
    arrowUp.style.display = 'none';
  } else {
    // Hide arrow down, show arrow up
    arrowDown.style.display = 'none';
    arrowUp.style.display = 'flex';
  }
  updateSelectedContacts();
}

// Function to display the selected contacts in showSelectedContact
function updateSelectedContacts() {
  const selectedContactsContainer = document.querySelector('.showSelectedContact');
  selectedContactsContainer.innerHTML = ''; // Remove old entries

  // Find all active contacts (selected contacts)
  const activeContacts = document.querySelectorAll('.contact.active');

  // Add the initials of each selected contact
  activeContacts.forEach(contact => {
    const contactAvatar = contact.querySelector('.contactAvatar').cloneNode(true); // Clone the contact avatar
    contactAvatar.classList.add('showncontactAvatar'); // Add class if needed
    selectedContactsContainer.appendChild(contactAvatar); // Add avatar to the display
  });
}


// =====================================
// Priority Buttons (Urgent/Medium/Low)
// =====================================
const urgent = document.getElementById('urgent');
const medium = document.getElementById('medium');
const low = document.getElementById('low');

function toggleUrgent() {
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

function toggleMedium() {
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

function toggleLow() {
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
  validateAddTaskForm();
}


// =====================================
// Category Dropdown (first simple version)
// =====================================
function toggleDropdownCategory() {
  const categoryTasks = document.getElementById('categoryTasks');
  // Toggle the 'hidden' class on or off
  categoryTasks.classList.toggle('hiddenCategoryTasks');
}

function selectCategory(category) {
  const selectedCategoryElement = document.getElementById('selectedCategory');
  selectedCategoryElement.textContent = category;
  closeCategoryDropdown();
}


// =====================================
// Category Dropdown (enhanced version - overrides the first)
// =====================================
function toggleDropdownCategory(ev) {
  if (ev) ev.stopPropagation();
  const dd = document.getElementById('categoryTasks');
  dd.classList.toggle('hiddenCategoryTasks');
  const isOpen = !dd.classList.contains('hiddenCategoryTasks');

  if (isOpen) {
    document.addEventListener('click', handleOutsideCategoryClick);
    document.addEventListener('keydown', handleEscapeCategory);
  } else {
    document.removeEventListener('click', handleOutsideCategoryClick);
    document.removeEventListener('keydown', handleEscapeCategory);
  }
}

function handleOutsideCategoryClick(e) {
  const dd = document.getElementById('categoryTasks');
  const toggle = document.getElementById('category');
  if (!dd.contains(e.target) && !toggle.contains(e.target)) {
    closeCategoryDropdown();
  }
}

function handleEscapeCategory(e) {
  if (e.key === 'Escape') closeCategoryDropdown();
}

function closeCategoryDropdown() {
  const dd = document.getElementById('categoryTasks');
  if (!dd || dd.classList.contains('hiddenCategoryTasks')) return;
  dd.classList.add('hiddenCategoryTasks');

  // Pfeile zurücksetzen
  const arrowDown = document.getElementById('arrowDownCategory');
  const arrowUp = document.getElementById('arrowUpCategory');
  if (arrowDown && arrowUp) {
    arrowDown.style.display = 'flex';
    arrowUp.style.display = 'none';
  }

  document.removeEventListener('click', handleOutsideCategoryClick);
  document.removeEventListener('keydown', handleEscapeCategory);
}

// change category icon
function changeDropdownCategoryIcon() {
  const arrowDown = document.getElementById('arrowDownCategory');
  const arrowUp = document.getElementById('arrowUpCategory');

  if (arrowDown.style.display === 'none') {
    // Show arrow down, hide arrow up
    arrowDown.style.display = 'flex';
    arrowUp.style.display = 'none';
  } else {
    // Hide arrow down, show arrow up
    arrowDown.style.display = 'none';
    arrowUp.style.display = 'flex';
  }
}

// (النسخة الأخيرة هي الفعّالة)
function selectCategory(category) {
  const selectedCategoryElement = document.getElementById('selectedCategory');
  selectedCategoryElement.textContent = category; // Update text to the selected category
  validateAddTaskForm();
  toggleDropdownCategory(); // Hide dropdown
  changeDropdownCategoryIcon(); // Change icon to show the arrow down
}


// =====================================
// Subtasks (Add/Render/Remove/Edit inline)
// =====================================
function addSubtask() {
  const input = document.getElementById('subtasks');
  const subtaskText = input.value.trim();

  if (subtaskText) {
    subtasks.push(subtaskText);
    input.value = '';
    renderSubtasks();
  }
}

function renderSubtasks() {
  const container = document.getElementById('showAddedSubtasks');
  container.innerHTML = '';

  subtasks.forEach((task, index) => {
    if (editingSubtaskIndex === index) {
      container.innerHTML += `
        <div class="added-subtask editing">
          <input id="editSubtaskInput${index}" class="edit-subtask-input" type="text"
                 value="${escHtml(task)}"
                 onkeydown="handleEditKey(event, ${index})" />
          <button onclick="saveSubtask(${index})">Save</button>
          <button onclick="cancelEdit()">Cancel</button>
        </div>
      `;
    } else {
      container.innerHTML += `
        <div class="added-subtask">
          <span>${escHtml(task)}</span>
          <div class="subtask-actions">
            <img src="../assets/icons/edit-pen.png" alt="" class="edit-subtask" onclick="editSubtask(${index})">
            <button class="remove-subtask" onclick="removeSubtask(${index})">x</button>
          </div>
        </div>
      `;
    }
  });
}

function removeSubtask(index) {
  subtasks.splice(index, 1);
  renderSubtasks();
}

let editingSubtaskIndex = null;

function editSubtask(i) {
  editingSubtaskIndex = i;
  renderSubtasks();
  setTimeout(() => document.getElementById(`editSubtaskInput${i}`)?.focus(), 0);
}

function saveSubtask(i) {
  const el = document.getElementById(`editSubtaskInput${i}`);
  if (!el) return;
  const val = el.value.trim();
  if (val) subtasks[i] = val;
  editingSubtaskIndex = null;
  renderSubtasks();
}

function cancelEdit() {
  editingSubtaskIndex = null;
  renderSubtasks();
}

function handleEditKey(e, i) {
  if (e.key === 'Enter') saveSubtask(i);
  if (e.key === 'Escape') cancelEdit();
}

// Kleine Hilfe für sichere Ausgabe
function escHtml(s) {
  return s.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

document.querySelector('.add-subtask-btn').addEventListener('click', addSubtask);


// =====================================
// Create Task
// =====================================
async function createTask() {
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const due_date = document.getElementById('dueDate').value;
  const categoryText = document.getElementById('selectedCategory').textContent.trim();

  // Validierung
  if (!title) {
    validateAddTaskForm();
    return;
  }
  if (!due_date) {
    validateAddTaskForm();
    return;
  }
  if (!categoryText || categoryText === "Select Category") {
    validateAddTaskForm();
    return;
  }

  if (!validatePriorityField()) {
    // This will show the error message automatically
    validateAddTaskForm();
    return;
  }

  let priority = null;
  if (document.getElementById('urgent').classList.contains('active')) priority = "urgent";
  if (document.getElementById('medium').classList.contains('active')) priority = "medium";
  if (document.getElementById('low').classList.contains('active')) priority = "low";
  if (!priority) {
    validatePriorityField();
    // alert("Priority fehlt");
    return;
  }

  const assigned = addTaskUserData.filter(u => u.isToggled).map(u => u.id);

  let category = categoryText === "Technical Task" ? "toDo" : "inProgress";

  const taskObj = {
    title,
    description,
    due_date,
    priority,
    category,
    assigned_to: assigned,
    type: categoryText,
    subtasks: (subtasks || []).map(s => ({ title: s, completed: false }))
  };

  const res = await fetch(`${DATABASE_URL}/tasks/to_do.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskObj)
  });

  if (res.ok) {
    showSuccessOverlay("Task added to board!");
    clearTask();
    setTimeout(() => {
      window.location.href = "../pages/board.html";
    }, 1650);
  } else {
    alert("Fehler beim Erstellen!");
  }
}


// =====================================
// UI Helpers (Success Overlay / Clear Form)
// =====================================
// Function to show the overlay message 
function showSuccessOverlay(msg) {
  const overlay = document.getElementById('successOverlay');
  if (!overlay) return;
  overlay.querySelector('.success-popup span').textContent = msg || "Erfolg!";
  overlay.style.display = 'flex';
  setTimeout(() => {
    overlay.style.display = 'none';
  }, 1600); // 1.6 seconds
}

function clearTask() {
  /** Reset priority */
  document.getElementById('title').value = '';
  document.getElementById('description').value = '';
  document.getElementById('dueDate').value = '';
  document.getElementById('showAddedSubtasks').innerHTML = '';
  subtasks = [];

  /** Reset priority */
  urgent.classList.remove('active');
  medium.classList.remove('active');
  low.classList.remove('active');

  /** Reset assigned contacts */
  addTaskUserData.forEach(user => {
    user.isToggled = false;
    const contactElement = document.getElementById(user.id);
    if (contactElement) {
      renderToggleCheckbox(contactElement, addTaskUserData.indexOf(user));
    }
  });

  /** Clear the category selection */
  const selectedCategoryElement = document.getElementById('selectedCategory');
  selectedCategoryElement.textContent = 'Select Category';

  /** Clear the display of selected contacts */
  const selectedContactsContainer = document.querySelector('.showSelectedContact');
  selectedContactsContainer.innerHTML = '';

  setDefaultPriorityMedium();
  if (typeof validateAddTaskForm === 'function') validateAddTaskForm();
}


// =====================================
// Validation (Title/Due/Category/Priority/Form)
// =====================================
const titleInput = document.getElementById('title');
const dueDateInput = document.getElementById('dueDate');
const selectedPriorityElemnt = document.getElementById('priorityOptions');
const priorityContainer = document.getElementById('priorityContianerId');
const selectedCategoryElement = document.getElementById('selectedCategory');
const categoryContainer = document.getElementById('category');
const titleError = document.getElementById('titleErrorMessage');
const dueDateError = document.getElementById('dueDateErrorMessage');
const categoryError = document.getElementById('categoryErrorMessage');

// Titel Validierung
function validateTitleField() {
  const isValid = titleInput.value.trim() !== "";

  titleInput.style.borderBottom = isValid
    ? "1px solid var(--form-val-default)"
    : "1px solid var(--form-val-wrong)";
  titleError.style.display = isValid ? "none" : "flex";

  return isValid;
}

// Fälligkeitsdatum Validierung
function validateDueDateField() {
  const isValid = dueDateInput.value.trim() !== "";

  dueDateInput.style.borderBottom = isValid
    ? "1px solid var(--form-val-default)"
    : "1px solid var(--form-val-wrong)";
  dueDateError.style.display = isValid ? "none" : "flex";

  return isValid;
}

// Kategorie Validierung
function validateCategoryField() {
  const selectedCategory = selectedCategoryElement.textContent.trim();
  const isValid = selectedCategory !== "" && selectedCategory !== "Select Category";

  const categoryContainer = document.getElementById('category');
  categoryContainer.style.borderBottom = isValid
    ? "1px solid var(--form-val-default)"
    : "1px solid var(--form-val-wrong)";
  categoryError.style.display = isValid ? "none" : "flex";

  return isValid;
}

// Update the priority validation function
function validatePriorityField() {
  const isUrgentActive = urgent.classList.contains('active');
  const isMediumActive = medium.classList.contains('active');
  const isLowActive = low.classList.contains('active');
  const isValid = isUrgentActive || isMediumActive || isLowActive;

  // Make sure you have this element in your HTML
  const priorityError = document.getElementById('priorityErrorMessage');
  if (priorityError) {
    priorityError.style.display = isValid ? "none" : "flex";
  }

  return isValid;
}

// Haupt-Validierungsfunktion
function validateAddTaskForm() {
  const isTitleValid = validateTitleField();
  const isDueDateValid = validateDueDateField();
  const isCategoryValid = validateCategoryField();
  const isPriorityValid = validatePriorityField();

  return isTitleValid && isDueDateValid && isCategoryValid && isPriorityValid;
}

// Live-Check bei Eingabe / Änderung
titleInput.addEventListener('input', validateAddTaskForm);
dueDateInput.addEventListener('change', validateAddTaskForm);
categoryContainer.addEventListener('DOMSubtreeModified', validateAddTaskForm); // Für Dropdown Textänderung

function submitAddTaskForm() {
  if (!validateAddTaskForm()) return; // blockt, wenn nicht alles ausgefüllt
  createTask(); // deine Funktion
}
