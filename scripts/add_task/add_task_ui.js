/** =====================================
 * UI Helpers (Success Overlay / Clear Form)
 * ===================================== */

/**
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
  /** Reset basic fields */
  document.getElementById('title').value = '';
  document.getElementById('description').value = '';
  document.getElementById('dueDate').value = '';
  document.getElementById('showAddedSubtasks').innerHTML = '';
  subtasks = [];

  /** Reset priority visuals */
  urgent.classList.remove('active');
  medium.classList.remove('active');
  low.classList.remove('active');

  /** Reset assigned contacts UI + state */
  addTaskUserData.forEach((user) => {
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
