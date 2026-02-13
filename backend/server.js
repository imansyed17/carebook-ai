require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./src/db/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
});

// Health check (available before routes load)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Initialize database then mount routes and start server
async function startServer() {
    try {
        await initializeDatabase();
        console.log('Database initialized successfully');

        // Routes (require after DB init so getDbSync() works)
        const providersRouter = require('./src/routes/providers');
        const appointmentsRouter = require('./src/routes/appointments');
        const aiRouter = require('./src/routes/ai');
        const appointmentTypesRouter = require('./src/routes/appointmentTypes');

        app.use('/api/providers', providersRouter);
        app.use('/api/appointments', appointmentsRouter);
        app.use('/api/ai', aiRouter);
        app.use('/api/appointment-types', appointmentTypesRouter);

        // 404 handler (after all routes)
        app.use((req, res) => {
            res.status(404).json({ error: 'Route not found' });
        });

        app.listen(PORT, () => {
            console.log(`\n🏥 CareBook AI Backend running on http://localhost:${PORT}`);
            console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
