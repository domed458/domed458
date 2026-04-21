const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const path = require('path');

dotenv.config();
connectDB();

const authRoutes = require('./routes/auth');

const app = express();

// ========== UPDATED CORS - Allow Flutter App ==========
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, curl)
        if (!origin) return callback(null, true);
        
        // Allow any localhost port (for Flutter development)
        if (origin && origin.match(/^http:\/\/localhost:\d+$/)) {
            return callback(null, true);
        }
        
        // Allow specific origins
        const allowedOrigins = [
            'http://localhost:5001',
            'http://localhost:3000',
            'http://127.0.0.1:5001',
            'http://10.0.2.2:5001'
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(null, true); // Temporarily allow all for testing
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);

// Welcome routes
app.get('/welcome', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/', (req, res) => {
    res.json({
        success: true,
        platform: 'LRC Connect',
        tagline: 'Community Marketplace & Growth Platform',
        version: '1.0.0',
        message: 'Welcome to LRC Connect API! 🚀',
        status: 'operational',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`✅ LRC Connect Server running on port ${PORT}`);
    console.log(`📍 JSON API: http://localhost:${PORT}`);
    console.log(`🎨 Web Interface: http://localhost:${PORT}/welcome`);
    console.log(`🔒 Security: Rate limiting active, CORS open for development`);
});