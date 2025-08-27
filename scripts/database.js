/**
 * Account color palette for user profiles.
 * @type {Object.<string, string>}
 */
const accountColors = {
    orange: "#FF7A00",
    pink: "#FF5EB3",
    blue_pruple: "#6E52FF",
    purple: "#9327FF",
    turquoise: "#00BEE8",
    green_blue: "#1FD7C1",
    red_orange: "#FF745E",
    skin_color: "#FFA35E",
    light_pink: "#FC71FF",
    dark_yellow: "#FFC701",
    dark_blue: "#0038FF",
    lime: "#C3FF2B",
    yellow: "#FFE62B",
    light_red: "#FF4646",
    light_orange: "#FFBB2B"
};


/** Users path in Realtime Database. */
const USERS_PATH = "/users";

/** Local cache of user data. */
let userData = [];


/**
 * Load current user data from the database.
 * @param {string} [path="/users"] - Database path to load user data from.
 * @returns {Promise<void>}
 */
async function loadUserData(path = "/users") {
    try {
        let userResponse = await fetch(DATABASE_URL + path + ".json");
        let userResponseJson = await userResponse.json();
        userData = [];
        if (userResponseJson) {
            Object.keys(userResponseJson).forEach(key => {
                userData.push({
                    id: key,
                    initials: userResponseJson[key].initials,
                    name: userResponseJson[key].name,
                    email: userResponseJson[key].email,
                    phone: userResponseJson[key].phone,
                    color: userResponseJson[key].color
                });
            });
            if (typeof callback === 'function') callback(userData);
        }
    } catch (error) {
        console.error("Error loading DB-Data:", error);
    }
}


/**
 * Send a newly created contact to the database.
 * @param {Object} newProfile - The new profile object to be stored.
 * @returns {Promise<void>}
 */
async function sendNewContactToDB(newProfile) {
    try {
        const response = await fetch(DATABASE_URL + USERS_PATH + ".json", {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify(newProfile)
        });

        if (!response.ok) {
            throw new Error("ERROR");
        }

        await loadUserData();
        renderContactList(userData);
    } catch (error) {
        console.error("Failed to send new Profile Data to DB:", error);
    }
}


/**
 * Update an existing contact in the database.
 * @param {string} id - User ID.
 * @param {Object} updatedData - Updated profile data.
 * @returns {Promise<void>}
 */
async function updateContactToDB(id, updatedData) {
    try {
        const response = await fetch(DATABASE_URL + `/users/${id}` + ".json", {
            method : "PUT",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify(updatedData)
        });

        if (!response.ok) {
            throw new Error(`Can't delete User with ID ${id}`);
        }

        await loadUserData();
        renderContactDetailsClear();
        renderContactList(userData);
    } catch (error) {
        console.error("Failed to update current Contact to DB:", error);
    }
}


/**
 * Delete a contact from the database.
 * @param {string} id - User ID.
 * @returns {Promise<void>}
 */
async function deleteContactFromDB(id) {
    try {
        const response = await fetch(DATABASE_URL + `/users/${id}` + ".json", {
            method : "DELETE"
        });

        if (!response.ok) {
            throw new Error(`Can't delete User with ID ${id}`);
        }

        if(document.querySelector('.contactsOverlay').style.display == "block") {
            closePopup();
        }

        await loadUserData();
        renderContactList(userData);
    } catch (error) {
        console.error("Failed to delete current Contact from DB:", error);
    }
}


/**
 * Retrieve tasks from the database.
 * @param {string} [path="/tasks"] - Database path to tasks.
 * @returns {Promise<void>}
 */
async function getTasksFromDB(path = "/tasks") {

}
