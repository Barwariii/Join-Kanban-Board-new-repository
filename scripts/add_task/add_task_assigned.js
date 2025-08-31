/** =====================================
 * Assigned-To Dropdown (open/close + outside/esc)
 * ===================================== */

/** Prevent event bubbling inside the Assigned-To dropdown. */
(function initAssignedDropdownShield() {
  const dd = document.getElementById('assignedContacts');
  if (dd) dd.addEventListener('click', (e) => e.stopPropagation());
})();


/**
 * Toggle the Assigned Contacts dropdown.
 * @param {Event} [ev] - Event to stop propagation for self-click.
 * @returns {void}
 */
function toggleDropdownAssignedContacts(ev) {
  if (ev) ev.stopPropagation();
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


/**
 * Close the Assigned Contacts dropdown if a click happens outside its area.
 * @param {Event} e
 * @returns {void}
 */
function handleOutsideAssignedClick(e) {
  const dd = document.getElementById('assignedContacts');
  const toggle = document.getElementById('assignedTo');
  if (!dd.contains(e.target) && !toggle.contains(e.target)) {
    closeAssignedDropdown();
  }
}


/**
 * Close the dropdown on Escape key.
 * @param {KeyboardEvent} e
 * @returns {void}
 */
function handleEscapeAssigned(e) {
  if (e.key === 'Escape') closeAssignedDropdown();
}


/**
 * Close the Assigned Contacts dropdown and reset arrow icons.
 * @returns {void}
 */
function closeAssignedDropdown() {
  const dd = document.getElementById('assignedContacts');
  if (!dd || dd.classList.contains('hiddenAssignedContacts')) return;
  dd.classList.add('hiddenAssignedContacts');

  /** Reset arrow icons */
  const arrowDown = document.getElementById('arrowDown');
  const arrowUp = document.getElementById('arrowUp');
  if (arrowDown && arrowUp) {
    arrowDown.style.display = 'flex';
    arrowUp.style.display = 'none';
  }

  document.removeEventListener('click', handleOutsideAssignedClick);
  document.removeEventListener('keydown', handleEscapeAssigned);

  updateSelectedContacts();
}


/**
 * Swap Assigned dropdown arrow icons (up/down).
 * @returns {void}
 */
function changeDropdownAssignedIcon() {
  const arrowDown = document.getElementById('arrowDown');
  const arrowUp = document.getElementById('arrowUp');

  if (arrowDown.style.display === 'none') {
    /** Show arrow down, hide arrow up */
    arrowDown.style.display = 'flex';
    arrowUp.style.display = 'none';
  } else {
    /** Hide arrow down, show arrow up */
    arrowDown.style.display = 'none';
    arrowUp.style.display = 'flex';
  }
  updateSelectedContacts();
}


/**
 * Update the “selected contacts” avatar strip based on .contact.active.
 * @returns {void}
 */
function updateSelectedContacts() {
  const selectedContactsContainer = document.querySelector('.showSelectedContact');
  selectedContactsContainer.innerHTML = '';

  /** Find all active contacts (selected contacts) */
  const activeContacts = document.querySelectorAll('.contact.active');

  /** Add avatar clone for every selected contact */
  activeContacts.forEach((contact) => {
    const contactAvatar = contact.querySelector('.contactAvatar').cloneNode(true);
    contactAvatar.classList.add('showncontactAvatar');
    selectedContactsContainer.appendChild(contactAvatar);
  });
}


/** =====================================
 * Assigned-To: Toggle + Render Toggle
 * ===================================== */

/**
 * Toggle Checkbox on a contact item and flip its active state.
 * @param {HTMLElement} contactElement
 * @param {number} i - Index in addTaskUserData.
 * @returns {void}
 */
function toggleCheckbox(contactElement, i) {
  const unchecked = document.getElementById(`unCheckedBox${i}`);
  const checked = document.getElementById(`checkedBox${i}`);

  /** Toggle visibility of the checkbox */
  if (addTaskUserData[i].isToggled) {
    unchecked.classList.remove('hideCheckBox');
    checked.classList.add('hideCheckBox');
    addTaskUserData[i].isToggled = false;
  } else {
    unchecked.classList.add('hideCheckBox');
    checked.classList.remove('hideCheckBox');
    addTaskUserData[i].isToggled = true;
  }

  /** Mark the contact as active (light blue) */
  contactElement.classList.toggle('active');
}


/**
 * Render the checkbox/active state for a specific contact item.
 * @param {HTMLElement} contactElement
 * @param {number} i - Index in addTaskUserData.
 * @returns {void}
 */
function renderToggleCheckbox(contactElement, i) {
  const unchecked = document.getElementById(`unCheckedBox${i}`);
  const checked = document.getElementById(`checkedBox${i}`);

  if (!unchecked || !checked) return;

  /** Toggle visibility of the checkbox */
  if (addTaskUserData[i].isToggled) {
    unchecked.classList.add('hideCheckBox');
    checked.classList.remove('hideCheckBox');

    /** Add the class 'active' if isToggled is true */
    contactElement.classList.add('active');
  } else {
    unchecked.classList.remove('hideCheckBox');
    checked.classList.add('hideCheckBox');

    /** Remove the class 'active' if isToggled is false */
    contactElement.classList.remove('active');
  }
}
