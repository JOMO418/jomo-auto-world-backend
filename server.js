// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const app = express();

// Import error handler
const errorHandler = require('./middleware/errorHandler');

// Security Middleware
app.use(helmet());


// Do this 👇
app.use(mongoSanitize({
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized ${key} from incoming request`);
  },
  replaceWith: '_'
}));


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database Connection
const connectDB = require('./config/db');
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payment', require('./routes/payment'));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: '🚗 Jomo Auto World API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Jomo Auto World API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      admin: '/api/admin',
      payment: '/api/payment'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    status: 'error', 
    message: `Route ${req.originalUrl} not found` 
  });
});

// Global Error Handler (must be last)
app.use(errorHandler);

// Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log('='.repeat(50));
});

// Socket.io for real-time updates
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated');
    mongoose.connection.close();
  });
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;