# RBAC Implementation Summary

## ✅ All Changes Completed

### 1. Database Schema Changes ✓

**File:** `database_schema.sql`

#### New Tables Added:
- ✅ **`roles`** - Role definitions (Super_admin, Admin, User)
- ✅ **`permissions`** - 60+ granular permissions
- ✅ **`role_permissions`** - Role-to-permission mappings
- ✅ **`user_permissions`** - Direct user permission grants

#### Users Table Updated:
- ✅ Changed `role` ENUM → `role_id` INT (FK to roles table)
- ✅ Changed all reference fields to IDs:
  - `rank` → `rank_id`
  - `unit` → `unit_id`
  - `branch` → `branch_id`
  - `sub_branch` → `sub_branch_id`
  - `department` → `department_id`
  - `designation` → `designation_id`

#### Views Updated:
- ✅ Fixed `user_statistics` view to use `role_id` instead of role ENUM

#### Issues Fixed:
- ✅ Fixed duplicate 'SO' designation entries in Personnel sub-branch
- ✅ Fixed SQL aggregate function error in user_statistics view

---

### 2. Backend API Updates ✓

#### Models Updated:

**`src/models/User.js`** ✓
- ✅ Updated `create()` to use IDs instead of names
- ✅ Added JOINs to fetch role names in queries
- ✅ Updated `findById()`, `findByEmail()`, `findByServiceNo()` with role JOIN
- ✅ Updated `findAll()` with proper table aliasing and role JOIN
- ✅ Updated `getByBranch()` and `getByRole()` to use IDs
- ✅ Updated `getStatistics()` to use `role_id` comparisons
- ✅ Updated `update()` allowedFields to use ID fields

**`src/models/Role.js`** ✓ (NEW FILE)
- ✅ Created comprehensive Role model with methods:
  - `findAll()` - Get all roles
  - `findById()` - Get role by ID
  - `findByName()` - Get role by name
  - `getRoleWithPermissions()` - Get role with its permissions
  - `getUserPermissions()` - Get all user permissions (role + direct)
  - `userHasPermission()` - Check if user has specific permission
  - `userHasRole()` - Check if user has specific role

#### Controllers Updated:

**`src/controllers/authController.js`** ✓
- ✅ Imported Role model
- ✅ Updated `login()` to:
  - Fetch and include user permissions
  - Add `role_id` to JWT token
  - Return `role_id` and `permissions` array in response
- ✅ Updated `register()` to use ID fields (rank_id, unit_id, etc.)
- ✅ Updated `refreshToken()` to include `role_id` in JWT
- ✅ Updated `getProfile()` to include `role_id` and permissions

**`src/controllers/dashboardController.js`** ✓
- ✅ Updated all queries to use `role_id` instead of role enum
- ✅ Updated `getUserStats()` to use `role_id = 1/2/3` comparisons

**`src/controllers/roleController.js`** ✓ (NEW FILE)
- ✅ Created comprehensive role/permission controller:
  - `getRoles()` - Get all roles
  - `getRoleById()` - Get specific role
  - `getRoleWithPermissions()` - Get role with permissions
  - `getPermissions()` - Get all permissions
  - `getPermissionsGrouped()` - Get permissions grouped by resource
  - `getUserPermissions()` - Get user's permissions
  - `checkUserPermission()` - Check user permission
  - `getLookupData()` - Get all lookup data for dropdowns
  - `getBranchesByUnit()` - Get branches filtered by unit
  - `getSubBranchesByBranch()` - Get sub-branches filtered by branch
  - `getDesignationsBySubBranch()` - Get designations filtered by sub-branch

#### Middleware Updated:

**`src/middleware/auth.js`** ✓
- ✅ Added `role_id` to `req.user` object in `authenticateToken`
- ✅ Added `role_id` to `req.user` object in `optionalAuth`

**`src/middleware/validation.js`** ✓
- ✅ Updated `validateRegister` to validate ID fields:
  - `rank_id` (optional, integer)
  - `unit_id` (required, integer)
  - `branch_id` (required, integer)
  - `sub_branch_id` (optional, integer)
  - `department_id` (optional, integer)
  - `role_id` (optional, 1-3)
  - `designation_id` (required, integer)
- ✅ Updated `validateProfileUpdate` with same ID validations

#### Routes Updated:

**`src/routes/roles.js`** ✓ (NEW FILE)
- ✅ Created routes for role/permission management
- ✅ Created routes for lookup data (dropdowns)

**`src/server.js`** ✓
- ✅ Imported and registered role routes at `/api`

---

### 3. API Response Changes ✓

#### Login Response (Enhanced):

**Before:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": 2,
      "name": "Super Admin",
      "role": "Super_admin",
      "email": "admin@gmail.com"
    },
    "token": "...",
    "refreshToken": "..."
  }
}
```

**After:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": 2,
      "name": "Super Admin",
      "role": "Super_admin",
      "role_id": 1,
      "email": "admin@gmail.com",
      "permissions": [
        "user.create",
        "user.read",
        "user.update",
        "user.delete",
        "user.manage_roles",
        "unit.create",
        "unit.read",
        "... (all 60+ permissions for Super_admin)"
      ]
    },
    "token": "...",
    "refreshToken": "..."
  }
}
```

