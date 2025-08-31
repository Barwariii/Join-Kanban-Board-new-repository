/**
 * Holds all "to do" tasks loaded from the database.
 * @type {Object[]}
 */
let toDoTasks = [];

/**
 * Holds all "in progress" tasks loaded from the database.
 * @type {Object[]}
 */
let inProgressTasks = [];

/**
 * Holds all "await feedback" tasks loaded from the database.
 * @type {Object[]}
 */
let awaitFeedbackTasks = [];

/**
 * Holds all "done" tasks loaded from the database.
 * @type {Object[]}
 */
let doneTasks = [];



/**
 * Transform raw task data from the database into an array with ids included.
 * @param {Object<string, Object>} tasksData - Raw tasks data from Firebase.
 * @returns {Array<Object>} Array of task objects with id property added.
 */
function transformTasksDataFromDB(tasksData) {
  if (!tasksData) return [];
  return Object.entries(tasksData).map(([id, data]) => ({ id, ...data }));
}



/**
 * Load all tasks of a given category from the database.
 * @async
 * @param {string} categoryKey - Database key of the category (e.g., "to_do").
 * @returns {Promise<Object[]>} A promise that resolves to an array of tasks.
 */
async function loadCategoryTasksFromDB(categoryKey) {
  try {
    const res = await fetch(`${DATABASE_URL}/tasks/${categoryKey}.json`);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    return transformTasksDataFromDB(data);
  } catch (e) {
    console.error(`Error loading ${categoryKey}:`, e);
    return [];
  }
}



/**
 * Load tasks of all categories simultaneously.
 * @async
 * @returns {Promise<[Object[], Object[], Object[], Object[]]>} A promise that resolves to arrays of [toDo, inProgress, awaitFeedback, done].
 */
async function mySuperTestFunction() {
  const [toDo, inProg, awaitFB, done] = await Promise.all([
    loadCategoryTasksFromDB("to_do"),
    loadCategoryTasksFromDB("in_progress"),
    loadCategoryTasksFromDB("await_feedback"),
    loadCategoryTasksFromDB("done")
  ]);
  return [toDo, inProg, awaitFB, done];
}



/**
 * Send all predefined tasks (toDo, inProgress, awaitFeedback, done) to the database.
 * @async
 * @returns {Promise<void>}
 */
async function sendAllTasksToDB() {
  await sendToDoTaskToDB(toDoTask);
  await sendInProgressTaskToDB(inProgressTask);
  await sendAwaitFeedbackTaskToDB(awaitFeedbackTask);
  await sendDoneTaskToDB(doneTask);
}



/**
 * Predefined example "to do" task object.
 * @type {{
 *   title: string,
 *   due_date: string,
 *   priority: string,
 *   category: string,
 *   assigned_to: string[],
 *   type: string,
 *   description: string,
 *   subtasks: {subtask: string, completed: boolean}[]
 * }}
 */
const toDoTask = {
  title: "Plan Sprint",
  due_date: "2024-11-01",
  priority: "urgent",
  category: "toDo",
  assigned_to: ["-O9UbvOcMftPHx95edox", "-O9UiD-olcfuduDrkCp6"],
  type: "Technical Task",
  description: "Description Text",
  subtasks: [
    {
      subtask: "Define project goals",
      completed: false,
    },
    {
      subtask: "Assign responsibilities",
      completed: false,
    }
  ]
};



/**
 * Send a "to do" task to the database.
 * @async
 * @param {Object} toDoTask - The task object to send.
 * @returns {Promise<void>}
 */
async function sendToDoTaskToDB(toDoTask) {
  try {
    const response = await fetch(DATABASE_URL + "/tasks/to_do.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(toDoTask)
    });

    if (response.ok) {
      console.log("To do Task successfully sent to DB!");
    } else {
      console.error("Failed to send to_do task to DB:", response.statusText);
    }
  } catch (error) {
    console.error("Failed to send to_do task to DB:", error);
  }
}



/**
 * Predefined example "in progress" task object.
 * @type {{
 *   title: string,
 *   due_date: string,
 *   priority: string,
 *   category: string,
 *   assigned_to: string[],
 *   type: string,
 *   description: string,
 *   subtasks: {subtask: string, completed: boolean}[]
 * }}
 */
