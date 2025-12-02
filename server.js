// server.js (simplified version)
import express from 'express';
import mongoose from 'mongoose';
import { config } from './config/env.js';
import connectDB from './config/db.js';
import { corsConfig, handlePreflight } from './middleware/corsConfig.js';
import router from './routes/router.js';  // Import the central router

const app = express();
const PORT = config.port || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(corsConfig);
app.use(handlePreflight);

// Connect to MongoDB
connectDB();

// ==================== USE CENTRAL ROUTER ====================
app.use('/api', router);

// ==================== GLOBAL ERROR HANDLER ====================
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({ message: 'Internal server error' });
});

// ==================== VERCEL COMPATIBLE SERVER START ====================
if (process.env.VERCEL !== '1') {
  const server = app.listen(PORT, 'localhost', () => {
    console.log('=================================');
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${config.nodeEnv}`);
    console.log('=================================');
    console.log('📝 Migration: POST /api/migrate/fix-user-roles');
    console.log('👤 Client: POST /api/auth/signup');
    console.log('🛡️  Admin: POST /api/auth/admin/signup');
    console.log('=================================');
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
      console.log(`Try: PORT=${Number(PORT) + 1} npm start`);
    } else {
      console.error('❌ Server error:', error.message);
    }
    process.exit(1);
  });
}

export default app;