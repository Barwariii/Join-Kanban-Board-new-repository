/**
 * Added eventListener to handle addContact Overlay
 */
document.addEventListener('DOMContentLoaded', function () {
    // Event listener for the "Add new Contact" button
    const addContactBtn = document.querySelector('.addNewContactBtn');
    const editContactBtn = document.querySelector('.contactListSingleContactItemContainer');

    // Check if the button exists and an event listener was added
    if (addContactBtn) {
        addContactBtn.addEventListener('click', openAddContactPopup);
        addContactBtn.addEventListener('click', addBtnDisable);
    } else {
        console.error("The 'Add new Contact' button was not found.");
    }

    // Edit Contact
    if (editContactBtn) {
        editContactBtn.addEventListener('click', openEditContactPopup);
    }
});


/**
 * Open the Add Contact pop-up overlay.
 */
function openAddContactPopup() {
    document.querySelector('.contactsOverlay').style.display = 'block'; // Make the pop-up visible
    document.querySelector('.contactsOverlay').innerHTML = renderAddContactOverlay();
}


/**
 * Validate the Edit Contact form fields.
 * @returns {boolean} True if all fields are filled correctly, false otherwise.
 */
function validateEditForm() {
    const nameRef = document.querySelector("#editName");
    const emailRef = document.querySelector("#editEmail");
    const phoneRef = document.querySelector("#editPhone");
    const saveBtn = document.querySelector("#editSaveBtn");

    const nameOk = nameRef.value.trim() !== "";
    const emailOk = emailRef.value.trim() !== "";
    const phoneOk = phoneRef.value.trim() !== "";

    // Red underline if empty, default if filled
    nameRef.style.borderBottom = nameOk ? "1px solid var(--form-val-default)" : "1px solid var(--form-val-wrong)";
    emailRef.style.borderBottom = emailOk ? "1px solid var(--form-val-default)" : "1px solid var(--form-val-wrong)";
    phoneRef.style.borderBottom = phoneOk ? "1px solid var(--form-val-default)" : "1px solid var(--form-val-wrong)";

    // Enable Save button only if all fields are filled
    if (saveBtn) saveBtn.disabled = !(nameOk && emailOk && phoneOk);

    return nameOk && emailOk && phoneOk;
}


/**
 * Open the Edit Contact pop-up overlay.
 * @param {number} index - The index of the contact to edit.
 */
let editUserDetails;
function openEditContactPopup(index) {
    document.querySelector('.contactsOverlay').style.display = 'block';
    document.querySelector('.contactsOverlay').innerHTML = renderEditContactOverlay(editUserDetails, index);
}


/**
 * Close the contacts pop-up overlay.
 */
function closePopup() {
    document.querySelector('.contactsOverlay').style.display = 'none'; // Hide the pop-up
}


/**
 * Disable the add button (placeholder function).
 */
function addBtnDisable() {
    document.querySelector(".add");
}


/**
 * Toggle dropdown for contact info overlay in responsive view.
 */
function dropDownEditAndDelete() {
    let editAndDeleteDropdown = document.getElementById('dropDownMenuForSpecialContact');
    editAndDeleteDropdown.style.display = editAndDeleteDropdown.style.display === "none" ? "block" : "none";
}


/**
 * Navigate back using the browser history.
 */
function goBack() {
    window.history.back();
}


/**
 * Close the responsive contact details overlay and reset background colors.
 * @param {number} index - The index of the contact overlay to close.
 */
function closeResponsiveDetailsOverlay(index) {
    let contactOverlay = document.querySelector('.contactsOverlay');
    contactOverlay.style = "display: none";

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
}
