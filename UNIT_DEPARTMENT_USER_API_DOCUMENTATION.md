# Unit, Department & User API Documentation

## Overview

This documentation covers the APIs for managing the organizational structure of the CMS system:
- **Units API** - Create and manage organizational units
- **Departments API** - Create and manage departments within units
- **Users API** - Create and manage users with unlimited hierarchy

### Base URLs
- Units: `/api/units`
- Departments: `/api/departments`
- Users: `/api/users`

### Authentication
All endpoints require authentication token in the header:
```
Authorization: Bearer <token>
```

### Permission Levels
- **Super Admin**: Full access to all operations
- **Admin**: Can create, read, and update (cannot delete)
- **User**: Read-only access

---

## Units API

### 1. Get All Units

Retrieve all units with optional tree structure.

**Endpoint:** `GET /api/units`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 50 | Items per page |
| `search` | string | '' | Search by name, code, or description |
| `parent_id` | integer\|null | null | Filter by parent unit |
| `tree` | boolean | false | Return tree structure |
| `include_inactive` | boolean | false | Include inactive units |

**Example Request:**
```http
GET /api/units?tree=true&include_inactive=false
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Units retrieved successfully",
  "data": {
    "units": [
      {
        "id": 1,
        "name": "Naval Headquarters",
        "code": "NHQ",
        "description": "Naval Headquarters - Top level unit",
        "parent_id": null,
        "parent_name": null,
        "is_active": true,
        "created_by": 1,
        "creator_name": "Admin",
        "total_users": 50,
        "total_departments": 22,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "children": []
      }
    ],
    "statistics": {
      "total_units": 7,
      "root_units": 4,
      "child_units": 3,
      "total_users": 100,
      "total_departments": 22
    },
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 7
    },
    "filters": {
      "search": "",
      "parent_id": null,
      "tree": true,
      "include_inactive": false
    }
  }
}
```

---

### 2. Get Unit by ID

**Endpoint:** `GET /api/units/:id`

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Unit retrieved successfully",
  "data": {
    "unit": {
      "id": 1,
      "name": "Naval Headquarters",
      "code": "NHQ",
      "description": "Naval Headquarters - Top level unit",
      "parent_id": null,
      "parent_name": null,
      "is_active": true,
      "total_users": 50,
      "total_departments": 22,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### 3. Create Unit

**Endpoint:** `POST /api/units`

**Authorization:** Admin or Super Admin

**Request Body:**
```json
{
  "name": "Naval Area Command",
  "code": "NAC",
  "description": "Naval Area Command Unit",
  "parent_id": 1
}
```

**Required Fields:**
- `name` (string, 2-100 characters)
- `code` (string, 2-20 characters, uppercase letters/numbers/hyphens/underscores only, unique)

**Optional Fields:**
- `description` (string, max 500 characters)
- `parent_id` (integer, must be valid unit ID)

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Unit created successfully",
  "data": {
    "unit": {
      "id": 8,
      "name": "Naval Area Command",
      "code": "NAC",
      ...
    }
  }
}
```

---

### 4. Update Unit

**Endpoint:** `PUT /api/units/:id`

**Authorization:** Admin or Super Admin

**Request Body:** (All fields optional)
```json
{
  "name": "Updated Unit Name",
  "description": "Updated description",
  "is_active": true
}
```

---

### 5. Delete Unit

**Endpoint:** `DELETE /api/units/:id`

**Authorization:** Super Admin only

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Unit deleted successfully"
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "Cannot delete unit with active users. Please reassign or delete users first."
}
```

---

### 6. Get Unit Children

**Endpoint:** `GET /api/units/:id/children`

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Unit children retrieved successfully",
  "data": {
    "parent_id": 1,
    "children": [...],
    "total": 3
  }
}
```

---

### 7. Get Unit Statistics

**Endpoint:** `GET /api/units/statistics`

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Unit statistics retrieved successfully",
  "data": {
    "statistics": {
      "total_units": 7,
      "root_units": 4,
      "child_units": 3,
      "total_users": 100,
      "total_departments": 22
    }
  }
}
```

---

## Departments API

### 1. Get All Departments

