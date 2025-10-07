const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const { createServer } = require('http');
const { Server } = require('socket.io');

const config = require('./config/config');
const { testConnection } = require('./config/database');
const SocketService = require('./services/socketService');

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const roleRoutes = require('./routes/roles');
const contactRoutes = require('./routes/contacts');
const superAdminRoutes = require('./routes/superAdmin');
const organizationalRoutes = require('./routes/organizational');
const unitRoutes = require('./routes/units');
const departmentRoutes = require('./routes/departments');
const userRoutes = require('./routes/users');
const rankRoutes = require('./routes/ranks');
const userExcelRoutes = require('./routes/userExcel');
const messageRoutes = require('./routes/messages');
const conversationRoutes = require('./routes/conversations');
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = createServer(app);

// Test database connection
testConnection();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors(config.cors));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Session configuration (using memory store for now)
app.use(session({
  secret: config.session.secret,
  resave: config.session.resave,
  saveUninitialized: config.session.saveUninitialized,
  cookie: config.session.cookie
}));

// Health check endpoint (must be before other /api routes)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'CMS Backend API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/roles', roleRoutes); // Made more specific to avoid catching /api/health
app.use('/api/contacts', contactRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/organizational', organizationalRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ranks', rankRoutes);
app.use('/api/users/excel', userExcelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
});

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: config.cors.origin,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize Socket Service
const socketService = new SocketService(io);

// Make Socket.IO available to routes
app.set('io', io);
app.set('socketService', socketService);

// Start server with port fallback
const startServer = (port) => {
  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📊 Environment: ${config.nodeEnv}`);
    console.log(`🔗 Health check: http://localhost:${port}/api/health`);
    console.log(`🔌 Socket.IO enabled for real-time messaging`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${port} is already in use. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  return server;
};

const PORT = config.port;
startServer(PORT);

module.exports = { app, server, io };
