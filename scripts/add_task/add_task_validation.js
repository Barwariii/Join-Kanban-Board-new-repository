/** =====================================
 * Validation (Title/Due/Category/Priority/Form)
 * ===================================== */

/** @type {HTMLInputElement} */
const titleInput = document.getElementById('title');

/** @type {HTMLInputElement} */
const dueDateInput = document.getElementById('dueDate');

/** Priority options wrapper (for styling/validation feedback). */
const selectedPriorityElemnt = document.getElementById('priorityOptions');

/** Priority container element (for border feedback). */
const priorityContainer = document.getElementById('priorityContianerId');

/** Selected category label element. */
const selectedCategoryElement = document.getElementById('selectedCategory');

/** Category container element (for border feedback). */
const categoryContainer = document.getElementById('category');

/** Title error message element. */
const titleError = document.getElementById('titleErrorMessage');

/** Due date error message element. */
const dueDateError = document.getElementById('dueDateErrorMessage');

/** Category error message element. */
const categoryError = document.getElementById('categoryErrorMessage');


/**
 * Validate Title field (non-empty).
 * @returns {boolean}
 */
function validateTitleField() {
  const isValid = titleInput.value.trim() !== "";

  titleInput.style.borderBottom = isValid
    ? "1px solid var(--form-val-default)"
    : "1px solid var(--form-val-wrong)";
  titleError.style.display = isValid ? "none" : "flex";

  return isValid;
}


/**
 * Validate Due Date field (non-empty).
 * @returns {boolean}
 */
function validateDueDateField() {
  const isValid = dueDateInput.value.trim() !== "";

  dueDateInput.style.borderBottom = isValid
    ? "1px solid var(--form-val-default)"
    : "1px solid var(--form-val-wrong)";
  dueDateError.style.display = isValid ? "none" : "flex";

  return isValid;
}


/**
 * Validate Category field (selected & not the placeholder).
 * @returns {boolean}
 */
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


/**
 * Validate Priority selection (at least one is active).
 * @returns {boolean}
 */
function validatePriorityField() {
  const isUrgentActive = urgent.classList.contains('active');
  const isMediumActive = medium.classList.contains('active');
  const isLowActive = low.classList.contains('active');
  const isValid = isUrgentActive || isMediumActive || isLowActive;

  /** Error message element for Priority (if present in DOM). */
  const priorityError = document.getElementById('priorityErrorMessage');
  if (priorityError) {
    priorityError.style.display = isValid ? "none" : "flex";
  }

  return isValid;
}


/**
 * Main form-level validation aggregator.
 * @returns {boolean}
 */
function validateAddTaskForm() {
  const isTitleValid = validateTitleField();
  const isDueDateValid = validateDueDateField();
  const isCategoryValid = validateCategoryField();
  const isPriorityValid = validatePriorityField();

  return isTitleValid && isDueDateValid && isCategoryValid && isPriorityValid;
}


/** Live validation while typing/changing fields. */
titleInput.addEventListener('input', validateAddTaskForm);

dueDateInput.addEventListener('change', validateAddTaskForm);


/**
 * Submit handler: blocks submit when invalid; otherwise calls createTask().
 * @returns {void}
 */
function submitAddTaskForm() {
  if (!validateAddTaskForm()) return;
  createTask();
}