**Endpoint:** `GET /api/departments`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 50 | Items per page |
| `search` | string | '' | Search term |
| `unit_id` | integer | '' | Filter by unit |
| `include_inactive` | boolean | false | Include inactive departments |
| `group_by_unit` | boolean | false | Group departments by unit |

**Example Request:**
```http
GET /api/departments?unit_id=1&group_by_unit=false
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Departments retrieved successfully",
  "data": {
    "departments": [
      {
        "id": 1,
        "name": "CNS",
        "unit_id": 1,
        "unit_name": "Naval Headquarters",
        "unit_code": "NHQ",
        "description": "Chief of Naval Staff Secretariat",
        "is_active": true,
        "total_users": 10,
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "statistics": {
      "total_departments": 22,
      "units_with_departments": 7,
      "total_users_in_departments": 80,
      "total_users_without_department": 20
    },
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 22
    }
  }
}
```

---

### 2. Get Department by ID

**Endpoint:** `GET /api/departments/:id`

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Department retrieved successfully",
  "data": {
    "department": {
      "id": 1,
      "name": "CNS",
      "unit_id": 1,
      "unit_name": "Naval Headquarters",
      ...
    }
  }
}
```

---

### 3. Get Departments by Unit

**Endpoint:** `GET /api/departments/unit/:unitId`

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Departments retrieved successfully",
  "data": {
    "unit": {
      "id": 1,
      "name": "Naval Headquarters",
      "code": "NHQ"
    },
    "departments": [...],
    "total": 22
  }
}
```

---

### 4. Create Department

**Endpoint:** `POST /api/departments`

**Authorization:** Admin or Super Admin

**Request Body:**
```json
{
  "name": "Engineering Department",
  "unit_id": 1,
  "description": "Engineering and Technical Operations"
}
```

**Required Fields:**
- `name` (string, 2-100 characters)
- `unit_id` (integer, must exist)

