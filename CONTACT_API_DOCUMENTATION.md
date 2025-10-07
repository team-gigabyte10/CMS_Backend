# Contact Directory API Documentation

## Overview
The Contact Directory API provides comprehensive CRUD operations for managing hierarchical contact structures using the existing `users` table. It supports unlimited tree depth with role-based permissions and includes advanced features like search, bulk operations, and tree structure management.

**Important**: This API uses the `users` table with additional fields (`parent_id`, `contact_type`) to support hierarchical contact organization. All existing user functionality is preserved while adding contact directory capabilities.

**Simplified Structure**: The API now uses a simplified organizational structure based on Units and parent-child relationships, without branches, sub-branches, or departments for cleaner tree management.

**Migration Required**: To use this API, you need to add `parent_id` and `contact_type` fields to your existing `users` table. See the Database Migration section below for SQL commands.

## Base URL
```
/api/contacts
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Role-Based Permissions

### Super Admin
- Full access to all operations
- Can delete contacts
- Can perform bulk operations

### Admin
- Can create, read, update contacts
- Can move contacts between parents
- Cannot delete contacts

### User
- Read-only access to contacts
- Can search contacts

## Endpoints

### 1. Get All Contacts
**GET** `/api/contacts`

Retrieves all contacts with optional tree structure and filtering.

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number for pagination |
| `limit` | integer | 100 | Number of contacts per page |
| `search` | string | - | Search term for name, email, service_no, or phone |
| `contact_type` | string | - | Filter by contact type: 'internal' or 'external' |
| `parent_id` | integer | null | Filter by parent contact ID |
| `unit_id` | integer | - | Filter by unit ID |
| `tree` | boolean | true | Return contacts in tree structure |
| `format` | string | 'tree' | Response format: 'tree', 'flat', or 'hierarchical' |
| `include_inactive` | boolean | false | Include inactive contacts |
| `role_filter` | string | 'all' | Filter by role: 'all', 'super_admin', 'admin', 'user' |

#### Response
```json
{
  "status": "success",
  "message": "Contacts retrieved successfully",
  "data": {
    "contacts": [
      {
        "id": 1,
        "name": "Naval Headquarters Directory",
        "rank_id": null,
        "rank_name": null,
        "service_no": null,
        "unit_id": 1,
        "unit_name": "Naval Headquarters",
        "designation_id": null,
        "designation_name": null,
        "phone": "+880211111111",
        "mobile": "+8801811111111",
        "alternative_mobile": "+8801811111111",
        "email": "nhq@navy.mil.bd",
        "parent_id": null,
        "contact_type": "internal",
        "is_active": true,
        "created_by": 1,
        "created_by_name": "Admin User",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "role_id": 1,
        "avatar": null,
        "status": "online",
        "last_seen": "2024-01-01T12:00:00.000Z",
        "display_name": "Naval Headquarters Directory",
        "display_info": " - ",
        "organizational_path": "Naval Headquarters",
        "hierarchy_path": "Naval Headquarters Directory",
        "has_children": true,
        "children_count": 3,
        "children": [
          {
            "id": 4,
            "name": "CNS Secretariat",
            "display_name": "CNS Secretariat",
            "organizational_path": "Naval Headquarters",
            "hierarchy_path": "CNS Secretariat",
            "has_children": true,
            "children_count": 2,
            "children": [...]
          }
        ]
      }
    ],
    "statistics": {
      "total_contacts": 15,
      "internal_contacts": 15,
      "external_contacts": 0,
      "root_contacts": 3,
      "child_contacts": 12,
      "super_admins": 1,
      "admins": 3,
      "regular_users": 11,
      "online_users": 5,
      "offline_users": 10,
      "busy_users": 0,
      "total_units": 2
    },
    "pagination": {
      "page": 1,
      "limit": 100,
      "total": 15,
      "format": "tree"
    },
    "filters": {
      "search": "",
      "contact_type": "",
      "unit_id": "",
      "tree": true,
      "include_inactive": false,
      "role_filter": "all"
    }
  }
}
```

### 2. Get Contact by ID
**GET** `/api/contacts/:id`

Retrieves a specific contact by ID.

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `include_children` | boolean | false | Include children in response |

#### Response
```json
{
  "status": "success",
  "message": "Contact retrieved successfully",
  "data": {
    "contact": {
      "id": 1,
      "name": "Naval Headquarters Directory",
      "rank_id": null,
      "rank_name": null,
      "service_no": null,
      "unit_id": 1,
      "unit_name": "Naval Headquarters",
      "designation_id": null,
      "designation_name": null,
      "phone": "+880211111111",
      "mobile": "+8801811111111",
      "alternative_mobile": "+8801811111111",
      "email": "nhq@navy.mil.bd",
      "parent_id": null,
      "contact_type": "internal",
      "is_active": true,
      "created_by": 1,
      "created_by_name": "Admin User",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "role_id": 1,
      "avatar": null,
      "status": "online",
      "last_seen": "2024-01-01T12:00:00.000Z",
      "children": []
    }
  }
}
```

### 3. Create Contact
**POST** `/api/contacts`

Creates a new contact using the users table. Requires Admin or Super Admin role.

**Note**: New contacts are created as users with `role_id = 3` (User role) by default. The `password_hash` field is set to a default value for contact-only entries.

#### Request Body
```json
{
  "name": "New Contact",
  "rank_id": 1,
  "service_no": "BN12345",
  "unit_id": 1,
  "designation_id": 1,
  "phone": "+880211111111",
  "mobile": "+8801811111111",
  "alternative_mobile": "+8801811111111",
  "email": "contact@navy.mil.bd",
  "parent_id": 1,
  "contact_type": "internal",
  "role_id": 3,
  "status": "offline",
  "avatar": null
}
```

#### Required Fields
- `name` (string, 2-255 characters)

#### Optional Fields
- `rank_id` (integer)
- `service_no` (string, max 50 characters)
- `unit_id` (integer)
- `designation_id` (integer)
- `phone` (string, max 20 characters)
- `mobile` (string, max 20 characters)
- `alternative_mobile` (string, max 20 characters)
- `email` (valid email, max 255 characters)
- `parent_id` (integer)
- `contact_type` (enum: 'internal' or 'external')
- `role_id` (integer, default: 3)
- `status` (enum: 'online', 'offline', 'busy', default: 'offline')
- `avatar` (string, URL to avatar image)

#### Response
```json
{
  "status": "success",
  "message": "Contact created successfully",
  "data": {
    "contact": {
      "id": 16,
      "name": "New Contact",
      "rank_id": 1,
      "rank_name": "Admiral",
      "service_no": "BN12345",
      "unit_id": 1,
      "unit_name": "Naval Headquarters",
      "designation_id": 1,
      "designation_name": "CNS",
      "phone": "+880211111111",
      "mobile": "+8801811111111",
      "alternative_mobile": "+8801811111111",
      "email": "contact@navy.mil.bd",
      "parent_id": 1,
      "contact_type": "internal",
      "is_active": true,
      "created_by": 1,
      "created_by_name": "Admin User",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "role_id": 3,
      "avatar": null,
      "status": "offline",
      "last_seen": null
    },
    "tree_structure": [...],
    "statistics": {
      "total_contacts": 16,
      "internal_contacts": 16,
      "external_contacts": 0,
      "root_contacts": 3,
      "child_contacts": 13,
      "super_admins": 1,
      "admins": 3,
      "regular_users": 12,
      "online_users": 5,
      "offline_users": 11,
      "busy_users": 0,
      "total_units": 2
    },
    "parent_info": {
      "id": 1,
      "name": "Parent Contact",
      "unit_name": "Naval Headquarters"
    }
  }
}
```

### 4. Update Contact
**PUT** `/api/contacts/:id`

Updates an existing contact. Requires Admin or Super Admin role.

#### Request Body
Same as create contact, but all fields are optional.

#### Response
```json
{
  "status": "success",
  "message": "Contact updated successfully",
  "data": {
    "contact": {
      "id": 16,
      "name": "Updated Contact",
      "rank_id": 1,
      "rank_name": "Admiral",
      "service_no": "BN12345",
      "unit_id": 1,
      "unit_name": "Naval Headquarters",
      "branch_id": 1,
      "branch_name": "CNS Sectt",
      "sub_branch_id": 1,
      "sub_branch_name": "CNS Sectt",
      "department_id": 1,
      "department_name": "CNS",
      "designation_id": 1,
      "designation_name": "CNS",
      "phone": "+880211111111",
      "mobile": "+8801811111111",
      "alternative_mobile": "+8801811111111",
      "email": "contact@navy.mil.bd",
      "parent_id": 1,
      "contact_type": "internal",
      "is_active": true,
      "created_by": 1,
      "created_by_name": "Admin User",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "children": []
    }
  }
}
```

### 5. Delete Contact
**DELETE** `/api/contacts/:id`

Soft deletes a contact. Requires Super Admin role.

#### Response
```json
{
  "status": "success",
  "message": "Contact deleted successfully"
}
```

#### Error Response (if contact has children)
```json
{
  "status": "error",
  "message": "Cannot delete contact with children. Please delete children first or reassign them."
}
```

### 6. Get Contact Children
**GET** `/api/contacts/:id/children`

Retrieves all children of a specific contact.

#### Response
```json
{
  "status": "success",
  "message": "Contact children retrieved successfully",
  "data": {
    "parent": {
      "id": 1,
      "name": "Naval Headquarters Directory",
      "children": []
    },
    "children": [
      {
        "id": 4,
        "name": "CNS Secretariat",
        "rank_id": 1,
        "rank_name": "Admiral",
        "service_no": "BN10001",
        "unit_id": 1,
        "unit_name": "Naval Headquarters",
        "branch_id": 1,
        "branch_name": "CNS Sectt",
        "sub_branch_id": 1,
        "sub_branch_name": "CNS Sectt",
        "department_id": 1,
        "department_name": "CNS",
        "designation_id": 1,
        "designation_name": "CNS",
        "phone": "+880211111111",
        "mobile": "+8801811111111",
        "alternative_mobile": "+8801811111111",
        "email": "cns@navy.mil.bd",
        "parent_id": 1,
        "contact_type": "internal",
        "is_active": true,
        "created_by": 1,
        "created_by_name": "Admin User",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "children": []
      }
    ]
  }
}
```

### 7. Search Contacts
**GET** `/api/contacts/search`

Searches contacts by name, email, service number, or phone.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search term (minimum 2 characters) |
| `contact_type` | string | No | Filter by contact type |
| `limit` | integer | No | Maximum results (default: 20) |

#### Response
```json
{
  "status": "success",
  "message": "Search completed successfully",
  "data": {
    "contacts": [
      {
        "id": 1,
        "name": "Naval Headquarters Directory",
        "rank_id": null,
        "rank_name": null,
        "service_no": null,
        "unit_id": 1,
        "unit_name": "Naval Headquarters",
        "branch_id": null,
        "branch_name": null,
        "sub_branch_id": null,
        "sub_branch_name": null,
        "department_id": null,
        "department_name": null,
        "designation_id": null,
        "designation_name": null,
        "phone": "+880211111111",
        "mobile": "+8801811111111",
        "alternative_mobile": "+8801811111111",
        "email": "nhq@navy.mil.bd",
        "parent_id": null,
        "contact_type": "internal",
        "is_active": true,
        "created_by": 1,
        "created_by_name": "Admin User",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "children": []
      }
    ],
    "searchTerm": "naval",
    "total": 1
  }
}
```

### 8. Get Contact Statistics
**GET** `/api/contacts/statistics`

Retrieves contact statistics.

#### Response
```json
{
  "status": "success",
  "message": "Contact statistics retrieved successfully",
  "data": {
    "statistics": {
      "total_contacts": 15,
      "internal_contacts": 15,
      "external_contacts": 0,
      "root_contacts": 3,
      "child_contacts": 12
    }
  }
}
```

### 9. Bulk Delete Contacts
**POST** `/api/contacts/bulk-delete`

Deletes multiple contacts at once. Requires Super Admin role.

#### Request Body
```json
{
  "contactIds": [1, 2, 3]
}
```

#### Response
```json
{
  "status": "success",
  "message": "Bulk delete operation completed",
  "data": {
    "deleted": [
      { "id": 1, "status": "deleted" },
      { "id": 2, "status": "deleted" }
    ],
    "errors": [
      { "id": 3, "error": "Contact has children" }
    ],
    "summary": {
      "total": 3,
      "deleted": 2,
      "errors": 1
    }
  }
}
```

### 10. Move Contact
**PUT** `/api/contacts/:id/move`

Moves a contact to a different parent. Requires Admin or Super Admin role.

#### Request Body
```json
{
  "parent_id": 2
}
```

#### Response
```json
{
  "status": "success",
  "message": "Contact moved successfully",
  "data": {
    "contact": {
      "id": 4,
      "name": "CNS Secretariat",
      "parent_id": 2,
      "children": []
    }
  }
}
```

## Error Responses

### Validation Error
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

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

### Not Found Error
```json
{
  "status": "error",
  "message": "Contact not found"
}
```

## Tree Structure Features

### Unlimited Depth
The contact directory supports unlimited tree depth. You can create contacts with any number of nested levels.

### Hierarchical Organization
- Root contacts have `parent_id: null`
- Child contacts reference their parent via `parent_id`
- Tree structure is automatically built when `tree=true` parameter is used

### 5. Get Contact Tree by Unit
**GET** `/api/contacts/unit/:unitId`

Retrieves contact tree structure for a specific unit with enhanced filtering options.

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | string | - | Search term for name, email, service_no, or phone |
| `contact_type` | string | - | Filter by contact type: 'internal' or 'external' |
| `format` | string | 'tree' | Response format: 'tree', 'flat', or 'hierarchical' |
| `include_inactive` | boolean | false | Include inactive contacts |
| `role_filter` | string | 'all' | Filter by role: 'all', 'super_admin', 'admin', 'user' |

#### Response
```json
{
  "status": "success",
  "message": "Unit contact tree retrieved successfully",
  "data": {
    "unit_id": 1,
    "contacts": [...],
    "statistics": {
      "total_contacts": 10,
      "internal_contacts": 10,
      "external_contacts": 0,
      "super_admins": 1,
      "admins": 2,
      "regular_users": 7,
      "online_users": 3,
      "offline_users": 7
    },
    "filters": {
      "search": "",
      "contact_type": "",
      "format": "tree",
      "include_inactive": false,
      "role_filter": "all"
    }
  }
}
```

### 6. Get Contact Tree by Branch
**GET** `/api/contacts/branch/:branchId`

Retrieves contact tree structure for a specific branch (treated as unit in simplified structure).

#### Query Parameters
Same as Get Contact Tree by Unit.

### 7. Get Organizational Hierarchy
**GET** `/api/contacts/organizational-hierarchy`

Retrieves the complete organizational hierarchy with user counts.

#### Response
```json
{
  "status": "success",
  "message": "Organizational hierarchy retrieved successfully",
  "data": {
    "units": [
      {
        "id": 1,
        "name": "Naval Headquarters",
        "user_count": 25
      }
    ]
  }
}
```

### 8. Bulk Move Contacts
**POST** `/api/contacts/bulk-move`

Moves multiple contacts to a different parent. Requires Super Admin role.

#### Request Body
```json
{
  "contactIds": [1, 2, 3],
  "parent_id": 5
}
```

#### Response
```json
{
  "status": "success",
  "message": "Bulk move operation completed",
  "data": {
    "moved": [
      {"id": 1, "status": "moved", "new_parent_id": 5},
      {"id": 2, "status": "moved", "new_parent_id": 5}
    ],
    "errors": [
      {"id": 3, "error": "Contact has children"}
    ],
    "summary": {
      "total": 3,
      "moved": 2,
      "errors": 1
    }
  }
}
```

## Tree Operations
- **Move**: Change parent of a contact
- **Bulk Operations**: Perform operations on multiple contacts
- **Search**: Search across all levels of the tree
- **Statistics**: Get counts of root vs child contacts
- **Unit-based Filtering**: Get tree structures by organizational unit
- **Multiple Formats**: Tree, flat, or hierarchical display formats

## Response Format Changes

### Additional Fields in Contact Responses
All contact responses now include additional user fields:

```json
{
  "id": 1,
  "name": "Contact Name",
  // ... standard contact fields ...
  "role_id": 1,
  "avatar": null,
  "status": "online",
  "last_seen": "2024-01-01T12:00:00.000Z",
  "children": []
}
```

### New Fields:
- `role_id` (integer) - User role ID (default: 3 for new contacts)
- `avatar` (string|null) - User avatar URL
- `status` (string) - User status (online, offline, busy)
- `last_seen` (timestamp|null) - Last activity timestamp

## Usage Examples

### Creating a Hierarchical Structure
1. Create root contact (parent_id: null)
2. Create child contacts (parent_id: root_contact_id)
3. Create grandchild contacts (parent_id: child_contact_id)
4. Continue for unlimited depth

### Frontend Integration
The tree structure is perfect for frontend tree components like:
- React Tree View
- Vue Tree Component
- Angular Tree Component
- Custom tree implementations

### Search and Filter
- Search across all levels simultaneously
- Filter by organizational units
- Filter by contact type (internal/external)
- Paginate results for large datasets

## Database Schema

The Contact Directory API uses the existing `users` table with additional fields to support hierarchical contact organization:

### Simplified Organizational Structure:
- **Units**: Primary organizational division (e.g., Naval Headquarters, Fleet Command)
- **Parent-Child Relationships**: Unlimited depth hierarchy using `parent_id`
- **No Branches/Sub-branches/Departments**: Simplified structure for cleaner tree management

### Additional Fields Added to Users Table:
- `parent_id` (int, nullable) - Foreign key referencing `users(id)` for hierarchical structure
- `contact_type` (enum: 'internal', 'external') - Classification of contact type
- Indexes on `parent_id` and `contact_type` for optimal query performance

### Existing User Fields Used:
- All standard user fields (name, email, phone, mobile, alternative_mobile, etc.)
- Organizational references (unit_id, designation_id)
- User management fields (role_id, status, avatar, last_seen)
- Timestamps (created_at, updated_at, created_by)
- Audit fields (created_at, updated_at)
- Soft delete support (is_active)

### Benefits of This Approach:
- **Unified Data Model**: Single source of truth for users and contacts
- **No Data Duplication**: Eliminates need for separate contacts table
- **Seamless Integration**: Works with existing user management system
- **Simplified Structure**: No complex branch/department relationships to manage
- **Flexible Hierarchy**: Unlimited tree depth with parent-child relationships
- **Enhanced Performance**: Optimized queries without multiple table joins

## Tree Structure Features

### 1. Multiple Display Formats
- **Tree Format**: Hierarchical structure with nested children
- **Flat Format**: All contacts in a single array with level indicators
- **Hierarchical Format**: Tree structure with level information

### 2. Enhanced Filtering
- **Role-based Filtering**: Filter by user roles (super_admin, admin, user)
- **Status Filtering**: Filter by user status (online, offline, busy)
- **Unit-based Filtering**: Get contacts by organizational unit
- **Contact Type Filtering**: Separate internal and external contacts

### 3. Advanced Search
- **Multi-field Search**: Search across name, email, service_no, and phone
- **Tree-aware Search**: Search results maintain hierarchical context
- **Pagination Support**: Handle large contact directories efficiently

### 4. Bulk Operations
- **Bulk Move**: Move multiple contacts to different parents
- **Validation**: Automatic parent-child relationship validation
- **Error Handling**: Detailed error reporting for failed operations

### 5. Statistics and Analytics
- **Contact Counts**: Total, internal, external, root, and child counts
- **Role Distribution**: Count by user roles
- **Status Distribution**: Count by user status
- **Unit Statistics**: Contact counts per organizational unit

### 6. Response Enhancements
- **Display Names**: Formatted display names with rank and designation
- **Organizational Paths**: Full organizational hierarchy paths
- **Hierarchy Paths**: Complete parent-child hierarchy paths
- **Child Information**: Has children flag and children count
- **Hierarchical Support**: Unlimited tree depth via self-referencing `parent_id`
- **Role-Based Access**: Leverages existing user roles and permissions

This design ensures data integrity while providing maximum flexibility for organizational structures and maintaining compatibility with existing user management functionality.

## Database Migration

To enable the Contact Directory API, you need to add the following fields to your existing `users` table:

```sql
-- Add parent_id field for hierarchical structure
ALTER TABLE users ADD COLUMN parent_id INT DEFAULT NULL;
ALTER TABLE users ADD INDEX idx_parent_id (parent_id);

-- Add contact_type field for contact classification
ALTER TABLE users ADD COLUMN contact_type ENUM('internal','external') NOT NULL DEFAULT 'internal';
ALTER TABLE users ADD INDEX idx_contact_type (contact_type);

-- Add foreign key constraint for parent_id
ALTER TABLE users ADD CONSTRAINT users_ibfk_8 FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL;
```

### Migration Benefits:
- **No Data Loss**: All existing user data is preserved
- **Backward Compatible**: Existing user functionality continues to work
- **Gradual Adoption**: Can be implemented without disrupting current operations
- **Flexible**: Can be used for both user management and contact directory