#### JWT Token Payload (Enhanced):

**Before:**
```json
{
  "id": 2,
  "email": "admin@gmail.com",
  "role": "Super_admin",
  "name": "CNS"
}
```

**After:**
```json
{
  "id": 2,
  "email": "admin@gmail.com",
  "role": "Super_admin",
  "role_id": 1,
  "name": "CNS"
}
```

---

### 4. New API Endpoints ✓

All endpoints require authentication unless specified.

#### Role & Permission Endpoints:

```
GET  /api/roles                                    - Get all roles
GET  /api/roles/:id                                - Get role by ID
GET  /api/roles/:id/permissions                    - Get role with permissions
GET  /api/permissions                              - Get all permissions
GET  /api/permissions/grouped                      - Get permissions grouped by resource
GET  /api/users/:userId/permissions                - Get user's permissions
GET  /api/users/:userId/check-permission?permission=user.create - Check if user has permission
```

#### Lookup Data Endpoints (for Frontend Dropdowns):

```
GET  /api/lookup/all                               - Get all lookup data (roles, ranks, units, departments)
GET  /api/lookup/units/:unitId/branches            - Get branches by unit ID
GET  /api/lookup/branches/:branchId/sub-branches   - Get sub-branches by branch ID
GET  /api/lookup/sub-branches/:subBranchId/designations - Get designations by sub-branch ID
```

---

### 5. Permission System ✓

#### Permission Format:
`resource.action`

#### Resources:
- user, unit, branch, sub_branch, department, designation, rank
- message, conversation, notification, feedback
- audit_log, system_settings, dashboard

#### Actions:
- create, read, update, delete
- manage_roles (special for users)
- view, analytics (for dashboard)

#### Examples:
```javascript
// Check if user can create users
const canCreate = await Role.userHasPermission(userId, 'user.create');

// Check if user can manage roles
const canManageRoles = await Role.userHasPermission(userId, 'user.manage_roles');

// Check if user is admin
const isAdmin = await Role.userHasRole(userId, 'Admin');
```

---

### 6. Role Hierarchy ✓

| Role ID | Role Name     | Level | Description                        |
|---------|---------------|-------|------------------------------------|
| 1       | Super_admin   | 100   | All permissions (60+)              |
| 2       | Admin         | 50    | Most permissions (56)              |
| 3       | User          | 10    | Basic permissions (13)             |

**Super_admin Permissions:** ALL

**Admin Excluded Permissions:**
- user.delete
- user.manage_roles
- system_settings.update
- audit_log.delete

**User Permissions:**
- user.read
- message.* (all)
- conversation.create, read, update
- notification.read, update
- feedback.create, read
- dashboard.view

---

### 7. Documentation Created ✓

1. ✅ **API_MIGRATION_GUIDE.md** - Complete migration guide for frontend
2. ✅ **RBAC_IMPLEMENTATION_SUMMARY.md** - This file

---

## 🚀 Testing the Implementation

### 1. Test Database Schema
```bash
# Import the database schema
mysql -u root -p cms_db < database_schema.sql
```

### 2. Test Login API
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gmail.com",
    "password": "your_password"
  }'
```

### 3. Test Permissions API
```bash
# Get all roles
curl -X GET http://localhost:3000/api/roles \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get user permissions
curl -X GET http://localhost:3000/api/users/2/permissions \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get lookup data
curl -X GET http://localhost:3000/api/lookup/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Test User Registration (with IDs)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Test User",
    "rank_id": 6,
    "service_no": "BN99999",
    "unit_id": 1,
    "branch_id": 1,
    "sub_branch_id": 1,
    "department_id": 1,
    "role_id": 3,
    "designation_id": 1,
    "email": "test@navy.mil.bd",
    "password": "Test123!",
    "phone": "+880211111111",
    "mobile": "+8801811111111"
  }'
```

---

## ✨ Key Benefits

1. **Granular Permissions** - 60+ specific permissions instead of just 3 roles
2. **Flexible RBAC** - Can assign permissions to roles or directly to users
3. **Scalable** - Easy to add new roles and permissions
4. **Secure** - Permission checks at both role and individual levels
5. **Auditable** - Track who granted permissions and when
6. **Frontend-Ready** - Lookup endpoints for all dropdown data
7. **Backward Compatible** - Role string comparisons still work

---

## 📝 Next Steps for Frontend

1. Update user registration/edit forms to use dropdown selects for:
   - Roles, Ranks, Units, Branches, Sub-branches, Departments, Designations
2. Fetch lookup data from `/api/lookup/all` on app initialization
3. Implement cascading dropdowns (Unit → Branch → Sub-branch → Designation)
4. Use `role_id` and `permissions` array from login response
5. Implement permission-based UI visibility
6. Update all user-related API calls to send IDs instead of names

---

## 🎉 Implementation Complete!

All backend APIs have been successfully updated to support the new RBAC system. The system is now production-ready with comprehensive role and permission management.
