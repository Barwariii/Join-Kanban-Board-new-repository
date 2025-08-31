/**
 * Create task: validate form, build payload, POST to DB, success UI, then redirect.
 * @returns {Promise<void>}
 */
async function createTask() {
  if (!validateAddTaskForm()) return;

  const { urgent, medium, low } = prioEls(); if (!urgent || !medium || !low) return;

  const payload = buildTaskPayload(urgent, medium, low); if (!payload) return; // Safety guard

  const res = await fetch(`${DATABASE_URL}/tasks/to_do.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) { alert("Fehler beim Erstellen!"); return; }
  showSuccessOverlay("Task erstellt!"); clearTask();
  setTimeout(() => { window.location.href = "../pages/board.html"; }, 1650);
}
window.createTask = createTask;


/**
 * Build the task object from the current form state.
 * @param {HTMLElement} urgentEl - Urgent priority element.
 * @param {HTMLElement} mediumEl - Medium priority element.
 * @param {HTMLElement} lowEl - Low priority element.
 * @returns {Object|null} Task payload object or null on invalid state.
 */
function buildTaskPayload(urgentEl, mediumEl, lowEl) {
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const due_date = document.getElementById('dueDate').value;

  let priority = null;
  if (urgentEl.classList.contains('active')) priority = "urgent";
  if (mediumEl.classList.contains('active')) priority = "medium";
  if (lowEl.classList.contains('active')) priority = "low";

  const categoryText = document.getElementById('selectedCategory').textContent.trim();
  const category = (categoryText === "Technical Task") ? "toDo" : "inProgress";

  const assigned = (addTaskUserData || [])
    .filter(u => u.isToggled)
    .map(u => u.id);

  return {
    title,
    description,
    due_date,
    priority,
    category,
    assigned_to: assigned,
    type: categoryText,
    subtasks: (addTaskSubtasks || []).map(t => ({ title: t, completed: false }))
  };
}


/**
 * Title field validation.
 * @returns {boolean}
 */
function validateTitleField() {
  const titleInput = document.getElementById('title');
  const titleError = document.getElementById('titleErrorMessage');
  if (!titleInput) return false;

  const isValid = titleInput.value.trim() !== "";
  titleInput.style.borderBottom = isValid
    ? "1px solid var(--form-val-default)"
    : "1px solid var(--form-val-wrong)";
  if (titleError) titleError.style.display = isValid ? "none" : "flex";
  return isValid;
}


/**
 * Due date field validation.
 * @returns {boolean}
 */
function validateDueDateField() {
  const dueDateInput = document.getElementById('dueDate');
  const dueDateError = document.getElementById('dueDateErrorMessage');
  if (!dueDateInput) return false;

  const isValid = dueDateInput.value.trim() !== "";
  dueDateInput.style.borderBottom = isValid
    ? "1px solid var(--form-val-default)"
    : "1px solid var(--form-val-wrong)";
  if (dueDateError) dueDateError.style.display = isValid ? "none" : "flex";
  return isValid;
}


/**
 * Category field validation.
 * @returns {boolean}
 */
function validateCategoryField() {
  const selectedCategoryElement = document.getElementById('selectedCategory');
  const categoryContainer = document.getElementById('category');
  const categoryError = document.getElementById('categoryErrorMessage');
  if (!selectedCategoryElement || !categoryContainer) return false;

  const txt = selectedCategoryElement.textContent.trim();
  const isValid = txt !== "" && txt !== "Select Category";
  categoryContainer.style.borderBottom = isValid
    ? "1px solid var(--form-val-default)"
    : "1px solid var(--form-val-wrong)";
  if (categoryError) categoryError.style.display = isValid ? "none" : "flex";
  return isValid;
}


/**
 * Priority validation: at least one of urgent/medium/low is active.
 * @returns {boolean}
 */
function validatePriorityField() {
  const { urgent, medium, low } = prioEls();
  if (!urgent || !medium || !low) return false;

  const isUrgentActive = urgent.classList.contains('active');
  const isMediumActive = medium.classList.contains('active');
  const isLowActive = low.classList.contains('active');
  const isValid = isUrgentActive || isMediumActive || isLowActive;

  const priorityError = document.getElementById('priorityErrorMessage');
  if (priorityError) {
    priorityError.style.display = isValid ? "none" : "flex";
  }

  return isValid;
}


/**
 * Full form validation (title, due date, category, priority).
 * @returns {boolean}
 */
function validateAddTaskForm() {
  const isTitleValid = validateTitleField();
  const isDueDateValid = validateDueDateField();
  const isCategoryValid = validateCategoryField();
  const isPriorityValid = validatePriorityField();

  return isTitleValid && isDueDateValid && isCategoryValid && isPriorityValid;
}

const titleInput = document.getElementById('title');
const dueDateInput = document.getElementById('dueDate');
const selectedCategoryElement = document.getElementById('selectedCategory');

titleInput?.addEventListener('input', validateAddTaskForm);
dueDateInput?.addEventListener('change', validateAddTaskForm);

const obs = new MutationObserver(validateAddTaskForm);
if (selectedCategoryElement) {
  obs.observe(selectedCategoryElement, { childList: true, characterData: true, subtree: true });
}


/**
 * Success overlay helper.
 * @param {string} msg
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
 * Clear Add-Task form fields, reset selections and priority states.
 * @returns {void}
 */
function clearTask() {
  const { urgent, medium, low } = prioEls();

  document.getElementById('title').value = '';
  document.getElementById('description').value = '';
  document.getElementById('dueDate').value = '';
  document.getElementById('showAddedSubtasks').innerHTML = '';
  addTaskSubtasks = [];

  urgent.classList.remove('active');
  medium.classList.remove('active');
  low.classList.remove('active');

  addTaskUserData.forEach((user, i) => {
    user.isToggled = false;
    const contactElement = document.getElementById(user.id);
    if (contactElement) {
      renderToggleCheckbox(contactElement, i);
    }
  });

  const overlay = document.querySelector('.addTaskOverlay');

  const selectedCategoryElement = overlay.querySelector('#selectedCategory');
  if (selectedCategoryElement) {
    selectedCategoryElement.textContent = 'Select Category';
  }

  const selectedContactsContainer = overlay.querySelector('.showSelectedContact');
  if (selectedContactsContainer) {
    selectedContactsContainer.innerHTML = '';
  }

  setDefaultPriorityMedium();
  if (typeof validateAddTaskForm === 'function') validateAddTaskForm();
}
window.clearTask = clearTask;

/** JSDoc: additional window exports (unchanged). */
window.toggleDropdownAssignedContacts = toggleDropdownAssignedContacts;
window.changeDropdownAssignedIcon = changeDropdownAssignedIcon;
window.renderAssignedToList = renderAssignedToList;
window.toggleCheckbox = toggleCheckbox;
window.selectCategory = selectCategory;
window.createTask = createTask;
window.clearTask = clearTask;

/**
 * DOM ready bootstrap: attach small handlers if present and set default priority.
 * @returns {void}
 */
document.addEventListener('DOMContentLoaded', function () {
  const assignedTo = document.getElementById('assignedTo');
  if (assignedTo) {
    assignedTo.addEventListener('click', function () {
      toggleDropdownAssignedContacts();
      changeDropdownAssignedIcon();
      renderAssignedToList();
    });
  }

  setDefaultPriorityMedium();

  document.querySelector('.add-subtask-btn')?.addEventListener('click', addSubtaskForAddTask);
});
