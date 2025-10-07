const express = require('express');
const DashboardController = require('../controllers/dashboardController');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all dashboard routes
router.use(authenticateToken);

// Get dashboard statistics
// GET /api/dashboard/stats
router.get('/stats', DashboardController.getDashboardStats);

// Get dashboard analytics for charts
// GET /api/dashboard/analytics?period=7d
router.get('/analytics', DashboardController.getDashboardAnalytics);

module.exports = router;
