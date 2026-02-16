require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { initializeDatabase } = require('./src/db/database');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── SECURITY FIX #1: HTTP Security Headers ────────────────────────────────
// Helmet sets headers like X-Content-Type-Options, X-Frame-Options,
// Strict-Transport-Security, X-XSS-Protection, etc.
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// ─── SECURITY FIX #2: Strict CORS — reject unknown origins ─────────────────
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL,
    'https://main.d19si1wituug8p.amplifyapp.com'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (server-to-server, curl, health checks)
        if (!origin) return callback(null, true);
        if (allowedOrigins.some(o => origin === o || origin.startsWith(o))) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ─── SECURITY FIX #3: Rate Limiting — prevent brute force / DDoS ───────────
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});

const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // Only 10 bookings per 15 min per IP
    message: { error: 'Too many booking attempts, please try again later.' }
});

const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // 20 AI requests per minute
    message: { error: 'Too many AI requests, please slow down.' }
});

app.use('/api/', generalLimiter);

// ─── SECURITY FIX #4: Limit request body size — prevent payload attacks ─────
app.use(express.json({ limit: '10kb' }));

// ─── SECURITY FIX #5: Disable X-Powered-By header (info leakage) ───────────
app.disable('x-powered-by');

// Request logging middleware (sanitized — no sensitive data)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
});

// Health check (available before routes load)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── SECURITY FIX #6: Don't leak stack traces in production ─────────────────
app.use((err, req, res, next) => {
    // Log full error server-side for debugging
    console.error('Unhandled error:', err.message);

    // CORS errors
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ error: 'Origin not allowed' });
    }

    // Never expose internal error details to clients in production
    res.status(500).json({
        error: 'Internal server error'
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
        app.use('/api/appointments', bookingLimiter, appointmentsRouter);
        app.use('/api/ai', aiLimiter, aiRouter);
        app.use('/api/appointment-types', appointmentTypesRouter);

        // 404 handler (after all routes)
        app.use((req, res) => {
            res.status(404).json({ error: 'Route not found' });
        });

        app.listen(PORT, () => {
            console.log(`\n🏥 CareBook AI Backend running on http://localhost:${PORT}`);
            console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔒 Security: Helmet, CORS, Rate Limiting enabled\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();