**Optional Fields:**
- `description` (string, max 500 characters)

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Department created successfully",
  "data": {
    "department": {
      "id": 23,
      "name": "Engineering Department",
      ...
    }
  }
}
```

---

### 5. Update Department

**Endpoint:** `PUT /api/departments/:id`

**Authorization:** Admin or Super Admin

---

### 6. Delete Department

**Endpoint:** `DELETE /api/departments/:id`

**Authorization:** Super Admin only

**Description:** Soft delete a department by setting `is_active = false`. Cannot delete departments that have active users.

**Path Parameters:**
- `id` (integer, required) - Department ID to delete

**Example Request:**
```http
DELETE /api/departments/5
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Department deleted successfully"
}
```

**Error Responses:**

**(400) Cannot Delete with Active Users:**
```json
{
  "status": "error",
  "message": "Cannot delete department with active users. Please reassign or delete users first."
}
```

**(401) Unauthorized:**
```json
{
  "status": "error",
  "message": "Access token is required"
}
```

**(403) Forbidden:**
```json
{
  "status": "error",
  "message": "Insufficient permissions"
}
```

**(404) Not Found:**
```json
{
  "status": "error",
  "message": "Department not found"
}
```

**Business Rules:**
- Only Super Admin can delete departments
- Cannot delete departments with active users
- Uses soft delete (sets `is_active = false`)
- Users in deleted departments should be reassigned before deletion

---

### 7. Get Department Statistics

**Endpoint:** `GET /api/departments/statistics`

---

## Users API

### 1. Get All Users

**Endpoint:** `GET /api/users`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 50 | Items per page |
| `search` | string | '' | Search term |
| `unit_id` | integer | '' | Filter by unit |
| `department_id` | integer | '' | Filter by department |
| `role_id` | integer | '' | Filter by role |
| `parent_id` | integer\|null | null | Filter by parent user |
| `include_inactive` | boolean | false | Include inactive users |

**Example Request:**
```http
GET /api/users?unit_id=1&department_id=1&role_id=3
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": 1,
        "name": "Admiral Sheikh Nazrul Islam",
        "service_no": "BN10001",
        "email": "s_admin@gmail.com",
        "unit_name": "Naval Headquarters",
        "department_name": "CNS",
        "designation_name": "Chief of Naval Staff",
        "role_name": "Super_admin",
        "parent_name": null,
        "is_active": true,
        "status": "offline",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "statistics": {...},
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 2
    }
  }
}
```

---

### 2. Get User by ID

**Endpoint:** `GET /api/users/:id`

**Success Response (200):**
```json
{
  "status": "success",
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Admiral Sheikh Nazrul Islam",
      "rank_id": 1,
      "rank_name": "General",
      "service_no": "BN10001",
      "unit_id": 1,
      "unit_name": "Naval Headquarters",
      "department_id": 1,
      "department_name": "CNS",
      "designation_id": 1,
      "designation_name": "Chief of Naval Staff",
      "phone": "+880211111111",
      "mobile": "+8801811111111",
      "alternative_mobile": "+8801811111111",
      "email": "s_admin@gmail.com",
      "role_id": 1,
      "role_name": "Super_admin",
      "parent_id": null,
      "parent_name": null,
      "avatar": null,
      "status": "offline",
      "is_active": true,
      "last_seen": null,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### 3. Create User

**Endpoint:** `POST /api/users`

**Authorization:** Admin or Super Admin

**Request Body:**
```json
{
  "name": "Captain John Doe",
  "rank_id": 6,
  "service_no": "BN10999",
  "unit_id": 1,
  "department_id": 1,
  "designation_id": 3,
  "phone": "+880211119999",
  "mobile": "+8801811119999",
  "alternative_mobile": "+8801911119999",
  "email": "john.doe@navy.mil.bd",
  "parent_id": 2,
  "role_id": 3,
  "password": "secure_password"
}
```

**Required Fields:**
- `name` (string, 2-255 characters)
- `service_no` (string, max 50 characters, unique)
- `unit_id` (integer, must exist)
- `designation_id` (integer, must exist)
- `phone` (string, max 20 characters)
- `email` (string, valid email, unique)

**Optional Fields:**
- `rank_id` (integer)
- `department_id` (integer, must belong to the unit)
- `mobile` (string)
- `alternative_mobile` (string)
- `parent_id` (integer, must be in same unit)
- `role_id` (integer, 1=Super Admin, 2=Admin, 3=User, default: 3)
- `password` (string, min 6 characters, default: "password123")

**Success Response (201):**
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "user": {
      "id": 999,
      "name": "Captain John Doe",
      "service_no": "BN10999",
      "email": "john.doe@navy.mil.bd",
      "unit_name": "Naval Headquarters",
      "department_name": "CNS",
      "designation_name": "Assistant Secretary",
      "role_name": "User",
      "parent_name": "Rear Admiral Mohammad Ali",
      "created_at": "2024-01-15T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**

**(400) Validation Error:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

**(400) Duplicate:**
```json
{
  "status": "error",
  "message": "Service number already exists"
}
```

**(400) Invalid Parent:**
```json
{
  "status": "error",
  "message": "Parent user must be in the same unit"
}
```

---

### 4. Update User

**Endpoint:** `PUT /api/users/:id`

**Authorization:** Admin or Super Admin

**Request Body:** (All fields optional)
```json
{
  "name": "Updated Name",
  "department_id": 2,
  "phone": "+880211110000",
  "status": "online",
  "password": "new_password"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "User updated successfully",
  "data": {
    "user": {
      "id": 999,
      "name": "Updated Name",
      ...
    }
  }
}
```

---

### 5. Delete User

**Endpoint:** `DELETE /api/users/:id`

**Authorization:** Super Admin only

**Success Response (200):**
```json
{
  "status": "success",
  "message": "User deleted successfully"
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "Cannot delete user with subordinates. Please reassign or delete subordinates first."
}
```

---

### 6. Get User Statistics

**Endpoint:** `GET /api/users/statistics`

**Success Response (200):**
```json
{
  "status": "success",
  "message": "User statistics retrieved successfully",
  "data": {
    "statistics": {
      "total_users": 100,
      "active_users": 95,
      "inactive_users": 5,
      "super_admins": 1,
      "admins": 10,
      "regular_users": 89
    }
  }
}
```

---

## Complete Workflow Example

### Creating Complete Organizational Structure

#### Step 1: Create a Unit
```http
POST /api/units
{
  "name": "Naval Headquarters",
  "code": "NHQ",
  "description": "Main headquarters"
}
// Response: { unit: { id: 1, ... } }
```

#### Step 2: Create a Department under the Unit
```http
POST /api/departments
{
  "name": "Engineering Department",
  "unit_id": 1,
  "description": "Engineering and technical operations"
}
// Response: { department: { id: 1, ... } }
```

#### Step 3: Create Unit Commander (Root User)
```http
POST /api/users
{
  "name": "Admiral Commander",
  "service_no": "BN20001",
  "unit_id": 1,
  "department_id": null,
  "designation_id": 10,
  "phone": "+880211110000",
  "email": "commander@navy.mil.bd",
  "parent_id": null,
  "role_id": 2,
  "password": "secure_password"
}
// Response: { user: { id: 100, ... } }
```

#### Step 4: Create Department Head (under Commander)
```http
POST /api/users
{
  "name": "Department Head",
  "service_no": "BN20002",
  "unit_id": 1,
  "department_id": 1,
  "designation_id": 11,
  "phone": "+880211110001",
  "email": "dept.head@navy.mil.bd",
  "parent_id": 100,
  "role_id": 3
}
// Response: { user: { id: 101, ... } }
```

#### Step 5: Create Team Lead (under Department Head)
```http
POST /api/users
{
  "name": "Team Lead",
  "service_no": "BN20003",
  "unit_id": 1,
  "department_id": 1,
  "designation_id": 12,
  "phone": "+880211110002",
  "email": "team.lead@navy.mil.bd",
  "parent_id": 101,
  "role_id": 3
}
// Response: { user: { id: 102, ... } }
```

#### Step 6: Create Officer (under Team Lead)
```http
POST /api/users
{
  "name": "Officer",
  "service_no": "BN20004",
  "unit_id": 1,
  "department_id": 1,
  "designation_id": 13,
  "phone": "+880211110003",
  "email": "officer@navy.mil.bd",
  "parent_id": 102,
  "role_id": 3
}
// Response: { user: { id: 103, ... } }
```

This creates the hierarchy:
```
Naval Headquarters (Unit)
  └─> Engineering Department
      └─> Admiral Commander (ID: 100, parent_id: null)
          └─> Department Head (ID: 101, parent_id: 100)
              └─> Team Lead (ID: 102, parent_id: 101)
                  └─> Officer (ID: 103, parent_id: 102)
                      └─> ... (unlimited nesting)
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error, business logic error) |
| 401 | Unauthorized (no token or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate entry) |
| 500 | Internal Server Error |

---

## Business Rules

### Units
1. Unit codes must be unique across the system
2. A unit can have a parent unit (for hierarchy)
3. A unit cannot be its own parent
4. Cannot delete a unit with:
   - Active users
   - Active departments
   - Child units

### Departments
1. Department names must be unique within a unit (can have same name in different units)
2. Departments must belong to a unit
3. Cannot delete a department with active users

### Users
1. Service numbers must be unique across the system
2. Email addresses must be unique across the system
3. Users must belong to a unit
4. Users can optionally belong to a department (must be in the same unit)
5. Parent user must be in the same unit
6. A user cannot be their own parent
7. Cannot delete a user with subordinates (users having them as parent)
8. Password is automatically hashed using bcrypt
9. Default password is "password123" if not provided

---

## Frontend Integration Example

```javascript
// Create Unit
const createUnit = async (unitData) => {
  const response = await fetch('/api/units', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(unitData)
  });
  return response.json();
};

// Create Department
const createDepartment = async (deptData) => {
  const response = await fetch('/api/departments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(deptData)
  });
  return response.json();
};

// Create User
const createUser = async (userData) => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });
  return response.json();
};

// Get units tree
const getUnitsTree = async () => {
  const response = await fetch('/api/units?tree=true', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

---

## Notes

1. **Hierarchy Depth**: The system supports unlimited hierarchy depth for both units and users
2. **Soft Delete**: All delete operations are soft deletes (sets `is_active = false`)
3. **Cascading**: Deleting a parent sets children's `parent_id` to NULL
4. **Permissions**: Always check user role before allowing operations
5. **Validation**: All fields are validated on both client and server side

---

For more information, refer to:
- Database Schema: `database_schema.sql`
- Contact API: `CONTACT_API_DOCUMENTATION_V2.md`
- Database Changes: `DATABASE_STRUCTURE_CHANGES.md`

