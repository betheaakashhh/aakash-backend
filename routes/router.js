// routes/index.js (or routes/router.js)
import express from 'express';
import authRoutes from './authRoutes.js';
import projectRoutes from './projectRoutes.js';
import adminRoutes from './adminRoutes.js';
import migrationRoutes from './migration.js';

const router = express.Router();

// ==================== HEALTH & ROOT ROUTES ====================
router.get('/', (req, res) => {
  res.json({ 
    message: 'Portfolio API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    deployment: 'Vercel + Local Compatible'
  });
});

router.get('/health', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + 's',
    environment: process.env.NODE_ENV || 'development',
    routes: {
      auth: '/api/auth',
      projects: '/api/projects',
      admin: '/api/admin',
      migration: '/api/migrate'
    }
  };
  res.json(healthData);
});

// ==================== API ROUTES ====================
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/admin', adminRoutes);
router.use('/migrate', migrationRoutes);

// ==================== 404 HANDLER ====================
router.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

export default router;