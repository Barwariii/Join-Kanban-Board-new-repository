/**
 * Contact Templates
 */

// Contact List Template
function contactListRenderTemplate(singleContact, index) {
    return /*html*/`
    <div class="contactListSingleContactItemContainer" id="${index}" onclick="renderContactDetails('${singleContact.id}', ${index}), checkBackgroundColor(${index})">
        <div class="contactListSingleContactItemProfilePicture" style="background-color: ${singleContact.color}">
            <span>${singleContact.initials}</span>
        </div>

        <div class="contactListSingleContactItemInfoContainer">
            <span class="contactListSingleContactItemName">${singleContact.name}</span>
            <span class="contactListSingleContactItemEmail" id="span${index}">${singleContact.email}</span>
        </div>
    </div>
    `;
}

// Contact Details Template
function contactDetailsRenderTemplate(singleUser, index) {
    return /*html*/`
    <div class="upperContainer">
        <div>
            <div class="circle" id="initialienForCircle" style="background-color: ${singleUser.color}">
                <span>${singleUser.initials}</span>
            </div>
        </div>
        <div class="nameAndIcons">
            <div id="fullName">
                <h1>${singleUser.name}</h1>
            </div>
            <div class="editAndDeleteIcon">
                <div class="editIcon" onclick="openEditContactPopup(${index})">
                    <img src="../assets/icons/edit.svg">
                    <p>Edit</p>
                </div>
                <div class="deleteIcon" onclick="deleteContact('${singleUser.id}')">
                    <img src="../assets/icons/delete.svg">
                    <p>Delete</p>
                </div>
            </div>
        </div>
    </div>
    <div>
        <h2 class ="h2ForContactInformation">Contact Information</h2>
        <div class="EmailInContactInformation">
            <span style="font-weight: bold">Email</span> <br>
            <span style="color: #4589FF">${singleUser.email}</span>
        </div>
        <div class="PhoneInContactInformation">
            <span style="font-weight: bold">Phone</span> <br>
            <span>${singleUser.phone}</span>
        </div>
    </div>
    `;
}

// contact details overlay ab einer max-width von 950px
function contactDetailsOverlayTemplate(singleUser, index) {
    return /*html*/ `
    
    <div class="contactDetailsOverlayForMaxWitdh950PX">
        <div class="contactInfoAndBlueArrowLeft">
            <span class="contactListInformation">Contact Information</span>
            <img class="blueLeftArrow" src="../assets/icons/arrow_left_line.svg" onclick="closeResponsiveDetailsOverlay(${index})">
        </div>
        <div class="circleFirstLetterAndName">
            <div class="circleWithFirstLettersOfFirstAndLastName" style="background-color: ${singleUser.color}">
                <span class="firstLetterFromFirsAndLastName">${singleUser.initials}</span>
            </div>
            <span class="nameOfSpecificContact">${singleUser.name}</span>
        </div>
        <div class="emailAndLinkForSpecificContact">
            <span class="emailTextInOverlay">Email</span>
            <a class="linkForTheEmailForOverlayContact" href="">${singleUser.email}</a>
        </div>
        <div class="phoneAndSpecificNumber">
            <span class="PhoneNumberForOverlayContact">Phone</span>
            <span class="numberForPhone">${singleUser.phone}</span>
        </div>
        <div class="contacts-menu">
        <div class="blueThreePointBtn">
            <button class="threePointsBlueBtn" onclick="dropDownEditAndDelete()">
                <img src="../assets/icons/three_points.svg">
            </button>
        </div>
        <div class="dropDownContainerForSpecialContactInfo" id="dropDownMenuForSpecialContact" style="display: none;">
            <div class="editAndSpanTextForSpecialContactInfo" onclick="openEditContactPopup(${index})">
                <img src="../assets/icons/edit.svg">
                <span class="spanInspecialContactDiv">Edit</span>
            </div>
            <div class="deleteandSpanTextForSpecialConactInfo" onclick="deleteContact('${singleUser.id}')">
                <img src="../assets/icons/delete.svg">
                <span class="spanInspecialContactDiv">Delete</span>
            </div>
        </div>
</div>
    </div>
`
}

