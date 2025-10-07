const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../middleware/auth');
const { createDesignationValidation, updateDesignationValidation } = require('../middleware/designationValidation');
const { 
// Unit controllers
getAllUnits, getUnitTree, getUnitById, createUnit, updateUnit, deleteUnit, getUnitStatistics, 
// Designation controllers
getAllDesignations, getDesignationTree, getDesignationById, createDesignation, updateDesignation, deleteDesignation, getDesignationStatistics, 
// User controllers
getAllUsers, getUserById, createUser, updateUser, deleteUser, getUserStatistics } = require('../controllers/organizationalController');
// ==================== UNIT ROUTES ====================
// Get all units
router.get('/units', auth, getAllUnits);
// Get unit tree
router.get('/units/tree', auth, getUnitTree);
// Get unit statistics
router.get('/units/statistics', auth, getUnitStatistics);
// Get unit by ID
router.get('/units/:id', auth, getUnitById);
// Create new unit
router.post('/units', auth, createUnit);
// Update unit
router.put('/units/:id', auth, updateUnit);
// Delete unit
router.delete('/units/:id', auth, deleteUnit);
// ==================== DESIGNATION ROUTES ====================
// Get all designations
router.get('/designations', auth, getAllDesignations);
// Get designation tree
router.get('/designations/tree', auth, getDesignationTree);
// Get designation by ID
router.get('/designations/:id', auth, getDesignationById);
// Create new designation
router.post('/designations', auth, createDesignationValidation, createDesignation);
// Update designation
router.put('/designations/:id', auth, updateDesignationValidation, updateDesignation);
// Delete designation
router.delete('/designations/:id', auth, deleteDesignation);
// Get designation statistics
router.get('/designations/statistics', auth, getDesignationStatistics);
// ==================== USER ROUTES ====================
// Get all users
router.get('/users', auth, getAllUsers);
// Get user by ID
router.get('/users/:id', auth, getUserById);
// Create new user
router.post('/users', auth, createUser);
// Update user
router.put('/users/:id', auth, updateUser);
// Delete user
router.delete('/users/:id', auth, deleteUser);
// Get user statistics
router.get('/users/statistics', auth, getUserStatistics);
module.exports = router;
//# sourceMappingURL=organizational.js.map