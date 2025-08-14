

window.getUserDataForAddTask = getUserDataForAddTask;

addTaskUserData = [];

let addTaskSubtasks = [];
let editTaskSubtasks = [];

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
    const contactElement = document.getElementById(addTaskUserData[i].id);
    renderToggleCheckbox(contactElement, i);
  }
}

window.renderAssignedToList = renderAssignedToList;




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

  

//! Funktion für Checkbox umschalten
function toggleCheckbox(contactElement, i) {
  // Try to get the SVG by ID first
  let unchecked = document.getElementById(`unCheckedBox${i}`);
  let checked = document.getElementById(`checkedBox${i}`);

  // If not found by ID, search inside the element itself
  if (!unchecked || !checked) {
    unchecked = contactElement.querySelector('.unchecked');
    checked = contactElement.querySelector('.checked');
  }

  // After you have the elements, do the toggle
  if (addTaskUserData[i].isToggled) {
    unchecked.classList.remove('hideCheckBox');
    checked.classList.add('hideCheckBox');
    addTaskUserData[i].isToggled = false;
  } else {
    unchecked.classList.add('hideCheckBox');
    checked.classList.remove('hideCheckBox');
    addTaskUserData[i].isToggled = true;
  }

  // Change the background color on the contact itself
  contactElement.classList.toggle('active');
}
window.toggleCheckbox = toggleCheckbox;


//! Funktion für Checkbox umschalten
function renderToggleCheckbox(contactElement, i) {
  const unchecked = document.getElementById(`unCheckedBox${i}`);
  const checked = document.getElementById(`checkedBox${i}`);

  // Check before using them
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


//! Toggle Dropdown of assigned Contacts
function toggleDropdownAssignedContacts() {
  const assignedContacts = document.getElementById('assignedContacts');
  // Toggle the 'hidden' class on or off
  assignedContacts.classList.toggle('hiddenAssignedContacts');
  updateSelectedContacts();
}
window.toggleDropdownAssignedContacts = toggleDropdownAssignedContacts;



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
window.changeDropdownAssignedIcon = changeDropdownAssignedIcon;


// Function to display the selected contacts in showSelectedContact
function updateSelectedContacts() {
  const selectedContactsContainer = document.querySelector('.showSelectedContact');
  selectedContactsContainer.innerHTML = ''; // Remove old entries

  // Alle aktiven Kontakte (ausgewählte Kontakte) finden
  const activeContacts = document.querySelectorAll('.contact.active');

  // Add the initials of each selected contact
  activeContacts.forEach(contact => {
    const contactAvatar = contact.querySelector('.contactAvatar').cloneNode(true); // Clone the contact avatar
    contactAvatar.classList.add('showncontactAvatar'); // Add class if needed
    selectedContactsContainer.appendChild(contactAvatar); // Add avatar to the display
  });
}

//! Priority btns effects
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
}
window.toggleUrgent = toggleUrgent;


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
}
window.toggleMedium = toggleMedium;


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
}
window.toggleLow = toggleLow;




