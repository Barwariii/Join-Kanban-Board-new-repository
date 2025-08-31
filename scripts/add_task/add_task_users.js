/** =====================================
 * Fetch Users (Assigned-To source)
 * ===================================== */

/**
 * Load users from database and prepare Assigned-To source.
 * @param {string} [path="/users"] - Realtime DB path for users.
 * @returns {Promise<void>}
 */
async function getUserDataForAddTask(path = "/users") {
  try {
    const userResponse = await fetch(DATABASE_URL + path + ".json");
    const userResponseJson = await userResponse.json();

    addTaskUserData = [];

    if (userResponseJson) {
      Object.keys(userResponseJson).forEach((key) => {
        addTaskUserData.push({
          id: key,
          initials: userResponseJson[key].initials,
          name: userResponseJson[key].name,
          color: userResponseJson[key].color,
          isToggled: false /** initialize isToggled */
        });
      });
    }
  } catch (error) {
    console.error("Error loading DB-Data:", error);
  }
}


/**
 * Render the Assigned-To list and apply current toggle state for each contact.
 * @returns {void}
 */
function renderAssignedToList() {
  const ulItem = document.getElementById("assignedContactsUlItem");
  ulItem.innerHTML = "";

  for (let i = 0; i < addTaskUserData.length; i++) {
    const singleUser = addTaskUserData[i];
    ulItem.innerHTML += assignedToSingleUserTemplate(singleUser, i);

    /** Render Checkbox state */
    const contactElement = document.getElementById(singleUser.id);
    renderToggleCheckbox(contactElement, i);
  }
}
