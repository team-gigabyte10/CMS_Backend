# Contact API Documentation (Updated)

## Overview

The Contact API has been updated to align with the new database schema that emphasizes a hierarchical organizational structure. This API manages users/contacts within the system, organized by **Units → Departments → Users**.

### Key Changes from Previous Version

1. **Removed** `contact_type` field (all contacts are now internal)
2. **Added** `department_id` field linking contacts to departments
3. **Departments** are now connected to units via `department_id`
4. **Unlimited User Hierarchy** via `parent_id` (Users → Users → Users...)
5. **Enhanced Queries** with department filtering

### Base URL
```
/api/contacts
```

### Authentication
All endpoints require authentication token in the header:
```
Authorization: Bearer <token>
```

---

## Data Structure

### Contact Object

```json
{
  "id": 1,
  "name": "Admiral Sheikh Nazrul Islam",
  "rank_id": 1,
  "rank_name": "General",
  "service_no": "BN10001",
  "unit_id": 1,
  "unit_name": "Naval Headquarters",
  "unit_code": "NHQ",
  "department_id": 1,
  "department_name": "CNS",
  "designation_id": 1,
  "designation_name": "Chief of Naval Staff",
  "phone": "+880211111111",
  "mobile": "+8801811111111",
  "alternative_mobile": "+8801811111111",
  "email": "s_admin@gmail.com",
  "parent_id": null,
  "parent_name": null,
  "is_active": true,
  "role_id": 1,
  "role_name": "Super_admin",
  "avatar": null,
  "status": "offline",
  "last_seen": null,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z",
  "children": []
}
```

---

## Endpoints

### 1. Get All Contacts

Retrieve all contacts with optional filtering and tree structure.

**Endpoint:** `GET /api/contacts`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number for pagination |
| `limit` | integer | 100 | Number of items per page |
| `search` | string | '' | Search by name, email, service_no, or phone |
| `parent_id` | integer\|null | null | Filter by parent contact |
| `unit_id` | integer | '' | Filter by unit |
| `department_id` | integer | '' | Filter by department |
| `tree` | boolean | true | Return tree structure or flat list |
| `format` | string | 'tree' | Response format: 'tree', 'flat', 'hierarchical' |
| `include_inactive` | boolean | false | Include inactive contacts |
| `role_filter` | string | 'all' | Filter by role: 'all', 'super_admin', 'admin', 'user' |

**Example Request:**
```http
GET /api/contacts?unit_id=1&department_id=1&tree=true&format=tree
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Contacts retrieved successfully",
  "data": {
    "contacts": [
      {
        "id": 1,
        "name": "Admiral Sheikh Nazrul Islam",
        "unit_name": "Naval Headquarters",
        "department_name": "CNS",
        "children": [
          {
            "id": 2,
            "name": "Rear Admiral Mohammad Ali",
            "parent_id": 1,
            "children": []
          }
        ]
      }
    ],
    "statistics": {
      "total_contacts": 2,
      "root_contacts": 1,
      "child_contacts": 1,
      "super_admins": 1,
      "admins": 1,
      "regular_users": 0
    },
    "pagination": {
      "page": 1,
      "limit": 100,
      "total": 2,
      "format": "tree"
    },
    "filters": {
      "search": "",
      "unit_id": "1",
      "department_id": "1",
      "tree": true,
      "include_inactive": false,
      "role_filter": "all"
    }
  }
}
```

---

### 2. Get Contact by ID

Retrieve a specific contact with full details.

**Endpoint:** `GET /api/contacts/:id`

**Example Request:**
```http
GET /api/contacts/1
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Contact retrieved successfully",
  "data": {
    "contact": {
      "id": 1,
      "name": "Admiral Sheikh Nazrul Islam",
      "rank_name": "General",
      "unit_name": "Naval Headquarters",
      "department_name": "CNS",
      "designation_name": "Chief of Naval Staff",
      "email": "s_admin@gmail.com",
      ...
    }
  }
}
```

**Error Response (404):**
```json
{
  "status": "error",
  "message": "Contact not found"
}
```

---

### 3. Create Contact

Create a new contact in the system.

**Endpoint:** `POST /api/contacts`

**Authorization:** Super Admin or Admin only

**Request Body:**
```json
{
  "name": "Captain John Doe",
  "rank_id": 3,
  "service_no": "BN10104",
  "unit_id": 1,
  "department_id": 1,
  "designation_id": 3,
  "phone": "+880211111214",
  "mobile": "+8801811111214",
  "alternative_mobile": "+8801911111214",
  "email": "john.doe@navy.mil.bd",
  "parent_id": 2,
  "role_id": 3,
  "status": "offline",
  "avatar": null
}
```

**Required Fields:**
- `name` (string, 2-255 characters)
- `service_no` (string, max 50 characters, unique)
- `unit_id` (integer, must exist in units table)
- `designation_id` (integer, must exist in designations table)
- `phone` (string, max 20 characters)
- `email` (string, valid email, unique)

