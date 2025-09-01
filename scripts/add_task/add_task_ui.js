/**
 * UI Helpers (Success Overlay / Clear Form)
 * Show a success overlay with a message for ~1.6s.
 * @param {string} [msg="Erfolg!"]
 * @returns {void}
 */
function showSuccessOverlay(msg) {
  const overlay = document.getElementById('successOverlay');
  if (!overlay) return;
  overlay.querySelector('.success-popup span').textContent = msg || "Erfolg!";
  overlay.style.display = 'flex';
  setTimeout(() => {
    overlay.style.display = 'none';
  }, 1600);
}


/**
 * Reset the Add Task form to defaults (including priority/category/assigned).
 * @returns {void}
 */
function clearTask() {
  resetTaskFields();
  resetPriorityAndAssignments();
  resetCategoryAndContacts();
  setDefaultPriorityMedium();
  if (typeof validateAddTaskForm === 'function') validateAddTaskForm();
}


/**
 * Reset the main input fields and subtasks.
 * @returns {void}
 */
function resetTaskFields() {
  document.getElementById('title').value = '';
  document.getElementById('description').value = '';
  document.getElementById('dueDate').value = '';
  document.getElementById('showAddedSubtasks').innerHTML = '';
  subtasks = [];
}


/**
 * Reset priority buttons, assigned contacts, and category/contacts UI.
 * @returns {void}
 */
function resetPriorityAndAssignments() {
  urgent.classList.remove('active');
  medium.classList.remove('active');
  low.classList.remove('active');

  addTaskUserData.forEach((user) => {
    user.isToggled = false;
    const contactElement = document.getElementById(user.id);
    if (contactElement) {
      renderToggleCheckbox(contactElement, addTaskUserData.indexOf(user));
    }
  });
}


/**
 * Reset category selection and selected contacts display.
 * @returns {void}
 */
function resetCategoryAndContacts() {
  const selectedCategoryElement = document.getElementById('selectedCategory');
  selectedCategoryElement.textContent = 'Select Category';

  const selectedContactsContainer = document.querySelector('.showSelectedContact');
  selectedContactsContainer.innerHTML = '';
}
