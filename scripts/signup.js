const acceptCheckbox = document.getElementById('accept');
const signUpButton = document.getElementById('signUpButton');
const signupForm = document.getElementById('signupForm');
const popup = document.getElementById('signup-popup');
const overlay = document.getElementById('overlay');

// Sign-Up- aktiv wenn checkbox aktiv
acceptCheckbox.addEventListener('change', () => {
    signUpButton.disabled = !acceptCheckbox.checked;
});

signupForm.addEventListener('submit', (event) => {
    event.preventDefault(); 

    // Überprüfen, ob alle Eingabefelder ausgefüllt sind
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('passwordField').getAttribute('data-real-password');
    const confirmPassword = document.getElementById('confirmPasswordField').getAttribute('data-real-password');

    if (name && email && password && confirmPassword && acceptCheckbox.checked) {
        // Speichern im Local Storage
        localStorage.setItem('name', name);
        localStorage.setItem('email', email);
        localStorage.setItem('password', password);

        // Overlay und Popup anzeigen
        showPopup();

        // Weiterleitung zur Login-Seite nach 2 Sekunden
        setTimeout(() => {
            window.location.href = '../pages/log_in.html';
        }, 2000); // Weiterleitung nach 2 Sekunden
    } else {
        alert("Bitte füllen Sie alle Felder aus und akzeptieren Sie die Datenschutzrichtlinien.");
    }
});

function showPopup() {
    overlay.classList.remove('hidden'); // Overlay sichtbar machen
    popup.classList.remove('hidden'); // Popup sichtbar machen

    setTimeout(() => {
        overlay.classList.add('hidden'); // Overlay ausblenden
        popup.classList.add('hidden'); // Popup ausblenden
    }, 2000); // Popup verschwindet nach 2 Sekunden
}
