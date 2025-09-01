// scripts/login.js
// All comments converted to English JSDoc. Logic unchanged.

import { auth } from './firebase.js';
import {
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


/**
 * Handle intro logo animation completion.
 * Adds the `intro-done` class on the <body> when the animation ends,
 * with a timeout fallback to ensure the class is applied even if the
 * animationend event does not fire.
 */
document.addEventListener('DOMContentLoaded', () => {
  const logo = document.querySelector('.intro__logo');
  if (logo) {
    const done = () => document.body.classList.add('intro-done');
    logo.addEventListener('animationend', done, { once: true });
    // Fallback if the event does not fire for any reason
    setTimeout(done, 1400);
  }
});


/**
 * Main login bootstrap. Binds validators, masking, remember-me helpers,
 * and performs the authentication flow. Mirrors the UX of signup.js.
 */
document.addEventListener('DOMContentLoaded', () => {

  /**
   * DOM references
   */
  const form = document.querySelector('.login-form');
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('passwordField');
  const rememberCb = document.getElementById('remember');

  /**
   * Error spans (like signup)
   */
  const emailError = document.getElementById('loginEmailError');
  const passwordError = document.getElementById('loginPasswordError');
  const generalError = document.getElementById('loginGeneralError');


  /**
   * Always start with a signed-out state to avoid auto sign-in.
   * Errors are ignored intentionally.
   */
  signOut(auth).catch(() => { });


  /** 
   * LocalStorage key used for the remember-me bundle. 
   * Remember-me helpers
   */
  const REMEMBER_KEY = 'join.remember.v1';
  /** App-scoped secret used to derive a non-exportable AES key (not a true secret). */
  const APP_SECRET = 'join-remember-secret-v1';

  const enc = new TextEncoder();
  const dec = new TextDecoder();


  /**
   * Derive and import an AES-GCM key from APP_SECRET via SHA-256 digest.
   * @returns {Promise<CryptoKey>} Non-exportable AES-GCM key with encrypt/decrypt usages.
   */
  async function getAesKey() {
    const hash = await crypto.subtle.digest('SHA-256', enc.encode(APP_SECRET));
    return crypto.subtle.importKey('raw', hash, 'AES-GCM', false, ['encrypt', 'decrypt']);
  }


  /**
   * Convert an ArrayBuffer/TypedArray to base64 string.
   * @param {ArrayBuffer|Uint8Array} buf
   * @returns {string}
   */
  function b64FromBytes(buf) {
    const u8 = new Uint8Array(buf);
    let s = ''; for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
    return btoa(s);
  }


  /**
   * Convert a base64 string back to a Uint8Array.
   * @param {string} b64
   * @returns {Uint8Array}
   */
  function bytesFromB64(b64) {
    const s = atob(b64);
    const u8 = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) u8[i] = s.charCodeAt(i);
    return u8;
  }


  /**
   * Encrypt plaintext using AES-GCM with a random IV.
   * @param {string} plain
   * @returns {Promise<{iv:string, ct:string}>} Base64 IV and ciphertext pair.
   */
  async function encryptText(plain) {
    const key = await getAesKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plain));
    return { iv: b64FromBytes(iv), ct: b64FromBytes(ct) };
  }


  /**
   * Decrypt AES-GCM ciphertext back to a UTF-8 string.
   * @param {string} ivB64 Base64-encoded IV
   * @param {string} ctB64 Base64-encoded ciphertext
   * @returns {Promise<string>} Decrypted plaintext
   */
  async function decryptText(ivB64, ctB64) {
    const key = await getAesKey();
    const iv = bytesFromB64(ivB64);
    const ct = bytesFromB64(ctB64);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return dec.decode(pt);
  }


  /**
   * Persist the email and encrypted password to LocalStorage.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<void>}
   */
  async function saveRemember(email, password) {
    try {
      const { iv, ct } = await encryptText(password);
      localStorage.setItem(REMEMBER_KEY, JSON.stringify({ email, iv, ct }));
    } catch { }
  }


  /**
   * Remove any persisted remember-me bundle from LocalStorage.
   */
  function clearRemember() {
    localStorage.removeItem(REMEMBER_KEY);
  }


  /**
   * Load remembered credentials, prefill fields, and apply masked password UX.
   * Silently clears storage if parsing/decryption fails.
   * @returns {Promise<void>}
   */
  async function loadRemember() {
    try {
      const raw = localStorage.getItem(REMEMBER_KEY);
      if (!raw) return;
      const { email, iv, ct } = JSON.parse(raw || '{}');
      if (!email || !iv || !ct) return;
      const pw = await decryptText(iv, ct);

      // Prefill + mask like signup style
      emailInput.value = email;
      passInput.setAttribute('data-real-password', pw);
      passInput.value = '*'.repeat(pw.length);
      if (rememberCb) rememberCb.checked = true;
    } catch {
      clearRemember();
    }
  }


  /**
   * Invoke remember-me loader after helpers are declared, to avoid TDZ issues
   * and ensure constants like REMEMBER_KEY are initialized.
   * @returns {Promise<void>}
   */
  loadRemember();


  /**
   * Validation & UI helpers (signup parity)
   * Toggle field validity UI and error text.
   * @param {HTMLInputElement|null} inputEl
   * @param {boolean} isValid
   * @param {HTMLElement|null} errorEl
   * @param {string} [msg]
   */
  function setFieldValidity(inputEl, isValid, errorEl, msg = '') {
    if (!inputEl || !errorEl) return;
    inputEl.classList.toggle('invalid', !isValid);
    if (!isValid && msg) errorEl.textContent = msg;
    errorEl.style.display = isValid ? 'none' : 'flex';
  }


  /**
   * Retrieve the true password from the masked field.
   * @param {HTMLInputElement} fieldEl
   * @returns {string}
   */
  function getRealPassword(fieldEl) {
    return fieldEl?.getAttribute?.('data-real-password') || fieldEl?.value || '';
  }


  /** Hide the general error area. */
  function hideGeneral() { if (generalError) generalError.style.display = 'none'; }


  /**
   * Show a general (form-level) error message.
   * @param {string} msg
   */
  function showGeneral(msg) {
    if (generalError) {
      generalError.textContent = msg;
      generalError.style.display = 'flex';
    }
  }


  /**
   * Password masking handler that mirrors signup UX.
   * It keeps the actual value in `data-real-password` and shows asterisks.
   * Bound both via inline `oninput` and JS event listeners for robustness.
   */
  window.maskPassword = function () {
    const prev = passInput.getAttribute('data-real-password') || '';
    const vis = passInput.value;
    let next = prev;
    if (vis.length > prev.length) next = prev + vis.slice(prev.length);
    else if (vis.length < prev.length) next = prev.slice(0, -1);
    passInput.setAttribute('data-real-password', next);
    passInput.value = '*'.repeat(next.length); // or '•'
  };

  passInput.addEventListener('input', window.maskPassword);
  passInput.addEventListener('paste', (e) => {
    e.preventDefault();
    const clip = (e.clipboardData || window.clipboardData)?.getData('text') || '';
    const prev = passInput.getAttribute('data-real-password') || '';
    const next = prev + clip;
    passInput.setAttribute('data-real-password', next);
    passInput.value = '*'.repeat(next.length);
  });


  /**
   * Validate email format.
   * @returns {boolean}
   */
  function validateEmailField() {
    const v = (emailInput.value || '').trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    setFieldValidity(emailInput, ok, emailError, 'Please enter a valid email address.');
    return ok;
  }


  /**
   * Validate non-empty password (uses real password value under mask).
   * @returns {boolean}
   */
  function validatePasswordField() {
    const pw = getRealPassword(passInput);
    const ok = pw.length > 0;
    setFieldValidity(passInput, ok, passwordError, 'Please enter your password.');
    return ok;
  }


  /**
   * Disable native bubbles
   */
  emailInput.addEventListener('invalid', e => e.preventDefault());
  passInput.addEventListener('invalid', e => e.preventDefault());

  emailInput.addEventListener('input', () => { validateEmailField(); hideGeneral(); });
  passInput.addEventListener('input', () => { validatePasswordField(); hideGeneral(); });


  /**
   * Inline submit validator bound from HTML (onsubmit). Always returns false
   * to keep the page on the same document and run async login logic.
   * @param {SubmitEvent} [ev]
   * @returns {false}
   */
  window.validateLogin = function (ev) {
    if (ev && ev.preventDefault) ev.preventDefault();

    // Client-side format checks
    const a = validateEmailField();
    const b = validatePasswordField();
    if (!(a && b)) return false;

    runLogin(); // async
    return false;
  };


  /**
   * Execute the Firebase login flow with persistence based on remember-me.
   * Shows field-level or general errors depending on error type.
   * On success, redirects to ../index.html.
   * @returns {Promise<void>}
   */
  async function runLogin() {
    const { email, password } = prepareLoginInputs();
    try {
      await doFirebaseSignIn(email, password, !!rememberCb?.checked);
      window.location.href = '../index.html';
    } catch (err) {
      handleLoginError(err);
    }
  }


  /**
 * Prepare inputs and clear inline errors before calling Firebase.
 * @returns {{email:string, password:string}}
 */
  function prepareLoginInputs() {
    const email = (emailInput.value || '').trim();
    const password = getRealPassword(passInput);
    setFieldValidity(emailInput, true, emailError);
    setFieldValidity(passInput, true, passwordError);
    hideGeneral();
    return { email, password };
  }

  /**
   * Set persistence, sign in, and handle remember-me storage.
   * @param {string} email
   * @param {string} password
   * @param {boolean} remember
   * @returns {Promise<void>}
   */
  async function doFirebaseSignIn(email, password, remember) {
    const persistence = remember ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistence);
    await signInWithEmailAndPassword(auth, email, password);
    if (remember) { await saveRemember(email, password); } else { clearRemember(); }
  }

  /**
   * Map Firebase error codes to UI feedback (same messages as before).
   * @param {any} err
   * @returns {void}
   */
  function handleLoginError(err) {
    console.error('Login failed:', err);
    const code = err?.code || '';
    if (code === 'auth/invalid-email') {
      setFieldValidity(emailInput, false, emailError, 'Please enter a valid email address.');
      return;
    }
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      setFieldValidity(emailInput, true, emailError);
      setFieldValidity(passInput, true, passwordError);
      showGeneral('Email or password is incorrect.');
      return;
    }
    if (code === 'auth/too-many-requests') {
      showGeneral('Too many attempts. Please try again later.');
    } else {
      showGeneral(err.message || 'Failed to sign in.');
    }
  }
  
  
  /**
   * Guest login handler that redirects to ../index.html without authentication.
   * Bound from inline HTML onclick for robustness.
   * @returns {void}
   */
  window.guestLogin = function () { window.location.href = '../index.html'; };
});
