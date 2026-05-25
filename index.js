const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Enable Cross-Origin Resource Sharing (CORS) so your frontend can communicate with it
app.use(cors());

// In-Memory Data Storage (Resets when server restarts)
let categories = [];
let tasks = [];

// --- CATEGORY ENDPOINTS ---

/**
 * @route   GET /api/categories
 * @desc    Get all available task categories
 */
app.get('/api/categories', (req, res) => {
    res.json({ success: true, data: categories });
});

/**
 * @route   POST /api/categories
 * @desc    Create a new unique category
 */
app.post('/api/categories', (req, res) => {
    const { name } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: "Category name is required" });
    }

    // Check if the category already exists to avoid duplicates
    const exists = categories.some(c => c.name.toLowerCase() === name.trim().toLowerCase());
    if (exists) {
        return res.status(400).json({ success: false, message: "Category already exists" });
    }

    const newCategory = {
        id: "cat_" + Math.random().toString(36).substr(2, 9), // Generates a unique string ID
        name: name.trim()
    };

    categories.push(newCategory);
    res.status(201).json({ success: true, data: newCategory });
});


// --- TASK ENDPOINTS ---

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks
 */
app.get('/api/tasks', (req, res) => {
    res.json({ success: true, data: tasks });
});

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 */
app.post('/api/tasks', (req, res) => {
    const { text, category_id, priority, original_time, remaining_time } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ success: false, message: "Task text cannot be empty" });
    }

    const newTask = {
        id: "task_" + Date.now(), // Generates unique ID string matching frontend type conversion
        text: text.trim(),
        category_id: category_id,
        priority: priority || 'Medium',
        completed: false,
        original_time: original_time || 0,
        remaining_time: remaining_time || 0
    };

    tasks.push(newTask);
    res.status(201).json({ success: true, data: newTask });
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update an entire task profile (used when editing text, original_time, etc.)
 */
app.put('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const { text, category_id, priority, original_time, remaining_time } = req.body;

    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
        return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (text !== undefined) tasks[taskIndex].text = text.trim();
    if (category_id !== undefined) tasks[taskIndex].category_id = category_id;
    if (priority !== undefined) tasks[taskIndex].priority = priority;
    if (original_time !== undefined) tasks[taskIndex].original_time = original_time;
    if (remaining_time !== undefined) tasks[taskIndex].remaining_time = remaining_time;

    res.json({ success: true, data: tasks[taskIndex] });
});

/**
 * @route   PATCH /api/tasks/:id/toggle
 * @desc    Toggle the complete status of a task
 */
app.patch('/api/tasks/:id/toggle', (req, res) => {
    const taskId = req.params.id;
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
        return res.status(404).json({ success: false, message: "Task not found" });
    }

    task.completed = !task.completed;
    res.json({ success: true, data: task });
});

/**
 * @route   PATCH /api/tasks/:id/timer
 * @desc    Sync timer countdown values dynamically
 */
app.patch('/api/tasks/:id/timer', (req, res) => {
    const taskId = req.params.id;
    const { remaining_time } = req.body;

    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (remaining_time !== undefined) {
        task.remaining_time = remaining_time;
    }

    res.json({ success: true, data: task });
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete an explicit task profile
 */
app.delete('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const initialLength = tasks.length;
    
    tasks = tasks.filter(t => t.id !== taskId);

    if (tasks.length === initialLength) {
        return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.json({ success: true, message: "Task deleted successfully" });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});