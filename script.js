/**
 * Base URL of the Firebase Realtime Database used by the app.
 * @type {string}
 */
const DATABASE_URL = "https://join-kanban-board-3a477-default-rtdb.europe-west1.firebasedatabase.app/";



/**
 * Toggle the dropdown visibility for logout, legal notice, and privacy policy.
 * Adds/removes the "activ" class on the element with id "dropDownBar".
 * @returns {void}
 */
function toggledropDownBar() {
  document.getElementById("dropDownBar").classList.toggle("activ");
}



/**
 * Display the current date inside the element with id "currentDate".
 * Uses locale "en-US" and options { year: "numeric", month: "long", day: "numeric" }.
 * @returns {void}
 */
function displayCurrentDate() {
  const dateElement = document.getElementById("currentDate");

  // Current date
  const today = new Date();
  const options = { year: "numeric", month: "long", day: "numeric" };

  // Format the date here for DT: 'de-DE'
  const formattedDate = today.toLocaleDateString("en-US", options);

  // Inserts the date 
  dateElement.textContent = formattedDate;
}



/**
 * Update the greeting message based on the current hour and inject it
 * into '.dashboardHeader h1' with a span '.dashboardUsername' placeholder.
 * @returns {void}
 */
function updateGreeting() {
  const hour = new Date().getHours();
  let greeting;

  if (hour >= 5 && hour < 12) {
    greeting = "Good morning,";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon,";
  } else if (hour >= 17 && hour < 21) {
    greeting = "Good evening,";
  } else {
    greeting = "Good night,";
  }

  document.querySelector('.dashboardHeader h1').innerHTML = `${greeting}<span class="dashboardUsername"></span>`;
}



/**
 * Create initials from a full name or email string.
 * Replaces separators (., _, -) with spaces and uses the first and last tokens.
 * @param {string} nameOrEmail - Raw name or email address to derive initials from.
 * @returns {string} Two-letter initials (or '??' if input is empty).
 */
function toInitials(nameOrEmail) {
  const s = String(nameOrEmail || '').trim();
  if (!s) return '??';
  // Generate initials from full name or email (replace . _ - with spaces)
  const parts = s.replace(/[_.-]+/g, ' ').split(/\s+/).filter(Boolean);
  if (parts.length === 1) return (parts[0][0] || '?').toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}



/**
 * Fill all ".dashboardUsername" elements with the provided display name
 * and set the header profile initials in ".headerProfileLetter" elements.
 * @param {string} raw - The raw display name string.
 * @returns {void}
 */
function setDashboardName(raw) {
  const name = String(raw || '').trim();

  // Greeting: fill all .dashboardUsername elements
  document.querySelectorAll('.dashboardUsername')
    .forEach(el => el.textContent = name ? ' ' + name : ' Guest');

  // Initials in the header
  const initials = toInitials(name || 'Guest');
  document.querySelectorAll('.headerProfileLetter')
    .forEach(el => el.textContent = initials);
}



/**
 * Fetch the count of tasks in '/tasks/to_do' and display it in the dashboard element
 * with id "toDoTaskDashboard".
 * @async
 * @returns {Promise<void>}
 */
async function updateToDoTaskDashboard() {
  try {
    const response = await fetch(`${DATABASE_URL}/tasks/to_do.json`);
    const data = await response.json();

    // data: null | {} | {id1: {...}, id2: {...}, ...}
    let count = 0;
    if (data) {
      count = Object.keys(data).length;
    }

    // Set the count in dashboard
    document.getElementById("toDoTaskDashboard").textContent = count;
  } catch (error) {
    document.getElementById("toDoTaskDashboard").textContent = "0";
    console.error("Failed to fetch ToDo tasks:", error);
  }
}



/**
 * Fetch the count of tasks in '/tasks/in_progress' and display it in the dashboard element
 * with id "inProgressTaskDashboard".
 * @async
 * @returns {Promise<void>}
 */
async function updateInProgresskDashboard() {
  try {
    const response = await fetch(`${DATABASE_URL}/tasks/in_progress.json`);
    const data = await response.json();

    // data: null | {} | {id1: {...}, id2: {...}, ...}
    let count = 0;
    if (data) {
      count = Object.keys(data).length;
    }

    // Set the count in dashboard
    document.getElementById("inProgressTaskDashboard").textContent = count;
  } catch (error) {
    document.getElementById("inProgressTaskDashboard").textContent = "0";
    console.error("Failed to fetch ToDo tasks:", error);
  }
}



/**
 * Fetch the count of tasks in '/tasks/await_feedback' and display it in the dashboard element
 * with id "awaitingTaskDashboard".
 * @async
 * @returns {Promise<void>}
 */
