const express = require('express')
const RoleController = require('../controllers/roleController')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Role routes
router.get('/roles', RoleController.getRoles)
router.get('/roles/:id', RoleController.getRoleById)
router.get('/roles/:id/permissions', RoleController.getRoleWithPermissions)

// Permission routes
router.get('/permissions', RoleController.getPermissions)
router.get('/permissions/grouped', RoleController.getPermissionsGrouped)

// User permission routes
router.get('/users/:userId/permissions', RoleController.getUserPermissions)
router.get('/users/:userId/check-permission', RoleController.checkUserPermission)

// Lookup data routes (for dropdowns)
router.get('/lookup/all', RoleController.getLookupData)
router.get('/lookup/units/:unitId/branches', RoleController.getBranchesByUnit)
router.get('/lookup/branches/:branchId/sub-branches', RoleController.getSubBranchesByBranch)
router.get('/lookup/sub-branches/:subBranchId/designations', RoleController.getDesignationsBySubBranch)

module.exports = router
