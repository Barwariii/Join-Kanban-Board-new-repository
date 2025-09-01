/**
 * Toggle the enhanced category dropdown and attach outside/Escape handlers.
 * @param {Event} [ev]
 * @returns {void}
 */
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


/**
 * Handle click outside the category dropdown to close it.
 * @param {Event} e
 * @returns {void}
 */
function handleOutsideCategoryClick(e) {
  const dd = document.getElementById('categoryTasks');
  const toggle = document.getElementById('category');
  if (!dd.contains(e.target) && !toggle.contains(e.target)) {
    closeCategoryDropdown();
  }
}


/**
 * Handle Escape key to close the category dropdown.
 * @param {KeyboardEvent} e
 * @returns {void}
 */
function handleEscapeCategory(e) {
  if (e.key === 'Escape') closeCategoryDropdown();
}


/**
 * Close the category dropdown and reset arrow icons.
 * @returns {void}
 */
function closeCategoryDropdown() {
  const dd = document.getElementById('categoryTasks');
  if (!dd || dd.classList.contains('hiddenCategoryTasks')) return;
  dd.classList.add('hiddenCategoryTasks');

  /** Reset arrows */
  const arrowDown = document.getElementById('arrowDownCategory');
  const arrowUp = document.getElementById('arrowUpCategory');
  if (arrowDown && arrowUp) {
    arrowDown.style.display = 'flex';
    arrowUp.style.display = 'none';
  }

  document.removeEventListener('click', handleOutsideCategoryClick);
  document.removeEventListener('keydown', handleEscapeCategory);
}


/**
 * Swap arrow icons (up/down) for the category dropdown.
 * @returns {void}
 */
function changeDropdownCategoryIcon() {
  const arrowDown = document.getElementById('arrowDownCategory');
  const arrowUp = document.getElementById('arrowUpCategory');

  if (arrowDown.style.display === 'none') {
    /** Show arrow down, hide arrow up */
    arrowDown.style.display = 'flex';
    arrowUp.style.display = 'none';
  } else {
    /** Hide arrow down, show arrow up */
    arrowDown.style.display = 'none';
    arrowUp.style.display = 'flex';
  }
}


/**
 * Set selected category label, validate form, and close the dropdown (enhanced).
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
