const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;



// =========================
// IN-MEMORY DATABASE
// =========================

let tasks = [];

let categories = [
  {
    id: uuidv4(),
    name: "General"
  },
  {
    id: uuidv4(),
    name: "Work"
  },
  {
    id: uuidv4(),
    name: "Personal"
  }
];



// =========================
// ROOT ROUTE
// =========================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Task Manager API Running"
  });
});



// =========================
// CATEGORY ROUTES
// =========================

// GET ALL CATEGORIES
app.get("/api/categories", (req, res) => {
  res.json({
    success: true,
    data: categories
  });
});



// CREATE CATEGORY
app.post("/api/categories", (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Category name is required"
    });
  }

  const existingCategory = categories.find(
    category => category.name.toLowerCase() === name.toLowerCase()
  );

  if (existingCategory) {
    return res.status(400).json({
      success: false,
      message: "Category already exists"
    });
  }

  const newCategory = {
    id: uuidv4(),
    name
  };

  categories.push(newCategory);

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: newCategory
  });
});



// =========================
// TASK ROUTES
// =========================

// GET ALL TASKS
app.get("/api/tasks", (req, res) => {
  res.json({
    success: true,
    data: tasks
  });
});



// CREATE TASK
app.post("/api/tasks", (req, res) => {
  const {
    text,
    category_id,
    priority,
    original_time,
    remaining_time
  } = req.body;

  if (!text) {
    return res.status(400).json({
      success: false,
      message: "Task text is required"
    });
  }

  const newTask = {
    id: uuidv4(),
    text,
    category_id: category_id || "",
    priority: priority || "Medium",
    completed: false,
    original_time: original_time || 0,
    remaining_time: remaining_time || 0,
    created_at: new Date()
  };

  tasks.push(newTask);

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: newTask
  });
});



// UPDATE TASK
app.put("/api/tasks/:id", (req, res) => {
  const taskId = req.params.id;

  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found"
    });
  }

  const {
    text,
    category_id,
    priority,
    original_time,
    remaining_time
  } = req.body;

  task.text = text ?? task.text;
  task.category_id = category_id ?? task.category_id;
  task.priority = priority ?? task.priority;
  task.original_time = original_time ?? task.original_time;
  task.remaining_time = remaining_time ?? task.remaining_time;

  res.json({
    success: true,
    message: "Task updated successfully",
    data: task
  });
});



// TOGGLE TASK COMPLETE
app.patch("/api/tasks/:id/toggle", (req, res) => {
  const taskId = req.params.id;

  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found"
    });
  }

  task.completed = !task.completed;

  res.json({
    success: true,
    message: "Task status updated",
    data: task
  });
});



// UPDATE TIMER
app.patch("/api/tasks/:id/timer", (req, res) => {
  const taskId = req.params.id;

  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found"
    });
  }

  const { remaining_time } = req.body;

  task.remaining_time = remaining_time;

  res.json({
    success: true,
    message: "Timer updated",
    data: task
  });
});



// DELETE TASK
app.delete("/api/tasks/:id", (req, res) => {
  const taskId = req.params.id;

  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Task not found"
    });
  }

  const deletedTask = tasks.splice(taskIndex, 1);

  res.json({
    success: true,
    message: "Task deleted successfully",
    data: deletedTask
  });
});



// =========================
// START SERVER
// =========================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});