**Optional Fields:**
- `rank_id` (integer)
- `department_id` (integer, must exist in departments table)
- `mobile` (string)
- `alternative_mobile` (string)
- `parent_id` (integer, must be valid user in same unit)
- `role_id` (integer, default: 3)
- `status` (enum: 'online', 'offline', 'busy', default: 'offline')
- `avatar` (string, URL)

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Contact created successfully",
  "data": {
    "contact": {
      "id": 104,
      "name": "Captain John Doe",
      "service_no": "BN10104",
      ...
    },
    "tree": {
      ... // Updated tree structure for the unit
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
  "message": "Service number or email already exists"
}
```

---

### 4. Update Contact

Update an existing contact.

**Endpoint:** `PUT /api/contacts/:id`

**Authorization:** Super Admin or Admin only

**Request Body:** (All fields optional)
```json
{
  "name": "Updated Name",
  "unit_id": 2,
  "department_id": 5,
  "phone": "+880211111999",
  "email": "updated.email@navy.mil.bd"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Contact updated successfully",
  "data": {
    "contact": {
      "id": 104,
      "name": "Updated Name",
      ...
    }
  }
}
```

---

### 5. Delete Contact

Soft delete a contact (sets is_active to false).

**Endpoint:** `DELETE /api/contacts/:id`

**Authorization:** Super Admin only

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Contact deleted successfully"
}
```

**Error Response (404):**
```json
{
  "status": "error",
  "message": "Contact not found"
}
```

---

### 6. Search Contacts

Search for contacts by name, email, service number, or phone.

**Endpoint:** `GET /api/contacts/search`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search term (min 2 characters) |
| `unit_id` | integer | No | Filter by unit |
| `department_id` | integer | No | Filter by department |
| `limit` | integer | No | Max results (default: 20) |

**Example Request:**
```http
GET /api/contacts/search?q=John&unit_id=1&department_id=1&limit=10
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Search completed successfully",
  "data": {
    "contacts": [
      {
        "id": 104,
        "name": "Captain John Doe",
        "email": "john.doe@navy.mil.bd",
        "unit_name": "Naval Headquarters",
        "department_name": "CNS",
        ...
      }
    ],
    "searchTerm": "John",
    "filters": {
      "unit_id": "1",
      "department_id": "1"
    },
    "total": 1
  }
}
```

---

### 7. Get Contact Statistics

Retrieve overall contact statistics.

**Endpoint:** `GET /api/contacts/statistics`

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Contact statistics retrieved successfully",
  "data": {
    "statistics": {
      "total_contacts": 2,
      "root_contacts": 1,
      "child_contacts": 1,
      "super_admins": 1,
      "admins": 1,
      "regular_users": 0,
      "total_units": 1,
      "total_departments": 1
    }
  }
}
```

---

### 8. Get Organizational Hierarchy

Retrieve complete organizational hierarchy with units, departments, and user counts.

**Endpoint:** `GET /api/contacts/organizational-hierarchy`

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Organizational hierarchy retrieved successfully",
  "data": {
    "hierarchy": {
      "units": [
        {
          "id": 1,
          "name": "Naval Headquarters",
          "code": "NHQ",
          "parent_id": null,
          "total_users": 2,
          "departments": [
            {
              "id": 1,
              "name": "CNS",
              "unit_id": 1,
              "total_users": 2
            }
          ],
          "children": []
        }
      ]
    }
  }
}
```

---

### 9. Get Contact Tree by Unit

Retrieve contact tree for a specific unit.

**Endpoint:** `GET /api/contacts/unit/:unitId`

**Query Parameters:**
- `search` (string): Search term
- `department_id` (integer): Filter by department
- `format` (string): 'tree', 'flat', or 'hierarchical'
- `include_inactive` (boolean): Include inactive contacts
- `role_filter` (string): 'all', 'super_admin', 'admin', 'user'

**Example Request:**
```http
GET /api/contacts/unit/1?department_id=1&format=tree
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Unit contact tree retrieved successfully",
  "data": {
    "unit_id": 1,
    "contacts": [...],
    "statistics": {...},
    "filters": {
      "search": "",
      "department_id": "1",
      "format": "tree",
      "include_inactive": false,
      "role_filter": "all"
    }
  }
}
```

---

### 10. Get Contact Children

Retrieve direct children of a contact.

