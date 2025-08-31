/**
 * Contact <li> template used in "Assigned to" list.
 * @param {{id:string, initials:string, name:string, color:string}} singleUser
 * @param {number} i
 * @returns {string}
 */
function add_task_contact_li_template(singleUser, i) {
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



/**
 * Unchecked checkbox SVG string (template).
 * @type {string}
 */
const ADD_TASK_UNCHECKED_SVG = `
  <svg class="unchecked" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4.96582" width="16" height="16" rx="3" stroke="#4589FF" stroke-width="2"/>
  </svg>
`;



/**
 * Checked checkbox SVG string (template).
 * @type {string}
 */
const ADD_TASK_CHECKED_SVG = `
  <svg class="checked hideCheckBox" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 11.9658V17.9658C20 19.6227 18.6569 20.9658 17 20.9658H7C5.34315 20.9658 4 19.6227 4 17.9658V7.96582C4 6.30897 5.34315 4.96582 7 4.96582H15" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
    <path d="M8 12.9658L12 16.9658L20 5.46582" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;



/**
 * Subtask row template (editing mode). Pass pre-escaped text.
 * @param {number} index
 * @param {string} taskEscaped
 * @returns {string}
 */
function add_task_subtask_row_edit_template(index, taskEscaped) {
  return `
    <div class="added-subtask editing">
      <input id="editSubtaskInput${index}" class="edit-subtask-input" type="text"
             value="${taskEscaped}"
             onkeydown="handleEditKey(event, ${index})" />
      <button onclick="saveSubtask(${index})">Save</button>
      <button onclick="cancelEdit()">Cancel</button>
    </div>
  `;
}



/**
 * Subtask row template (normal mode). Pass pre-escaped text.
 * @param {number} index
 * @param {string} taskEscaped
 * @returns {string}
 */
function add_task_subtask_row_template(index, taskEscaped) {
  return `
    <div class="added-subtask">
      <span>${taskEscaped}</span>
      <div class="subtask-actions">
        <img src="../assets/icons/edit-pen.png" alt="" class="edit-subtask" onclick="editSubtask(${index})">
        <button class="remove-subtask" onclick="removeAddTaskSubtask(${index})">x</button>
      </div>
    </div>
  `;
}



/** JSDoc: expose templates on window (no logic change). */
window.add_task_contact_li_template = add_task_contact_li_template;
window.ADD_TASK_UNCHECKED_SVG = ADD_TASK_UNCHECKED_SVG;
window.ADD_TASK_CHECKED_SVG = ADD_TASK_CHECKED_SVG;
window.add_task_subtask_row_edit_template = add_task_subtask_row_edit_template;
window.add_task_subtask_row_template = add_task_subtask_row_template;
