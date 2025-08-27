// scripts/signup.js
// All comments converted to English JSDoc. Logic unchanged.

import { auth } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/**
 * Firebase Realtime Database REST endpoint.
 * Used for persisting user profiles.
 * @type {string}
 */
const DATABASE_URL = "https://join-kanban-board-3a477-default-rtdb.europe-west1.firebasedatabase.app/";

// ==============================
// DOM references
// ==============================
const acceptCheckbox = document.getElementById('accept');
const signUpButton   = document.getElementById('signUpButton');
const signupForm     = document.getElementById('signupForm');
const popup          = document.getElementById('signup-popup');
const overlay        = document.getElementById('overlay');

const nameInput      = document.getElementById('name');
const emailInput     = document.getElementById('email');
const passInput      = document.getElementById('passwordField');
const confirmInput   = document.getElementById('confirmPasswordField');

// Error spans
const nameError      = document.getElementById('nameError');
const emailError     = document.getElementById('emailError');
const passwordError  = document.getElementById('passwordError');
const confirmError   = document.getElementById('confirmError');
const acceptError    = document.getElementById('acceptError');


/**
 * Toggle field validity state and error message visibility.
 * @param {HTMLInputElement|null} inputEl
 * @param {boolean} isValid
 * @param {HTMLElement|null} errorEl
 */
function setFieldValidity(inputEl, isValid, errorEl) {
  if(!inputEl || !errorEl) return;
  inputEl.classList.toggle('invalid', !isValid);
  errorEl.style.display = isValid ? 'none' : 'flex';
}


/**
 * Retrieve the true password value from masked input (or fallback to .value).
 * @param {HTMLInputElement} fieldEl
 * @returns {string}
 */
function getRealPassword(fieldEl) {
  return fieldEl?.getAttribute?.('data-real-password') || fieldEl?.value || '';
}


/**
 * Build initials from the first two words of a name.
 * @param {string} fullName
 * @returns {string} Uppercase initials
 */
function initialsFromName(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  const a = (parts[0] || '').charAt(0);
  const b = (parts[1] || '').charAt(0);
  return (a + b).toUpperCase() || (a.toUpperCase() || '');
}


/** Account color palette (deterministic assignment by email hash). */
const ACCOUNT_COLORS = ["#FF7A00","#FF5EB3","#6E52FF","#9327FF","#00BEE8","#1FD7C1","#FF745E","#FFA35E","#FC71FF","#FFC701","#0038FF","#C3FF2B","#FFE62B","#FF4646","#FFBB2B"];

/**
 * Deterministically pick a color for a user based on their email string.
 * @param {string} email
 * @returns {string} HEX color
 */
function pickColorForEmail(email) {
  const s = String(email || '');
  let h = 0;
  for (let i=0;i<s.length;i++) { h = (h*31 + s.charCodeAt(i)) >>> 0; }
  return ACCOUNT_COLORS[h % ACCOUNT_COLORS.length];
}


/** Validate that name field is non-empty. */
function validateNameField() {
  const ok = nameInput.value.trim().length > 0;
  setFieldValidity(nameInput, ok, nameError);
  return ok;
}


/** Validate email against a standard regex. */
function validateEmailField() {
  const v = emailInput.value.trim();
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  setFieldValidity(emailInput, ok, emailError);
  return ok;
}


/** Validate password length (>=6 characters by default). */
function validatePasswordField() {
  const pw = getRealPassword(passInput);
  const ok = pw.length >= 6;
  setFieldValidity(passInput, ok, passwordError);
  return ok;
}


/** Validate that confirm password matches original password. */
function validateConfirmPasswordField() {
  const pw  = getRealPassword(passInput);
  const cpw = getRealPassword(confirmInput);
  const ok = cpw.length > 0 && pw === cpw;
  setFieldValidity(confirmInput, ok, confirmError);
  return ok;
}


/** Validate that user accepted the terms checkbox. */
function validateAcceptField() {
  const ok = !!acceptCheckbox?.checked;
  if (acceptError) acceptError.style.display = ok ? 'none' : 'flex';
  return ok;
}


/**
 * Run all field validations and update the sign-up button enabled state.
 * @returns {boolean} Whether all validations passed.
 */
function validateSignUpForm() {
  const a = validateNameField();
  const b = validateEmailField();
  const c = validatePasswordField();
  const d = validateConfirmPasswordField();
  const e = validateAcceptField();

  const all = a && b && c && d && e;
  if (signUpButton) signUpButton.disabled = !all;
  return all;
}


// ==============================
// Live validation bindings
// ==============================
nameInput?.addEventListener('input', validateSignUpForm);
emailInput?.addEventListener('input', validateSignUpForm);
passInput?.addEventListener('input', validateSignUpForm);
confirmInput?.addEventListener('input', validateSignUpForm);
acceptCheckbox?.addEventListener('change', validateSignUpForm);

// Initial state: disabled until valid
if (signUpButton) signUpButton.disabled = true;

// Disable native bubbles
emailInput?.addEventListener('invalid', e => e.preventDefault());
nameInput?.addEventListener('invalid', e => e.preventDefault());
passInput?.addEventListener('invalid', e => e.preventDefault());
confirmInput?.addEventListener('invalid', e => e.preventDefault());


// ==============================
// Submit handler (Firebase Auth)
// ==============================
signupForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!validateSignUpForm()) return;

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = getRealPassword(passInput);

  try {
    // Create account in Firebase Auth
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // Set displayName
    await updateProfile(cred.user, { displayName: name });

    // Save public profile in Realtime DB
    const uid = cred.user.uid;
    const profile = {
      id: uid,
      name,
      email,
      phone: "",
      initials: initialsFromName(name),
      color: pickColorForEmail(email),
      createdAt: new Date().toISOString()
    };

    await fetch(`${DATABASE_URL}/users/${uid}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });

    // Success popup + redirect
    showPopup();
    setTimeout(() => {
      window.location.href = '../pages/log_in.html';
    }, 1500);

  } catch (err) {
    console.error("Sign-up failed:", err);
    if (emailError) { emailError.textContent = err.message || 'Failed to sign up.'; emailError.style.display = 'flex'; }
    if (passwordError) { passwordError.style.display = 'flex'; }
  }
});


/**
 * Show success popup with overlay, auto-hide after 1.5s.
 */
function showPopup() {
  overlay?.classList?.remove('hidden');
  popup?.classList?.remove('hidden');
  setTimeout(() => {
    overlay?.classList?.add('hidden');
    popup?.classList?.add('hidden');
  }, 1500);
}
