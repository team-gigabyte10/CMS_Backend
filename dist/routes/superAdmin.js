const express = require('express');
const { body } = require('express-validator');
const SuperAdminController = require('../controllers/superAdminController');
const ContactTreeController = require('../controllers/contactTreeController');
const { authenticateToken, authorize } = require('../middleware/auth');
const router = express.Router();
// Validation rules
const userValidationRules = [
    body('name').trim().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
    body('service_no').trim().isLength({ min: 1, max: 50 }).withMessage('Service number is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').trim().isLength({ min: 10, max: 20 }).withMessage('Valid phone number is required'),
    body('unit_id').isInt({ min: 1 }).withMessage('Valid unit ID is required'),
    body('branch_id').isInt({ min: 1 }).withMessage('Valid branch ID is required'),
    body('designation_id').isInt({ min: 1 }).withMessage('Valid designation ID is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];
const updateUserValidationRules = [
    body('name').optional().trim().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
    body('service_no').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Service number is required'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().trim().isLength({ min: 10, max: 20 }).withMessage('Valid phone number is required'),
    body('unit_id').optional().isInt({ min: 1 }).withMessage('Valid unit ID is required'),
    body('branch_id').optional().isInt({ min: 1 }).withMessage('Valid branch ID is required'),
    body('designation_id').optional().isInt({ min: 1 }).withMessage('Valid designation ID is required'),
    body('rank_id').optional().isInt({ min: 1 }).withMessage('Valid rank ID is required'),
    body('sub_branch_id').optional().isInt({ min: 1 }).withMessage('Valid sub-branch ID is required'),
    body('department_id').optional().isInt({ min: 1 }).withMessage('Valid department ID is required'),
    body('mobile').optional().trim().isLength({ min: 10, max: 20 }).withMessage('Valid mobile number is required'),
    body('alternative_mobile').optional().trim().isLength({ min: 10, max: 20 }).withMessage('Valid alternative mobile number is required'),
    body('status').optional().isIn(['online', 'offline', 'busy']).withMessage('Status must be online, offline, or busy')
];
// All routes require Super Admin authentication
router.use(authenticateToken);
router.use(authorize('Super_admin'));
// Dashboard and Statistics
router.get('/dashboard/stats', SuperAdminController.getDashboardStats);
// Admin Management Routes
router.get('/admins', SuperAdminController.getAllAdmins);
router.get('/admins/:id', SuperAdminController.getUserById);
router.post('/admins', userValidationRules, SuperAdminController.createAdmin);
router.put('/admins/:id', updateUserValidationRules, SuperAdminController.updateUser);
router.delete('/admins/:id', SuperAdminController.deleteUser);
// User Management Routes
router.get('/users', SuperAdminController.getAllUsers);
router.get('/users/:id', SuperAdminController.getUserById);
router.post('/users', userValidationRules, SuperAdminController.createUser);
router.put('/users/:id', updateUserValidationRules, SuperAdminController.updateUser);
router.delete('/users/:id', SuperAdminController.deleteUser);
// Contact Tree Routes
router.get('/contact-tree/admin', SuperAdminController.getAdminContactTree);
router.get('/contact-tree/user', SuperAdminController.getUserContactTree);
router.get('/contact-tree/enhanced', ContactTreeController.getEnhancedContactTree);
router.get('/contact-tree/unit/:unitId', ContactTreeController.getContactTreeByUnit);
router.get('/contact-tree/branch/:branchId', ContactTreeController.getContactTreeByBranch);
router.get('/contact-tree/search', ContactTreeController.searchContactsInTree);
router.get('/contact-tree/statistics', ContactTreeController.getContactTreeStatistics);
// Organizational Hierarchy
router.get('/organizational-hierarchy', SuperAdminController.getOrganizationalHierarchy);
router.get('/hierarchical-structure', ContactTreeController.getHierarchicalStructure);
// Bulk Operations
router.put('/users/bulk-update', SuperAdminController.bulkUpdateUsers);
module.exports = router;
//# sourceMappingURL=superAdmin.js.map