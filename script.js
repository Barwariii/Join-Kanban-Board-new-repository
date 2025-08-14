const DATABASE_URL = "https://join-kanban-board-3a477-default-rtdb.europe-west1.firebasedatabase.app/";

// Toggle dropdown for logout, legal notice, and privacy policy
function toggledropDownBar() {
  document.getElementById("dropDownBar").classList.toggle("activ");
}

// Function for the current date
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

// Greeting based on the time of day
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

  document.querySelector('.dashboardHeader h1').innerHTML = `${greeting}<span class="dashboardUsername"> Sofia Müller</span>`;
}

// Calls the function as soon as the DOM is loaded
// Reads /tasks/to_do and shows task count in dashboard
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


// Reads /tasks/in_progress and shows task count in dashboard
// Reads /tasks/in_progress and shows task count in dashboard
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


// Reads /tasks/to_do and shows task count in dashboard
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


// Reads /tasks/done and shows task count in dashboard
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


// Reads /tasks and shows total tasks in board
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


// update uregent tasks dashboard
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


// update  dashboard of deadline for next urgent task in board
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
      // Date format as you prefer (here: dd.mm.yyyy)
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



// Execute it when the page loads.
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
