/**
 * Assigned-To: Template & Render
 * Template function for a single "Assigned To" user list item
 * @param {{ id: string, color: string, initials: string, name: string }} singleUser - The user to render. 
 * @param {number} i - Zero-based index used to build unique checkbox SVG ids.
 * @returns {string} HTML string for the user list item with avatar, name, and checkboxes.
 */

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


/**
 * Assigned-To: SVG Templates & Bootstrapping
 * Select assigned Contacts
 * Added once as a shared template.
 * @type {string}
 */
const uncheckedSVG = `
  <svg class="unchecked" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4.96582" width="16" height="16" rx="3" stroke="#4589FF" stroke-width="2"/>
  </svg>`;

const checkedSVG = `
  <svg class="checked hideCheckBox" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 11.9658V17.9658C20 19.6227 18.6569 20.9658 17 20.9658H7C5.34315 20.9658 4 19.6227 4 17.9658V7.96582C4 6.30897 5.34315 4.96582 7 4.96582H15" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
      <path d="M8 12.9658L12 16.9658L20 5.46582" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;


  /**
   * Render the current list of subtasks into the container with id "showAddedSubtasks".
   * Uses globals:
   *  - subtasks: string[] of subtask labels
   *  - editingSubtaskIndex: number|null indicating which subtask is being edited
   *  - - escHtml, handleEditKey, saveSubtask, cancelEdit, editSubtask, removeSubtask: helper functions referenced in event handlers
   * @returns {void}
   */
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