async function updateAwaitFeedbackTaskDashboard() {
  try {
    const response = await fetch(`${DATABASE_URL}/tasks/await_feedback.json`);
    const data = await response.json();

    // data: null | {} | {id1: {...}, id2: {...}, ...}
    let count = 0;
    if (data) {
      count = Object.keys(data).length;
    }

    // Set the count in dashboard
    document.getElementById("awaitingTaskDashboard").textContent = count;
  } catch (error) {
    document.getElementById("awaitingTaskDashboard").textContent = "0";
    console.error("Failed to fetch ToDo tasks:", error);
  }
}



/**
 * Fetch the count of tasks in '/tasks/done' and display it in the dashboard element
 * with id "doneTaskDashboard".
 * @async
 * @returns {Promise<void>}
 */
async function updateDoneTaskDashboard() {
  try {
    const response = await fetch(`${DATABASE_URL}/tasks/done.json`);
    const data = await response.json();

    // data: null | {} | {id1: {...}, id2: {...}, ...}
    let count = 0;
    if (data) {
      count = Object.keys(data).length;
    }

    // Set the count in dashboard
    document.getElementById("doneTaskDashboard").textContent = count;
  } catch (error) {
    document.getElementById("doneTaskDashboard").textContent = "0";
    console.error("Failed to fetch ToDo tasks:", error);
  }
}



/**
 * Fetch counts from all task categories and compute the total number of tasks.
 * Displays the total in the element with id "totalTasksinBoard".
 * Note: Logic preserved as-is.
 * @async
 * @returns {Promise<void>}
 */
async function updateTotalTaskInBoardDashboard() {
  try {
    const paths = ['to_do', 'in_progress', 'await_feedback', 'done'];
    let total = 0;

    for (let path of paths) {
      const res = await fetch(`${DATABASE_URL}/tasks/${path}.json`);
      const data = await res.json();
      if (data) {
        total += Object.keys(data).length;
      }
    }

    const dashboardNumbers = document.getElementById("totalTasksinBoard").textContent = total;;
    if (dashboardNumbers.length >= 2) {
      dashboardNumbers[1].textContent = total;
    }
  } catch (error) {
    // Fallback: display 0
    const dashboardNumbers = document.getElementById("totalTasksinBoard").textContent = total;;
    if (dashboardNumbers.length >= 2) {
      dashboardNumbers[1].textContent = "0";
    }
    console.error("Failed to fetch total board tasks:", error);
  }
}



/**
 * Count tasks with priority "urgent" across all categories
 * and display the total in the element with id "urgenttasksInBoard".
 * @async
 * @returns {Promise<void>}
 */
async function updateUrgentTaskDashboard() {
  try {
    const paths = ['to_do', 'in_progress', 'await_feedback', 'done'];
    let urgentCount = 0;

    for (let path of paths) {
      const res = await fetch(`${DATABASE_URL}/tasks/${path}.json`);
      const data = await res.json();
      if (data) {
        for (let key in data) {
          if (data[key].priority === "urgent") {
            urgentCount++;
          }
        }
      }
    }

    document.getElementById("urgenttasksInBoard").textContent = urgentCount;
  } catch (error) {
    document.getElementById("urgenttasksInBoard").textContent = "0";
    console.error("Failed to fetch urgent tasks:", error);
  }
}



/**
 * Find the upcoming (nearest) deadline date among all tasks that have a valid due_date
 * that is today or later, and display it inside the element with id "currentDate".
 * If none exist, display "No upcoming deadline".
 * @async
 * @returns {Promise<void>}
 */
async function updateUpcomingDeadline() {
  try {
    const paths = ['to_do', 'in_progress', 'await_feedback', 'done'];
    let deadlines = [];

    for (let path of paths) {
      const res = await fetch(`${DATABASE_URL}/tasks/${path}.json`);
      const data = await res.json();
      if (data) {
        for (let key in data) {
          const task = data[key];
          if (task.due_date) {
            const date = new Date(task.due_date);

            // Only dates that are today or after today.
            if (date >= new Date().setHours(0,0,0,0)) {
              deadlines.push(date);
            }
          }
        }
      }
    }

    if (deadlines.length > 0) {
      // Get the nearest date.
      const minDate = new Date(Math.min(...deadlines));
      // Date format (here: "en-GB" long format)
      const formatted = minDate.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      document.getElementById("currentDate").textContent = formatted;
    } else {
      document.getElementById("currentDate").textContent = "No upcoming deadline";
    }
  } catch (error) {
    document.getElementById("currentDate").textContent = "No upcoming deadline";
    console.error("Failed to fetch deadlines:", error);
  }
}



/**
 * Page load handler that initializes date, greeting, and all dashboard counters.
 * This function is assigned to window.onload and runs once the page loads.
 * @returns {void}
 */
window.onload = function() {
  displayCurrentDate();
  updateGreeting();
  updateToDoTaskDashboard();
  updateInProgresskDashboard();
  updateAwaitFeedbackTaskDashboard();
  updateDoneTaskDashboard();
  updateTotalTaskInBoardDashboard();
  updateUrgentTaskDashboard();
  updateUpcomingDeadline();
};
