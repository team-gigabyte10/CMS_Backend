# Super Admin API Documentation

## Overview
The Super Admin API provides comprehensive management capabilities for administrators and users within the CMS system. Super Admins can manage admin and user panels, view contact trees with hierarchical display, and control organizational structure.

## Authentication
All Super Admin endpoints require:
- Valid JWT token in Authorization header: `Bearer <token>`
- Super Admin role (role_id: 1, level: 100)

## Base URL
```
/api/super-admin
```

---

## Dashboard & Statistics

### Get Dashboard Statistics
**GET** `/dashboard/stats`

Returns comprehensive statistics for the Super Admin dashboard.

**Response:**
```json
{
  "status": "success",
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "users": {
      "total_users": 150,
      "online_users": 45,
      "offline_users": 100,
      "busy_users": 5,
      "super_admins": 2,
      "admins": 15,
      "regular_users": 133
    },
    "contacts": {
      "total_contacts": 150,
      "internal_contacts": 140,
      "external_contacts": 10,
      "root_contacts": 20,
      "child_contacts": 130
    },
    "summary": {
      "total_users": 150,
      "total_contacts": 150,
      "online_users": 45,
      "super_admins": 2,
      "admins": 15,
      "regular_users": 133
    }
  }
}
```

---

## Admin Management

### Get All Admins
**GET** `/admins`

Retrieves all admin users with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `search` (optional): Search term for name, email, or service number
- `unit_id` (optional): Filter by unit ID
- `branch_id` (optional): Filter by branch ID
- `status` (optional): Filter by status (online, offline, busy)

**Response:**
```json
{
  "status": "success",
  "message": "Admins retrieved successfully",
  "data": {
    "admins": [
      {
        "id": 1,
        "name": "Admiral Sheikh Nazrul Islam",
        "rank_id": 1,
        "rank_name": "Admiral",
        "service_no": "BN10001",
        "unit_id": 1,
        "unit_name": "Naval Headquarters",
        "branch_id": 1,
        "branch_name": "CNS Sectt",
        "designation_id": 1,
        "designation_name": "CNS",
        "email": "cns@navy.mil.bd",
        "phone": "+880211111111",
        "mobile": "+8801811111111",
        "status": "online",
        "role_id": 2,
        "role": "Admin",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "statistics": {
      "total_admins": 15,
      "online_admins": 8,
      "offline_admins": 7
    },
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 15
    }
  }
}
```

### Create New Admin
**POST** `/admins`

Creates a new admin user.

