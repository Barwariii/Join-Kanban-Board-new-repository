let toDoTasks = [];
let inProgressTasks = [];
let awaitFeedbackTasks = [];
let doneTasks = [];



function transformTasksDataFromDB(tasksData) {
  if (!tasksData) return [];
  return Object.entries(tasksData).map(([id, data]) => ({ id, ...data }));
}

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

async function mySuperTestFunction() {
  const [toDo, inProg, awaitFB, done] = await Promise.all([
    loadCategoryTasksFromDB("to_do"),
    loadCategoryTasksFromDB("in_progress"),
    loadCategoryTasksFromDB("await_feedback"),
    loadCategoryTasksFromDB("done")
  ]);
  return [toDo, inProg, awaitFB, done];
}


// Send all tasks to DB
async function sendAllTasksToDB() {
    await sendToDoTaskToDB(toDoTask);
    await sendInProgressTaskToDB(inProgressTask);
    await sendAwaitFeedbackTaskToDB(awaitFeedbackTask);
    await sendDoneTaskToDB(doneTask);
}


// Send new created Task to DB
async function sendToDoTaskToDB(toDoTask) {
    try {
        const response = await fetch(DATABASE_URL + "/tasks/to_do.json", {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify(toDoTask)
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

const toDoTask = {
    title : "Plan Sprint",
    due_date : "2024-11-01",
    priority : "urgent",
    category : "toDo",
    assigned_to : ["-O9UbvOcMftPHx95edox", "-O9UiD-olcfuduDrkCp6"],
    type : "Technical Task",
    description : "Description Text",
    subtasks : [
        {
            subtask : "Define project goals",
            completed : false,
            
        },
        {
            subtask : "Assign responsibilities",
            completed : false,
        }
    ]
}


// Send in progress Task to DB
async function sendInProgressTaskToDB(inProgressTask) {
    try {
        const response = await fetch(DATABASE_URL + "/tasks/in_progress.json", {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify(inProgressTask)
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

const inProgressTask = {
    title : "Design Homepage",
    due_date : "2024-11-05",
    priority : "medium",
    category : "inProgress",
    assigned_to : ["-O9UbvOcMftPHx95edox", "-O9UiD-olcfuduDrkCp6"],
    type : "User Story",
    description : "Description Text",
    subtasks : [
        {
            subtask : "Create header",
            completed : true,
        },
        {
            subtask : "Design footer",
            completed : false,
        }
    ]
}


// Send await feedback Task to DB
async function sendAwaitFeedbackTaskToDB(awaitFeedbackTask) {
    try {
        const response = await fetch(DATABASE_URL + "/tasks/await_feedback.json", {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify(awaitFeedbackTask)
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

const awaitFeedbackTask = {
    title : "Setup analytics",
    due_date : "2024-11-07",
    priority : "low",
    category : "awaitFeedback",
    assigned_to : ["-O9UbvOcMftPHx95edox", "-O9UiD-olcfuduDrkCp6"],
    type : "Technical Task",
    description : "Description Text",
    subtasks : [
        {
            subtask : "Implement Google Analytics",
            completed : true,
        },
        {
            subtask : "Set up reporting Dashboard",
            completed : true,
        }
    ]
}


// Send done Task to DB
async function sendDoneTaskToDB(doneTask) {
    try {
        const response = await fetch(DATABASE_URL + "/tasks/done.json", {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify(doneTask)
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

const doneTask = {
    title : "Setup analytics",
    due_date : "2024-11-07",
    priority : "low",
    category : "done",
    assigned_to : ["-O9UbvOcMftPHx95edox", "-O9UiD-olcfuduDrkCp6"],
    type : "Technical Task",
    description : "Description Text",
    subtasks : [
        {
            subtask : "Implement Google Analytics",
            completed : true,
        },
        {
            subtask : "Set up reporting Dashboard",
            completed : true,
        }
    ]
}

window.mySuperTestFunction = mySuperTestFunction;
window.loadCategoryTasksFromDB = loadCategoryTasksFromDB;
console.log("window.mySuperTestFunction: in board_database.js", typeof window.mySuperTestFunction);