const inProgressTask = {
  title: "Design Homepage",
  due_date: "2024-11-05",
  priority: "medium",
  category: "inProgress",
  assigned_to: ["-O9UbvOcMftPHx95edox", "-O9UiD-olcfuduDrkCp6"],
  type: "User Story",
  description: "Description Text",
  subtasks: [
    {
      subtask: "Create header",
      completed: true,
    },
    {
      subtask: "Design footer",
      completed: false,
    }
  ]
};



/**
 * Send an "in progress" task to the database.
 * @async
 * @param {Object} inProgressTask - The task object to send.
 * @returns {Promise<void>}
 */
async function sendInProgressTaskToDB(inProgressTask) {
  try {
    const response = await fetch(DATABASE_URL + "/tasks/in_progress.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(inProgressTask)
    });

    if (response.ok) {
      console.log("In progress Task successfully sent to DB!");
    } else {
      console.error("Failed to send in_progress task to DB:", response.statusText);
    }
  } catch (error) {
    console.error("Failed to send in_progress task to DB:", error);
  }
}



/**
 * Predefined example "await feedback" task object.
 * @type {{
 *   title: string,
 *   due_date: string,
 *   priority: string,
 *   category: string,
 *   assigned_to: string[],
 *   type: string,
 *   description: string,
 *   subtasks: {subtask: string, completed: boolean}[]
 * }}
 */
const awaitFeedbackTask = {
  title: "Setup analytics",
  due_date: "2024-11-07",
  priority: "low",
  category: "awaitFeedback",
  assigned_to: ["-O9UbvOcMftPHx95edox", "-O9UiD-olcfuduDrkCp6"],
  type: "Technical Task",
  description: "Description Text",
  subtasks: [
    {
      subtask: "Implement Google Analytics",
      completed: true,
    },
    {
      subtask: "Set up reporting Dashboard",
      completed: true,
    }
  ]
};



/**
 * Send an "await feedback" task to the database.
 * @async
 * @param {Object} awaitFeedbackTask - The task object to send.
 * @returns {Promise<void>}
 */
async function sendAwaitFeedbackTaskToDB(awaitFeedbackTask) {
  try {
    const response = await fetch(DATABASE_URL + "/tasks/await_feedback.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(awaitFeedbackTask)
    });

    if (response.ok) {
      console.log("Await feedback Task successfully sent to DB!");
    } else {
      console.error("Failed to send await_feedback task to DB:", response.statusText);
    }
  } catch (error) {
    console.error("Failed to send await_feedback task to DB:", error);
  }
}



/**
 * Predefined example "done" task object.
 * @type {{
 *   title: string,
 *   due_date: string,
 *   priority: string,
 *   category: string,
 *   assigned_to: string[],
 *   type: string,
 *   description: string,
 *   subtasks: {subtask: string, completed: boolean}[]
 * }}
 */
const doneTask = {
  title: "Setup analytics",
  due_date: "2024-11-07",
  priority: "low",
  category: "done",
  assigned_to: ["-O9UbvOcMftPHx95edox", "-O9UiD-olcfuduDrkCp6"],
  type: "Technical Task",
  description: "Description Text",
  subtasks: [
    {
      subtask: "Implement Google Analytics",
      completed: true,
    },
    {
      subtask: "Set up reporting Dashboard",
      completed: true,
    }
  ]
};



/**
 * Send a "done" task to the database.
 * @async
 * @param {Object} doneTask - The task object to send.
 * @returns {Promise<void>}
 */
async function sendDoneTaskToDB(doneTask) {
  try {
    const response = await fetch(DATABASE_URL + "/tasks/done.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(doneTask)
    });

    if (response.ok) {
      console.log("Done Task successfully sent to DB!");
    } else {
      console.error("Failed to send done task to DB:", response.statusText);
    }
  } catch (error) {
    console.error("Failed to send done task to DB:", error);
  }
}



window.mySuperTestFunction = mySuperTestFunction;
window.loadCategoryTasksFromDB = loadCategoryTasksFromDB;