//! Toggle Dropdown of Category
function toggleDropdownCategory() {
  const categoryTasks = document.getElementById('categoryTasks');
  // Toggle the 'hidden' class on or off
  categoryTasks.classList.toggle('hiddenCategoryTasks');
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



function selectCategory(category) {
  const selectedCategoryElement = document.getElementById('selectedCategory');
  selectedCategoryElement.textContent = category; // Update text to the selected category
  toggleDropdownCategory(); // Hide dropdown
  changeDropdownCategoryIcon(); // Change icon to show the arrow down
}
window.selectCategory = selectCategory;



// Function to display the selected subtasks in showAddedSubtasks
function addSubtaskForAddTask() {
  const input = document.getElementById('subtasks');
  if (!input || !input.value.trim()) return;
  
  addTaskSubtasks.push(input.value.trim());
  input.value = '';
  renderSubtasksForAddTask();
}

function renderSubtasksForAddTask() {
  const container = document.getElementById('showAddedSubtasks');
  if (!container) return;
  
  container.innerHTML = addTaskSubtasks.map((task, index) => `
    <div class="added-subtask">
      <span>${task}</span>
      <button class="remove-subtask" onclick="removeAddTaskSubtask(${index})">x</button>
    </div>
  `).join('');
}

function removeAddTaskSubtask(index) {
  addTaskSubtasks.splice(index, 1);
  renderSubtasksForAddTask();
}

document.querySelector('.add-subtask-btn').addEventListener('click', addSubtaskForAddTask);


// ! 
function validateField() {
  const titleInput = document.getElementById('title');
  const errorMessage = document.getElementById('titleErrorMessage');

  // Check if the input field is empty
  if (titleInput.value.trim() === "") {
    errorMessage.style.display = "flex"; // Show error message
    titleInput.style.borderBottom = "1px solid #f44336"; // Red border
  } else {
    errorMessage.style.display = "none"; // Hide error message
    titleInput.style.borderBottom = "1px solid #ccc"; // Normal border
  }
}


async function createTask() {
  // 1. Werte einsammeln
  const title = document.getElementById('title').value.trim();
  if (!title) {
    alert("Title fehlt!");
    return;
  }
  const description = document.getElementById('description').value.trim();
  const due_date = document.getElementById('dueDate').value;
  // Priority
  let priority = null;
  if (document.getElementById('urgent').classList.contains('active')) priority = "urgent";
  if (document.getElementById('medium').classList.contains('active')) priority = "medium";
  if (document.getElementById('low').classList.contains('active')) priority = "low";
  // Assigned
  const assigned = addTaskUserData.filter(u => u.isToggled).map(u => u.id);
  // Category (make sure you always get a value)
  let categoryText = document.getElementById('selectedCategory').innerText;
  let category = "toDo";
  if (categoryText === "Technical Task") category = "toDo";
  else if (categoryText === "User Story") category = "inProgress";

  // Generate ID (or just leave it empty, Firebase will give you one)
  // const id = ...;

  // 2. Build task object
  const taskObj = {
    title,
    description,
    due_date,
    priority,
    category,
    assigned_to: assigned,
    type: categoryText,
    subtasks: addTaskSubtasks.map(title => ({title, completed: false}))
  };

  // 3. Save to DB (POST)
  const res = await fetch(`${DATABASE_URL}/tasks/to_do.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskObj)
  });

  if (res.ok) {
    showSuccessOverlay("Task erstellt!");
    clearTask(); // Clear input fields
  } else {
    alert("Fehler beim Erstellen!");
  }
}
window.createTask = createTask;

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
  // Clear the input fields
  document.getElementById('title').value = '';
  document.getElementById('description').value = '';
  document.getElementById('dueDate').value = '';
  document.getElementById('showAddedSubtasks').innerHTML = '';
addTaskSubtasks = [];

  // Reset priority
  urgent.classList.remove('active');
  medium.classList.remove('active');
  low.classList.remove('active');

  // Reset assigned contacts
addTaskUserData.forEach((user, i) => {
  user.isToggled = false;
  const contactElement = document.getElementById(user.id);
  if (contactElement) {
    renderToggleCheckbox(contactElement, i);
  }
});



  const overlay = document.querySelector('.addTaskOverlay');

  // Clear the category selection
const selectedCategoryElement = overlay.querySelector('#selectedCategory');
if (selectedCategoryElement) {
  selectedCategoryElement.textContent = 'Select Category';
}

  // Clear the display of selected contacts
const selectedContactsContainer = overlay.querySelector('.showSelectedContact');
if (selectedContactsContainer) {
  selectedContactsContainer.innerHTML = '';
}
}
window.clearTask = clearTask;


window.toggleDropdownAssignedContacts = toggleDropdownAssignedContacts;
window.changeDropdownAssignedIcon = changeDropdownAssignedIcon;
window.renderAssignedToList = renderAssignedToList;
window.toggleCheckbox = toggleCheckbox;
window.selectCategory = selectCategory;
window.createTask = createTask;
window.clearTask = clearTask;

// In board_overlay_add_task.js, at the very bottom:
document.addEventListener('DOMContentLoaded', function () {
  const assignedTo = document.getElementById('assignedTo');
  if (assignedTo) {
    assignedTo.addEventListener('click', function () {
      toggleDropdownAssignedContacts();
      changeDropdownAssignedIcon();
      renderAssignedToList();
    });
  }
});



