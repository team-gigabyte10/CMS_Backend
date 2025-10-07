const express = require('express');
const router = express.Router();
const ContactController = require('../controllers/contactController');
const { authenticateToken, authorize } = require('../middleware/auth');
const {
  createContactValidation,
  updateContactValidation
} = require('../middleware/contactValidation');

// All routes require authentication
router.use(authenticateToken);

// GET /api/contacts - Get all contacts with tree structure
router.get('/', ContactController.getAllContacts);

// GET /api/contacts/search - Search contacts
router.get('/search', ContactController.searchContacts);

// GET /api/contacts/statistics - Get contact statistics
router.get('/statistics', ContactController.getContactStatistics);

// GET /api/contacts/organizational-hierarchy - Get organizational hierarchy
router.get('/organizational-hierarchy', ContactController.getOrganizationalHierarchy);

// GET /api/contacts/unit/:unitId - Get contact tree by unit
router.get('/unit/:unitId', ContactController.getContactTreeByUnit);

// GET /api/contacts/department/:departmentId - Get contact tree by department
router.get('/department/:departmentId', ContactController.getContactTreeByDepartment);

// GET /api/contacts/branch/:branchId - Get contact tree by branch (deprecated, use department)
router.get('/branch/:branchId', ContactController.getContactTreeByBranch);

// GET /api/contacts/:id - Get contact by ID
router.get('/:id', ContactController.getContactById);

// GET /api/contacts/:id/children - Get contact children
router.get('/:id/children', ContactController.getContactChildren);

// GET /api/contacts/:id/hierarchy - Get full hierarchy path for a contact
router.get('/:id/hierarchy', ContactController.getContactHierarchy);

// POST /api/contacts - Create new contact (Admin and Super Admin only)
router.post(
  '/',
  authorize('Super_admin', 'Admin'),
  createContactValidation,
  ContactController.createContact
);

// PUT /api/contacts/:id - Update contact (Admin and Super Admin only)
router.put(
  '/:id',
  authorize('Super_admin', 'Admin'),
  updateContactValidation,
  ContactController.updateContact
);

// DELETE /api/contacts/:id - Delete contact (Super Admin only)
router.delete(
  '/:id',
  authorize('Super_admin'),
  ContactController.deleteContact
);

module.exports = router;
