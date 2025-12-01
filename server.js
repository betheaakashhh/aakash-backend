const express = require('express');
require('dotenv').config();
const connectDB = require('./config/database');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const adminRoutes = require('./routes/adminRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();

// CORS Configuration - Define inline to avoid module issues
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', 
  'http://localhost:5174',
  'http://localhost:3001',
  'https://aakashkumarsahu.vercel.app',
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('⚠️ CORS blocked for origin:', origin);
      // For debugging, allow it anyway. In production, use: callback(new Error('Not allowed by CORS'))
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - Register BEFORE 404 handler
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);

// 404 Handler - MUST come AFTER all route definitions
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({ 
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global Error Handler - MUST be LAST
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server only after DB connection
const startServer = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connection established');
    
    if (require.main === module) {
      app.listen(PORT, () => {
        console.log('=================================');
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log('=================================');
      });
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// For Vercel serverless - connect to DB on each request
if (process.env.VERCEL) {
  console.log('🔧 Running in Vercel serverless mode');
  connectDB().catch(err => console.error('MongoDB connection error:', err));
} else if (require.main === module) {
  // Local development - start server normally
  startServer();
}

module.exports = app;