/** 
 * Priority Buttons (Urgent/Medium/Low)
 * Urgent priority button element. 
 */
const urgent = document.getElementById('urgent');

/** Medium priority button element. */
const medium = document.getElementById('medium');

/** Low priority button element. */
const low = document.getElementById('low');


/**
 * Default initial priority: Medium (active).
 * @returns {void}
 */
function setDefaultPriorityMedium() {
  /** Medium aktiv */
  medium.classList.add('active');
  medium.classList.remove('mediumHover');

  /** Andere auf Hover-Style setzen */
  urgent.classList.remove('active');
  urgent.classList.add('urgentHover');
  low.classList.remove('active');
  low.classList.add('lowHover');
}


/**
 * Toggle Urgent priority on/off and adjust others accordingly.
 * @returns {void}
 */
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


/**
 * Toggle Medium priority on/off and adjust others accordingly.
 * @returns {void}
 */
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


/**
 * Toggle Low priority on/off and adjust others accordingly.
 * @returns {void}
 */
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
