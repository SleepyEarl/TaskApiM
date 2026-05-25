const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initializeDatabase } = require('./db');
const path = require('path');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const validation = require('./middleware/validation');

// Import routes
const taskRoutes = require('./routes/tasks');
const categoryRoutes = require('./routes/categories');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;



// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Task Manager API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stats', statsRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });
});

app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`Task Manager API Server Running on Port: ${PORT}                 
        Mode: ${process.env.NODE_ENV || 'development'}         
    `);
});

module.exports = app;
