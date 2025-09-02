/**
 * Generate a random color for a new contact.
 * @returns {string} The randomly selected color value.
 */
function generateRandomColor() {
    let colorArray = Object.keys(accountColors);
    let randomNumber = Math.random();
    let colorIndex = Math.floor(randomNumber * colorArray.length);

    let randomKey = colorArray[colorIndex];
    let randomValue = accountColors[randomKey];
    return randomValue;
}


/**
 * Generate initials from the given name.
 * @param {string} nameValue - The full name.
 * @returns {string} The generated initials.
 */
function generateInitials(nameValue) {
    if (nameValue.includes(" ")) {
        let singleNames = nameValue.split(" ");
        return singleNames[0][0] + singleNames[1][0];
    } else {
        return nameValue.slice(0, 2).toUpperCase();
    }
}


/**
 * Sorts the contact list alphabetically by name.
 * @param {Object[]} userData - Array of user objects.
 */
function sortContactList(userData) {
    userData.sort((a, b) => {
        return a.name < b.name ? -1 : 1;
    });
}


/**
 * Renders the contact list into the DOM.
 * @param {Object[]} userData - Array of user objects.
 */
function renderContactList(userData) {
    sortContactList(userData);
    let contactListContainer = document.querySelector("#contactList");
    contactListContainer.innerHTML = "";

    let currentLetter = "";

    userData.forEach((singleContact, index) => {
        let firstLetter = singleContact.name.charAt(0).toUpperCase();

        if (firstLetter !== currentLetter) {
            currentLetter = firstLetter;

            contactListContainer.innerHTML += /*html*/`
            <div class="letterCategories">
                <span>${currentLetter}</span>
                <div class="seperatorLine"></div>
            </div>
            `;
        }

        contactListContainer.innerHTML += contactListRenderTemplate(singleContact, index);
    });
}


/**
 * Renders the details of a specific contact.
 * @param {string} userId - The ID of the user.
 * @param {number} index - Index of the user in the list.
 */
function renderContactDetails(userId, index) {
    let contactDetails = document.querySelector("#contactDetails");
    contactDetails.innerHTML = "";

    let contactOverlay = document.querySelector('.contactsOverlay');
    contactOverlay.innerHTML = "";

    singleUser = userData.find(user => user.id === userId);

    if (window.innerWidth <= 1150) {
        contactOverlay.style = "display: flex";
        contactOverlay.innerHTML = contactDetailsOverlayTemplate(singleUser, index);
    } else {
        contactDetails.innerHTML = contactDetailsRenderTemplate(singleUser, index);
    }
    
    editUserDetails = singleUser;
}


/**
 * Clears the contact details section.
 */
function renderContactDetailsClear() {
    let contactDetails = document.querySelector("#contactDetails");
    contactDetails.innerHTML = "";
}


/**
 * Validates the new contact form before submission.
 */
function checkContactFormValidation() {
    let nameRef = document.querySelector("#name");
    let emailRef = document.querySelector("#email");
    let phoneRef = document.querySelector("#phone");

    if (nameRef.value && emailRef.value && phoneRef.value !== "") {
        addNewContact();
    } else {
        if (nameRef.value == "") {
            nameRef.style = "border-bottom: 1px solid var(--form-val-wrong)";
        }

        if (emailRef.value == "") {
            emailRef.style = "border-bottom: 1px solid var(--form-val-wrong)";
        }

        if (phoneRef.value == "") {
            phoneRef.style = "border-bottom: 1px solid var(--form-val-wrong)";
        }
    }
}


/**
 * Checks and updates the border color for form fields based on validity.
 */
function checkFormValidation() {
    let nameRef = document.querySelector("#name");
    let emailRef = document.querySelector("#email");
    let phoneRef = document.querySelector("#phone");

    if (nameRef.value.trim() !== "") {
        nameRef.style.borderBottom = "1px solid var(--form-val-default)";
    }

    if (emailRef.value.trim() !== "") {
        emailRef.style.borderBottom = "1px solid var(--form-val-default)";
    }

    if (phoneRef.value.trim() !== "") {
        phoneRef.style.borderBottom = "1px solid var(--form-val-default)";
    }
}


/**
 * Adds a new contact to the database.
 */
function addNewContact() {
    let nameRef = document.querySelector("#name");
    let emailRef = document.querySelector("#email");
    let phoneRef = document.querySelector("#phone");

    let nameValue = nameRef.value;
    let emailValue = emailRef.value;
    let phoneValue = phoneRef.value;

    let randomColor = generateRandomColor();
    let initials = generateInitials(nameValue);

    let newProfile = {
        initials,
        name: nameValue,
        email: emailValue,
        phone: phoneValue,
        color: randomColor
    };

    sendNewContactToDB(newProfile);

    nameValue = "";
    emailValue = "";
    phoneValue = "";

    closePopup();
}


/**
 * Updates the data of an existing contact.
 * @param {string} id - The contact's ID.
 * @param {number} index - The contact's index in the list.
 */
function updateCurrentContact(id, index) {
    if (!validateEditForm()) return;

    const nameRef  = document.querySelector("#editName");
    const emailRef = document.querySelector("#editEmail");
    const phoneRef = document.querySelector("#editPhone");

    const updatedData = {
        initials: generateInitials(nameRef.value),
        name: nameRef.value.trim(),
        email: emailRef.value.trim(),
        phone: phoneRef.value.trim(),
        color: userData[index].color
    };

    updateContactToDB(id, updatedData);
    closePopup();
}


/**
 * Deletes a contact by ID.
 * @param {string} id - The contact's ID.
 */
function deleteContact(id) {
    deleteContactFromDB(id);
    renderContactDetailsClear();
    closeResponsiveDetailsOverlay();
}


/**
 * Highlights the background color for the selected contact.
 * @param {number} index - The contact's index.
 */
function checkBackgroundColor(index) {
    let allDivs = document.querySelectorAll(".contactListSingleContactItemContainer");
    let allSpans = document.querySelectorAll(".contactListSingleContactItemEmail");
    let selectedDiv = document.getElementById(`${index}`);
    let span = document.getElementById(`span${index}`);

    for (let i = 0; i < allDivs.length; i++) {
        const singleDiv = allDivs[i];
        singleDiv.classList.remove("backgroundColorBlue");

        const singleSpan = allSpans[i];
        singleSpan.classList.remove("backgroundColorBlue");
    }

    selectedDiv.classList.add("backgroundColorBlue");
    span.classList.add("backgroundColorBlue");
}


/**
 * Loads the contacts page and renders the contact list.
 */
function loadContactsPage() {
  loadUserData('/users').then(() => {
    renderContactList(userData);
  });
}
