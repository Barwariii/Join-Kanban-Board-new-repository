/**
* Navigate back to the main index page.
*/
function goBack() {
    window.location.href = '../index.html';
}


/**
* Navigate to the login page.
*/
function goToLogin() {
    window.location.href = '../pages/log_in.html';
}


/**
* Navigate to the registration page.
*/
function goToRegister() {
    window.location.href = '../pages/register.html';
}


/**
* Toggle the visibility of the dropdown bar (logout, legal notice, privacy policy).
*/
function toggledropDownBar() {
  document.getElementById("dropDownBar").classList.toggle("activ");
}