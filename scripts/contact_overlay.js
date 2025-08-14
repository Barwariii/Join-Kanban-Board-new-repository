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
        console.error("Der 'Add new Contact'-Button wurde nicht gefunden.");
    }

    // Edit Contact
    if (editContactBtn) {
        editContactBtn.addEventListener('click', openEditContactPopup);
    }
});


// Function to open the Add Contact pop-up
function openAddContactPopup() {
    document.querySelector('.contactsOverlay').style.display = 'block'; // Make the pop-up visible
    document.querySelector('.contactsOverlay').innerHTML = renderAddContactOverlay();
}


function validateEditForm() {
    const nameRef = document.querySelector("#editName");
    const emailRef = document.querySelector("#editEmail");
    const phoneRef = document.querySelector("#editPhone");
    const saveBtn = document.querySelector("#editSaveBtn");

    const nameOk = nameRef.value.trim() !== "";
    const emailOk = emailRef.value.trim() !== "";
    const phoneOk = phoneRef.value.trim() !== "";

    // Rote Linie wenn leer, Standard wenn gefüllt
    nameRef.style.borderBottom = nameOk ? "1px solid var(--form-val-default)" : "1px solid var(--form-val-wrong)";
    emailRef.style.borderBottom = emailOk ? "1px solid var(--form-val-default)" : "1px solid var(--form-val-wrong)";
    phoneRef.style.borderBottom = phoneOk ? "1px solid var(--form-val-default)" : "1px solid var(--form-val-wrong)";

    // Save nur aktiv, wenn alle Felder gefüllt
    if (saveBtn) saveBtn.disabled = !(nameOk && emailOk && phoneOk);

    return nameOk && emailOk && phoneOk;
}



// Function to open the Edit Contact pop-up
let editUserDetails;
function openEditContactPopup(index) {
    document.querySelector('.contactsOverlay').style.display = 'block';
    document.querySelector('.contactsOverlay').innerHTML = renderEditContactOverlay(editUserDetails, index);
}


// Function to close the pop-up
function closePopup() {
    document.querySelector('.contactsOverlay').style.display = 'none'; // Hide the pop-up
}


// Function to disable the button
function addBtnDisable() {
    document.querySelector(".add")
}

//Function for dropdown contact info overlay for responsive
function dropDownEditAndDelete() {
    let editAndDeleteDropdown = document.getElementById('dropDownMenuForSpecialContact');
    editAndDeleteDropdown.style.display = editAndDeleteDropdown.style.display === "none" ? "block" : "none";
}

//Function for blue arrow pointing to Li ("back arrow")
function goBack() {
    window.history.back();
}

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
