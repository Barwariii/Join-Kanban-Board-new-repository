/**
 * Create a new task and push it to the Realtime DB.
 * Relies on validation helpers and current UI state.
 * @returns {Promise<void>}
 */
async function createTask() {
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const due_date = document.getElementById('dueDate').value;
  const categoryText = document.getElementById('selectedCategory').textContent.trim();

  if (!validateCreateTaskGuards(title, due_date, categoryText)) return;

  /** Compute priority from active button */
  let priority = null;
  if (document.getElementById('urgent').classList.contains('active')) priority = "urgent";
  if (document.getElementById('medium').classList.contains('active')) priority = "medium";
  if (document.getElementById('low').classList.contains('active')) priority = "low";
  if (!priority) { validatePriorityField(); return; }

  /** Selected assigned contacts (ids) */
  const assigned = addTaskUserData.filter((u) => u.isToggled).map((u) => u.id);

  /** Map type -> category column */
  const category = (categoryText === "Technical Task") ? "toDo" : "inProgress";

  /** Firebase task object payload */
  const taskObj = {
    title,
    description,
    due_date,
    priority,
    category,
    assigned_to: assigned,
    type: categoryText,
    subtasks: (subtasks || []).map((s) => ({ title: s, completed: false }))
  };

  await postTask(taskObj);
}


/**
 * Send task to DB and handle UI success/ failure flows.
 * @param {Object} taskObj - Firebase task payload.
 * @returns {Promise<void>}
 */
async function postTask(taskObj) {
  const res = await fetch(`${DATABASE_URL}/tasks/to_do.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskObj)
  });

  if (res.ok) {
    showSuccessOverlay("Task added to board!");
    clearTask();
    setTimeout(() => { window.location.href = "../pages/board.html"; }, 1650);
  } else {
    alert("Fehler beim Erstellen!");
  }
}


/**
 * Validate required fields using existing validators.
 * Mirrors original guard sequence without changing logic.
 * @param {string} title
 * @param {string} due_date
 * @param {string} categoryText
 * @returns {boolean} true if valid, else false after triggering UI errors.
 */
function validateCreateTaskGuards(title, due_date, categoryText) {
  if (!title) { validateAddTaskForm(); return false; }
  if (!due_date) { validateAddTaskForm(); return false; }
  if (!categoryText || categoryText === "Select Category") { validateAddTaskForm(); return false; }
  if (!validatePriorityField()) { validateAddTaskForm(); return false; }
  return true;
}