const express = require('express');
const router = express.Router();
const DepartmentController = require('../controllers/departmentController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { createDepartmentValidation, updateDepartmentValidation } = require('../middleware/departmentValidation');
// All routes require authentication
router.use(authenticateToken);
// GET /api/departments - Get all departments
router.get('/', DepartmentController.getAllDepartments);
// GET /api/departments/statistics - Get department statistics
router.get('/statistics', DepartmentController.getDepartmentStatistics);
// GET /api/departments/hierarchy - Get department hierarchy
router.get('/hierarchy', DepartmentController.getDepartmentHierarchy);
// GET /api/departments/unit/:unitId - Get departments by unit
router.get('/unit/:unitId', DepartmentController.getDepartmentsByUnit);
// GET /api/departments/:id/children - Get child departments
router.get('/:id/children', DepartmentController.getChildDepartments);
// GET /api/departments/:id - Get department by ID
router.get('/:id', DepartmentController.getDepartmentById);
// POST /api/departments - Create new department (Admin and Super Admin only)
router.post('/', authorize('Super_admin', 'Admin'), createDepartmentValidation, DepartmentController.createDepartment);
// PUT /api/departments/:id - Update department (Admin and Super Admin only)
router.put('/:id', authorize('Super_admin', 'Admin'), updateDepartmentValidation, DepartmentController.updateDepartment);
// DELETE /api/departments/:id - Delete department (Super Admin only)
router.delete('/:id', authorize('Super_admin'), DepartmentController.deleteDepartment);
module.exports = router;
//# sourceMappingURL=departments.js.map