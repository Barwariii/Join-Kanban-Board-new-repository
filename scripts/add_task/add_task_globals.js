/** @type {Array<{id:string, initials:string, name:string, color:string, isToggled:boolean}>} */
addTaskUserData = [];

/** @type {string[]} */
let subtasks = [];


/** 
 * Contacts checkbox
 * All contact elements on the page. 
*/
const contacts = document.querySelectorAll('.contact');

/** Mount a checkbox SVG once for every contact item. */
for (let i = 0; i < contacts.length; i++) {
  const contact = contacts[i];
  const checkboxDiv = contact.querySelector('.checkbox');
  checkboxDiv.innerHTML = checkedSVG;
}
