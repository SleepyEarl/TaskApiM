const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors()); // Allows your frontend deployment to communicate with Render backend

// In-Memory Database (replaces localStorage)
let tasks = [];

// Helper function to simulate network delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- CATEGORY ENDPOINTS ---

/**
 * @route   GET /api/categories
 * @desc    Fetches categories from external user company profiles or falls back to defaults
 */
app.get('/api/categories', async (req, res) => {
  try {
    // dynamic import used for global fetch compatibilities in older node environments
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    const categories = data.map((user) => user.company.bs.split(' ')[0]);
    const uniqueCategories = [...new Set(categories)]
      .slice(0, 5)
      .map((cat) => cat.charAt(0).toUpperCase() + cat.slice(1));

    res.json({ success: true, data: uniqueCategories });
  } catch (error) {
    // Fallback default options
    res.json({ success: true, data: ['Personal', 'Work', 'Urgent'] });
  }
});

// --- TASK ENDPOINTS ---

/**
 * @route   GET /api/tasks
 * @desc    Retrieves all tasks
 */
app.get('/api/tasks', (req, res) => {
  res.json({ success: true, data: tasks });
});

/**
 * @route   POST /api/tasks
 * @desc    Validates and adds a new task with variable delay simulation
 */
app.post('/api/tasks', async (req, res) => {
  const { text, category, priority, mins } = req.body;

  await delay(500); // Re-creates the frontend's 500ms artificial latency

  if (!text || !text.trim()) {
    return res
      .status(400)
      .json({ success: false, message: 'Task text cannot be empty' });
  }

  const minutes = mins ? parseInt(mins, 10) : 0;

  const newTask = {
    id: Date.now(),
    text: text.trim(),
    category: category || 'Personal',
    priority: priority || 'Medium',
    completed: false,
    isEditing: false,
    remainingTime: minutes * 60,
    originalTime: minutes * 60,
    isRunning: false,
  };

  tasks.push(newTask);
  res
    .status(201)
    .json({ success: true, message: 'Task added!', data: newTask });
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Updates the descriptive string content or editing state of an explicit task
 */
app.put('/api/tasks/:id', (req, res) => {
  const taskId = Number(req.params.id);
  const { text, isEditing } = req.body;

  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  if (text !== undefined) tasks[taskIndex].text = text;
  if (isEditing !== undefined) tasks[taskIndex].isEditing = isEditing;

  res.json({ success: true, data: tasks[taskIndex] });
});

/**
 * @route   PATCH /api/tasks/:id/toggle
 * @desc    Toggles completion status and forces running timers to stop
 */
app.patch('/api/tasks/:id/toggle', (req, res) => {
  const taskId = Number(req.params.id);
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  task.completed = !task.completed;
  if (task.completed) {
    task.isRunning = false; // Kill countdown state if task completed
  }

  res.json({
    success: true,
    message: task.completed ? 'Task completed!' : 'Task marked as pending',
    data: task,
  });
});

/**
 * @route   PATCH /api/tasks/:id/timer
 * @desc    Handles backend tracking for running state or incremental updates to countdown numbers
 */
app.patch('/api/tasks/:id/timer', (req, res) => {
  const taskId = Number(req.params.id);
  const { isRunning, remainingTime, reset } = req.body;
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  if (reset) {
    task.isRunning = false;
    task.remainingTime = task.originalTime;
    return res.json({ success: true, message: 'Timer reset', data: task });
  }

  if (isRunning !== undefined) task.isRunning = isRunning;
  if (remainingTime !== undefined) task.remainingTime = remainingTime;

  res.json({ success: true, data: task });
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Removes a target task profile entirely with variable delay simulation
 */
app.delete('/api/tasks/:id', async (req, res) => {
  const taskId = Number(req.params.id);

  await delay(800); // Re-creates the frontend's 800ms artificial latency

  const taskExists = tasks.some((t) => t.id === taskId);
  if (!taskExists) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  tasks = tasks.filter((t) => t.id !== taskId);
  res.json({ success: true, message: 'Task deleted!' });
});

// App Initiation
app.listen(PORT, () => {
  console.log(`Server running smoothly on port ${PORT}`);
});