/* Contact Overlay Templates */
// Add Contact Overlay
function renderAddContactOverlay() {
    return /*html*/`
    <div class="popUpAddNewContact" onclick="event.stopPropagation()">
        <div class="popUpTop">
            <img class="logoAddContact" src="../assets/icons/logo_add_contact.svg" alt="Add Contact Logo">
            <span class="addContactText">Add Contact</span>
            <span class="addContactTextBottom">Tasks are better with a team!</span>
        </div>
        <img class="closePopupIcon" src="../assets/icons/x_add_contact_icon.svg" alt="Close Popup" onclick="closePopup()">

        <div class="contactFormSection">
            <div class="profileImg">
                <span>
                    <img src="../assets/icons/person.png" alt="">
                </span>
            </div>
            <form class="contactForm">
                <div class="inputGroup">
                    <input type="text" placeholder="Name" value="" id="name" onkeyup="checkFormValidation()">
                    <label for="name" class="contactFormIcon">
                        <img src="../assets/icons/person.png" alt="">
                    </label>
                </div>
                <div class="inputGroup">
                    <input type="email" placeholder="Email" value="" id="email" onkeyup="checkFormValidation()">
                    <label for="email" class="contactFormIcon">
                        <img src="../assets/icons/mail.png" alt="">
                    </label>
                </div>
                <div class="inputGroup">
                    <input type="tel" placeholder="Phone" value="" id="phone" onkeyup="checkFormValidation()">
                    <label for="phone" class="contactFormIcon">
                        <img src="../assets/icons/call.png" alt="">
                    </label>
                </div>
                <div class="buttons">
                    <button type="button" class="cancelContactBtnOverlay" onclick="closePopup()">Cancel &times;</button>
                    <button type="button" class="createContactBtn" onclick="checkContactFormValidation()">
                        Create contact <img src="/assets/icons/check.png" alt="">
                    </button>
                </div>
            </form>
        </div>
    </div>
    `;
}


// Edit Contact Overlay
function renderEditContactOverlay(editUserDetails, index) {
    return /*html*/`
    <div class="overlayEditContact" onclick="event.stopPropagation()">
        <div class="popUpEditContact">
            <div class="popUpBottom">
                <img class="logoAddContact" src="../assets/icons/logo_add_contact.svg" alt="Add Contact Logo">
                <span class="addContactText">Edit contact</span>
            </div>
            <img class="closePopupIcon" src="../assets/icons/x_add_contact_icon.svg" alt="Close Popup" onclick="closePopup()">

            <div class="contactFormSection">
                <div class="profileImg">
                    <span>
                        <img src="../assets/icons/person.png" alt="">
                    </span>
                </div>
                <form class="contactForm">
                    <div class="inputGroup">
                        <input type="text" value="${editUserDetails.name}" id="editName" placeholder="Name" oninput="validateEditForm()">
                        <label for="name" class="contactFormIcon">
                            <img src="../assets/icons/person.png" alt="">
                        </label>
                    </div>
                    <div class="inputGroup">
                        <input type="email" value="${editUserDetails.email}" id="editEmail" placeholder="email" oninput="validateEditForm()">
                        <label for="email" class="contactFormIcon">
                            <img src="../assets/icons/mail.png" alt="">
                        </label>
                    </div>
                    <div class="inputGroup">
                        <input type="tel" value="${editUserDetails.phone}" id="editPhone" placeholder="phone" oninput="validateEditForm()">
                        <label for="phone" class="contactFormIcon">
                            <img src="../assets/icons/call.png" alt="">
                        </label>
                    </div>
                    <div class="buttons">
                        <button type="button" class="cancelContactBtnOverlay" onclick="deleteContact('${editUserDetails.id}')">Delete</button>
                        <button type="button" class="saveContactBtn" onclick="updateCurrentContact('${editUserDetails.id}', ${index})">
                            Save <img src="../assets/icons/check.png" alt="">
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `;
}