**Endpoint:** `GET /api/contacts/:id/children`

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Contact children retrieved successfully",
  "data": {
    "parent_id": 1,
    "children": [
      {
        "id": 2,
        "name": "Rear Admiral Mohammad Ali",
        "parent_id": 1,
        ...
      }
    ],
    "total": 1
  }
}
```

---

### 11. Move Contact

Move a contact to a different parent or make it a root contact.

**Endpoint:** `PUT /api/contacts/:id/move`

**Authorization:** Super Admin or Admin only

**Request Body:**
```json
{
  "parent_id": 5  // or null to make it root
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Contact moved successfully",
  "data": {
    "contact": {...},
    "tree": {...}
  }
}
```

---

### 12. Bulk Delete Contacts

Delete multiple contacts at once.

**Endpoint:** `POST /api/contacts/bulk-delete`

**Authorization:** Super Admin only

**Request Body:**
```json
{
  "contactIds": [10, 11, 12, 13]
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "4 contacts deleted successfully",
  "data": {
    "deletedCount": 4,
    "contactIds": [10, 11, 12, 13]
  }
}
```

---

### 13. Bulk Move Contacts

Move multiple contacts to a new parent.

**Endpoint:** `POST /api/contacts/bulk-move`

**Authorization:** Super Admin only

**Request Body:**
```json
{
  "contactIds": [10, 11, 12],
  "parent_id": 5  // or null
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "3 contacts moved successfully",
  "data": {
    "movedCount": 3,
    "contactIds": [10, 11, 12],
    "new_parent_id": 5
  }
}
```

---

## Tree Structure Formats

### Tree Format (Nested)
```json
{
  "id": 1,
  "name": "Root User",
  "children": [
    {
      "id": 2,
      "name": "Child User 1",
      "children": [
        {
          "id": 3,
          "name": "Grandchild User",
          "children": []
        }
      ]
    }
  ]
}
```

### Flat Format (All Levels)
```json
[
  { "id": 1, "name": "Root User", "level": 0 },
  { "id": 2, "name": "Child User 1", "level": 1, "parent_id": 1 },
  { "id": 3, "name": "Grandchild User", "level": 2, "parent_id": 2 }
]
```

### Hierarchical Format (Breadcrumb)
```json
[
  {
    "id": 3,
    "name": "Grandchild User",
    "path": "Root User > Child User 1 > Grandchild User",
    "level": 2,
    "ancestors": [1, 2]
  }
]
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no token or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate entry) |
| 500 | Internal Server Error |

---

## Usage Examples

### Creating a User Hierarchy

1. **Create Unit-level User (Root)**
```javascript
POST /api/contacts
{
  "name": "Unit Commander",
  "service_no": "BN10200",
  "unit_id": 1,
  "department_id": null,
  "designation_id": 10,
  "phone": "+880211110000",
  "email": "commander@navy.mil.bd",
  "parent_id": null  // Root user
}
```

2. **Create Department Head (Child)**
```javascript
POST /api/contacts
{
  "name": "Department Head",
  "service_no": "BN10201",
  "unit_id": 1,
  "department_id": 1,
  "designation_id": 11,
  "phone": "+880211110001",
  "email": "dept.head@navy.mil.bd",
  "parent_id": 200  // ID from step 1
}
```

3. **Create Team Lead (Grandchild)**
```javascript
POST /api/contacts
{
  "name": "Team Lead",
  "service_no": "BN10202",
  "unit_id": 1,
  "department_id": 1,
  "designation_id": 12,
  "phone": "+880211110002",
  "email": "team.lead@navy.mil.bd",
  "parent_id": 201  // ID from step 2
}
```

4. **Create Officer (Great-grandchild)**
```javascript
POST /api/contacts
{
  "name": "Officer",
  "service_no": "BN10203",
  "unit_id": 1,
  "department_id": 1,
  "designation_id": 13,
  "phone": "+880211110003",
  "email": "officer@navy.mil.bd",
  "parent_id": 202  // ID from step 3
}
```

This creates an unlimited hierarchy: Unit Commander → Department Head → Team Lead → Officer → ...

---

## Notes

1. **Department Structure**: Departments must belong to a unit. Users can optionally belong to a department within their unit.

2. **Parent-Child Rules**: 
   - A user's parent must be in the same unit
   - Circular relationships are prevented
   - Deleting a parent sets children's parent_id to null

3. **Permissions**:
   - **Super Admin**: Full access to all operations
   - **Admin**: Can create, update, and view contacts
   - **User**: Can only view contacts

4. **Password Handling**: Passwords are automatically hashed using bcrypt. Default password format: `$2a$12$...`

5. **Soft Delete**: Contacts are not permanently deleted; `is_active` is set to false.

6. **Search**: Full-text search across name, email, service_no, and phone fields.

---

## Integration with Frontend

### React/Vue Example
```javascript
// Fetch contacts tree
const fetchContactsTree = async (unitId, departmentId = '') => {
  const response = await fetch(
    `/api/contacts?unit_id=${unitId}&department_id=${departmentId}&tree=true&format=tree`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const data = await response.json();
  return data.data.contacts;
};

// Create contact
const createContact = async (contactData) => {
  const response = await fetch('/api/contacts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(contactData)
  });
  return response.json();
};
```

---

## Changelog

### Version 2.0 (Current)
- Removed `contact_type` field
- Added `department_id` field
- Connected departments to units
- Enhanced filtering by department
- Updated all query parameters
- Improved statistics with department counts
- Updated validation rules

### Version 1.0
- Initial implementation with contact_type
- Basic tree structure
- Unit and branch hierarchy

---

For more information, refer to:
- Database Schema: `database_schema.sql`
- Database Changes: `DATABASE_STRUCTURE_CHANGES.md`
- Migration Guide: `API_MIGRATION_GUIDE.md`

