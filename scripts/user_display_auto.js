import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

/**
 * Convert a full name or email-like string into 1–2 uppercase initials.
 * Replaces separators (., _, -) with spaces, splits on whitespace, and
 * returns either the first letter or first + last letters.
 * @param {string} nameOrEmail
 * @returns {string} Uppercase initials (e.g., "AB"). Falls back to '??' if empty.
 */
function toInitials(nameOrEmail) {
  const s = String(nameOrEmail || '').trim();
  if (!s) return '??';
  const parts = s.replace(/[_.-]+/g, ' ').split(/\s+/).filter(Boolean);
  if (parts.length === 1) return (parts[0][0] || '?').toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}


/**
 * Pick a displayable name for the user in this order:
 * 1) Firebase user's displayName
 * 2) name cached in localStorage under 'join:name'
 * 3) local-part of email with separators prettified
 * 4) 'Guest'
 * @param {import('firebase/auth').User|null} user
 * @returns {string}
 */
function pickName(user) {
  const localName = localStorage.getItem('join:name');
  const fromEmail = (user?.email || '').split('@')[0]?.replace(/[_.-]+/g, ' ');
  return user?.displayName || localName || fromEmail || 'Guest';
}


/**
 * Compute a time-based greeting in English based on local hours.
 * @param {Date} [date=new Date()]
 * @returns {"Good morning,"|"Good afternoon,"|"Good evening,"|"Good night,"}
 */
function computeGreeting(date = new Date()) {
  const h = date.getHours();
  if (h >= 5 && h < 12)  return 'Good morning,';
  if (h >= 12 && h < 17) return 'Good afternoon,';
  if (h >= 17 && h < 21) return 'Good evening,';
  return 'Good night,';
}


/**
 * Populate username and initials in the DOM.
 * - Fills all .dashboardUsername with a prefixed space + name (or ' Guest').
 * - Fills all .headerProfileLetter with derived initials.
 * @param {string} name
 */
function setNameInDOM(name) {
  document.querySelectorAll('.dashboardUsername')
    .forEach(el => el.textContent = name ? ' ' + name : ' Guest');

  const initials = toInitials(name || 'Guest');
  document.querySelectorAll('.headerProfileLetter')
    .forEach(el => el.textContent = initials);
}


/**
 * Ensure that the greeting + username span exists inside .dashboardHeader h1.
 * If it exists, refresh the greeting text while keeping a username span placeholder.
 */
function ensureGreetingSpan() {
  const h1 = document.querySelector('.dashboardHeader h1');
  if (!h1) return;
  if (!h1.querySelector('.dashboardUsername')) {
    h1.innerHTML = `${computeGreeting()}<span class="dashboardUsername"></span>`;
  } else {
    // Update greeting text and keep the username span placeholder
    const span = h1.querySelector('.dashboardUsername');
    span.remove();
    h1.innerHTML = `${computeGreeting()}<span class="dashboardUsername"></span>`;
  }
}


/**
 * Auto-initialize greeting/username once DOM is ready, then subscribe to
 * auth state changes to update the visible name/initials reactively.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Provide empty elements if necessary
  ensureGreetingSpan();
  setNameInDOM('Guest'); // Temporary name until auth state arrives

  onAuthStateChanged(auth, (user) => {
    setNameInDOM(user ? pickName(user) : 'Guest');
  });
});
