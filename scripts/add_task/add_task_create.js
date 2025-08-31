/** =====================================
 * Create Task
 * ===================================== */

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

  /** Validation guards */
  if (!title) {
    validateAddTaskForm();
    return;
  }
  if (!due_date) {
    validateAddTaskForm();
    return;
  }
  if (!categoryText || categoryText === "Select Category") {
    validateAddTaskForm();
    return;
  }

  if (!validatePriorityField()) {
    /** This will show the error message automatically */
    validateAddTaskForm();
    return;
  }

  /** Compute priority from active button */
  let priority = null;
  if (document.getElementById('urgent').classList.contains('active')) priority = "urgent";
  if (document.getElementById('medium').classList.contains('active')) priority = "medium";
  if (document.getElementById('low').classList.contains('active')) priority = "low";
  if (!priority) {
    validatePriorityField();
    return;
  }

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

  const res = await fetch(`${DATABASE_URL}/tasks/to_do.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskObj)
  });

  if (res.ok) {
    showSuccessOverlay("Task added to board!");
    clearTask();
    setTimeout(() => {
      window.location.href = "../pages/board.html";
    }, 1650);
  } else {
    alert("Fehler beim Erstellen!");
  }
}