**Request Body:**
```json
{
  "name": "Captain John Doe",
  "rank_id": 6,
  "service_no": "BN10099",
  "unit_id": 1,
  "branch_id": 1,
  "designation_id": 2,
  "phone": "+880211111199",
  "mobile": "+8801811111199",
  "email": "john.doe@navy.mil.bd",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Admin created successfully",
  "data": {
    "admin": {
      "id": 99,
      "name": "Captain John Doe",
      "service_no": "BN10099",
      "email": "john.doe@navy.mil.bd",
      "role_id": 2,
      "role": "Admin",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Update Admin
**PUT** `/admins/:id`

Updates an existing admin user.

**Request Body:**
```json
{
  "name": "Captain John Smith",
  "phone": "+880211111200",
  "status": "online"
}
```

### Delete Admin
**DELETE** `/admins/:id`

Soft deletes an admin user.

---

## User Management

### Get All Users
**GET** `/users`

Retrieves all regular users with pagination and filtering.

**Query Parameters:** Same as admins endpoint

**Response:** Similar structure to admins endpoint

### Create New User
**POST** `/users`

Creates a new regular user.

**Request Body:**
```json
{
  "name": "Lieutenant Jane Smith",
  "rank_id": 7,
  "service_no": "BN10100",
  "unit_id": 1,
  "branch_id": 1,
  "designation_id": 3,
  "phone": "+880211111200",
  "mobile": "+8801811111200",
  "email": "jane.smith@navy.mil.bd",
  "password": "securePassword123",
  "parent_id": 1
}
```

### Update User
**PUT** `/users/:id`

Updates an existing user.

### Delete User
**DELETE** `/users/:id`

Soft deletes a user.

---

## Contact Tree Management

### Get Enhanced Contact Tree
**GET** `/contact-tree/enhanced`

Retrieves the complete contact tree with enhanced display options.

**Query Parameters:**
- `search` (optional): Search term
- `contact_type` (optional): internal or external
- `unit_id` (optional): Filter by unit
- `branch_id` (optional): Filter by branch
- `role_filter` (optional): all, admin, user, super_admin
- `show_hierarchy` (optional): true/false (default: true)
- `include_inactive` (optional): true/false (default: false)

**Response:**
```json
{
  "status": "success",
  "message": "Enhanced contact tree retrieved successfully",
  "data": {
    "contactTree": [
      {
        "id": 1,
        "name": "Admiral Sheikh Nazrul Islam",
        "rank_name": "Admiral",
        "service_no": "BN10001",
        "designation_name": "CNS",
        "display_name": "Admiral Sheikh Nazrul Islam",
        "display_info": "CNS - BN10001",
        "organizational_path": "Naval Headquarters > CNS Sectt",
        "children": [
          {
            "id": 2,
            "name": "Rear Admiral Mohammad Ali",
            "rank_name": "Rear Admiral",
            "service_no": "BN10002",
            "designation_name": "Secy to CNS",
            "display_name": "Rear Admiral Mohammad Ali",
            "display_info": "Secy to CNS - BN10002",
            "organizational_path": "Naval Headquarters > CNS Sectt",
            "children": []
          }
        ]
      }
    ],
    "statistics": {
      "total_contacts": 150,
      "internal_contacts": 140,
      "external_contacts": 10,
      "root_contacts": 20,
      "child_contacts": 130,
      "super_admins": 2,
      "admins": 15,
      "regular_users": 133,
      "online_users": 45,
      "offline_users": 100
    },
    "filters": {
      "search": "",
      "contact_type": "",
      "unit_id": "",
      "branch_id": "",
      "role_filter": "",
      "show_hierarchy": true,
      "include_inactive": false
    }
  }
}
```

### Get Contact Tree by Unit
**GET** `/contact-tree/unit/:unitId`

Retrieves contact tree for a specific organizational unit.

**Path Parameters:**
- `unitId`: Unit ID

**Query Parameters:** Same as enhanced contact tree

### Get Contact Tree by Branch
**GET** `/contact-tree/branch/:branchId`

Retrieves contact tree for a specific branch.

**Path Parameters:**
- `branchId`: Branch ID

### Search Contacts in Tree
**GET** `/contact-tree/search`

Searches contacts across the entire tree structure.

**Query Parameters:**
- `q`: Search term (required, min 2 characters)
- `contact_type` (optional): internal or external
- `unit_id` (optional): Filter by unit
- `branch_id` (optional): Filter by branch
- `role_filter` (optional): all, admin, user, super_admin
- `limit` (optional): Results limit (default: 50)

**Response:**
```json
{
  "status": "success",
  "message": "Search completed successfully",
  "data": {
    "contacts": [
      {
        "id": 1,
        "name": "Admiral Sheikh Nazrul Islam",
        "rank_name": "Admiral",
        "service_no": "BN10001",
        "designation_name": "CNS",
        "hierarchy_path": "Admiral - Sheikh Nazrul Islam - CNS",
        "organizational_path": "Naval Headquarters > CNS Sectt"
      }
    ],
    "searchTerm": "Admiral",
    "total": 1,
    "filters": {
      "contact_type": "",
      "unit_id": "",
      "branch_id": "",
      "role_filter": ""
    }
  }
}
```

### Get Contact Tree Statistics
**GET** `/contact-tree/statistics`

Returns comprehensive statistics for the contact tree.

---

## Organizational Hierarchy

### Get Organizational Hierarchy
**GET** `/organizational-hierarchy`

Retrieves all organizational units, branches, sub-branches, departments, designations, and ranks.

**Response:**
```json
{
  "status": "success",
  "message": "Organizational hierarchy retrieved successfully",
  "data": {
    "units": [
      {
        "id": 1,
        "name": "Naval Headquarters",
        "description": "Naval Headquarters",
        "is_active": 1
      }
    ],
    "branches": [
      {
        "id": 1,
        "name": "CNS Sectt",
        "unit_id": 1,
        "description": "Chief of Naval Staff Secretariat",
        "is_active": 1
      }
    ],
    "subBranches": [
      {
        "id": 1,
        "name": "CNS Sectt",
        "branch_id": 1,
        "description": "Chief of Naval Staff Secretariat",
        "is_active": 1
      }
    ],
    "departments": [
      {
        "id": 1,
        "name": "CNS",
        "description": "Chief of Naval Staff Secretariat",
        "is_active": 1
      }
    ],
    "designations": [
      {
        "id": 1,
        "name": "CNS",
        "sub_branch_id": 1,
        "description": "Chief of Naval Staff",
        "is_active": 1
      }
    ],
    "ranks": [
      {
        "id": 1,
        "name": "Admiral",
        "level": 10,
        "description": "Highest military rank",
        "is_active": 1
      }
    ]
  }
}
```

### Get Hierarchical Structure
**GET** `/hierarchical-structure`

Returns hierarchical structure with user counts and statistics.

**Response:**
```json
{
  "status": "success",
  "message": "Hierarchical structure retrieved successfully",
  "data": {
    "units": [
      {
        "id": 1,
        "name": "Naval Headquarters",
        "description": "Naval Headquarters",
        "branch_count": 8,
        "user_count": 120,
        "is_active": 1
      }
    ],
    "branches": [
      {
        "id": 1,
        "name": "CNS Sectt",
        "unit_id": 1,
        "unit_name": "Naval Headquarters",
        "sub_branch_count": 1,
        "user_count": 15,
        "is_active": 1
      }
    ],
    "subBranches": [
      {
        "id": 1,
        "name": "CNS Sectt",
        "branch_id": 1,
        "branch_name": "CNS Sectt",
        "unit_name": "Naval Headquarters",
        "designation_count": 6,
        "user_count": 15,
        "is_active": 1
      }
    ]
  }
}
```

---

## Bulk Operations

### Bulk Update Users
**PUT** `/users/bulk-update`

Updates multiple users at once.

**Request Body:**
```json
{
  "userIds": [1, 2, 3, 4, 5],
  "updateData": {
    "status": "online",
    "unit_id": 1
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Bulk update operation completed",
  "data": {
    "updated": [
      {"id": 1, "status": "updated"},
      {"id": 2, "status": "updated"},
      {"id": 3, "status": "updated"}
    ],
    "errors": [
      {"id": 4, "error": "User not found"},
      {"id": 5, "error": "Failed to update"}
    ],
    "summary": {
      "total": 5,
      "updated": 3,
      "errors": 2
    }
  }
}
```

---

## Error Responses

### Authentication Error
```json
{
  "status": "error",
  "message": "Access token is required"
}
```

### Authorization Error
```json
{
  "status": "error",
  "message": "Insufficient permissions"
}
```

### Validation Error
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

### Not Found Error
```json
{
  "status": "error",
  "message": "User not found"
}
```

---

## Usage Examples

### Frontend Integration Example

```javascript
// Get Super Admin dashboard statistics
const getDashboardStats = async () => {
  const response = await fetch('/api/super-admin/dashboard/stats', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Get enhanced contact tree
const getContactTree = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/super-admin/contact-tree/enhanced?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Create new admin
const createAdmin = async (adminData) => {
  const response = await fetch('/api/super-admin/admins', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(adminData)
  });
  return response.json();
};

// Search contacts
const searchContacts = async (searchTerm, filters = {}) => {
  const params = new URLSearchParams({
    q: searchTerm,
    ...filters
  });
  const response = await fetch(`/api/super-admin/contact-tree/search?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

---

## Contact Tree Display Features

The Super Admin system provides comprehensive contact tree management with the following features:

### 1. Hierarchical Display
- **Tree Structure**: Shows parent-child relationships
- **Organizational Path**: Displays unit > branch > sub-branch > department hierarchy
- **Rank Hierarchy**: Shows military rank structure

### 2. Enhanced Information Display
- **Display Name**: Combines rank and name (e.g., "Admiral Sheikh Nazrul Islam")
- **Display Info**: Shows designation and service number (e.g., "CNS - BN10001")
- **Organizational Path**: Full organizational hierarchy path
- **Hierarchy Path**: Rank - Name - Designation format

### 3. Filtering and Search
- **Role Filtering**: Filter by Super Admin, Admin, or User roles
- **Organizational Filtering**: Filter by unit, branch, or department
- **Contact Type**: Filter internal vs external contacts
- **Search**: Search across names, service numbers, emails, and phone numbers

### 4. Statistics and Analytics
- **User Statistics**: Total users, online/offline status, role distribution
- **Contact Statistics**: Internal/external contacts, hierarchical distribution
- **Organizational Statistics**: User counts per unit, branch, and department

### 5. Management Capabilities
- **Create Users**: Add new admins and users with full organizational details
- **Update Information**: Modify user details, roles, and organizational assignments
- **Bulk Operations**: Update multiple users simultaneously
- **Hierarchical Management**: Manage parent-child relationships in contact tree

This comprehensive system allows Super Admins to effectively manage the entire organizational structure while providing detailed visibility into the contact hierarchy and user distribution.
