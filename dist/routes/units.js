const express = require('express');
const router = express.Router();
const UnitController = require('../controllers/unitController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { createUnitValidation, updateUnitValidation } = require('../middleware/unitValidation');
// All routes require authentication
// router.use(authenticateToken); // Temporarily disabled for testing
// GET /api/units - Get all units
router.get('/', UnitController.getAllUnits);
// GET /api/units/statistics - Get unit statistics
router.get('/statistics', UnitController.getUnitStatistics);
// GET /api/units/:id - Get unit by ID
router.get('/:id', UnitController.getUnitById);
// GET /api/units/:id/children - Get unit children
router.get('/:id/children', UnitController.getUnitChildren);
// POST /api/units - Create new unit (Admin and Super Admin only)
router.post('/', authenticateToken, authorize('Super_admin', 'Admin'), createUnitValidation, UnitController.createUnit);
// PUT /api/units/:id - Update unit (Admin and Super Admin only)
router.put('/:id', authenticateToken, authorize('Super_admin', 'Admin'), updateUnitValidation, UnitController.updateUnit);
// DELETE /api/units/:id - Delete unit (Super Admin only)
router.delete('/:id', authenticateToken, authorize('Super_admin'), UnitController.deleteUnit);
module.exports = router;
//# sourceMappingURL=units.js.map