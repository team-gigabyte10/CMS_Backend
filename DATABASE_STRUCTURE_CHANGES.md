# Database Schema Changes

## Summary of Changes

### 2. Updated Departments Table
- **Added Column**: `unit_id` (int NOT NULL)
- **Added Foreign Key**: `departments.unit_id` -> `units.id` (ON DELETE RESTRICT)
- **Purpose**: Connect departments directly to units, enabling the hierarchy: Units -> Departments -> Users

  - Super Admin: `s_admin@gmail.com` (password: admin123)
  - Admin: `admin@gmail.com` (password: admin123)

## New Organizational Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                         UNITS                                │
│  (parent_id allows unlimited unit nesting)                   │
│  Examples: Naval HQ, Dhaka Naval Area, etc.                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ├─> Has Many Departments
                      │   (department.unit_id -> units.id)
                      │
                      └─> Has Many Users
                          (user.unit_id -> units.id)
                          
┌─────────────────────────────────────────────────────────────┐
│                      DEPARTMENTS                             │
│  Each department belongs to a specific unit                  │
│  Examples: CNS, NS, JAG, ACNS, etc.                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      └─> Has Many Users
                          (user.department_id -> departments.id)

┌─────────────────────────────────────────────────────────────┐
│                      DESIGNATIONS                            │
│  Tree structure with parent-child relationships              │
│  (parent_id allows unlimited designation nesting)            │
│  Examples: CNS -> Secy to CNS -> Asst. Secy                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      └─> Assigned to Users
                          (user.designation_id -> designations.id)

┌─────────────────────────────────────────────────────────────┐
│                         USERS                                │
│  Unlimited hierarchical structure via parent_id              │
│  Each user has: unit_id, department_id, designation_id       │
│                                                               │
│  User Hierarchy Example:                                     │
│  Unit Head                                                    │
│    └─> Department Head                                       │
│         └─> Manager                                          │
│              └─> Team Lead                                   │
│                   └─> Officer                                │
│                        └─> ... (unlimited depth)             │
└─────────────────────────────────────────────────────────────┘
```

## User Creation Methodology

The new structure follows this pattern:

1. **Create Units** (with optional parent units for hierarchy)
   ```sql
   INSERT INTO units (name, code, description, parent_id) 
   VALUES ('Naval HQ', 'NHQ', 'Headquarters', NULL);
   ```

2. **Create Departments under Units**
   ```sql
   INSERT INTO departments (name, unit_id, description) 
   VALUES ('Engineering', 1, 'Engineering Department');
   ```

3. **Create Users with Unlimited Hierarchy**
   ```sql
   -- Top level user (no parent)
   INSERT INTO users (name, unit_id, department_id, designation_id, parent_id, ...) 
   VALUES ('Director', 1, 1, 1, NULL, ...);
   
   -- Child user (reports to user ID 1)
   INSERT INTO users (name, unit_id, department_id, designation_id, parent_id, ...) 
   VALUES ('Manager', 1, 1, 2, 1, ...);
   
   -- Grandchild user (reports to user ID 2)
   INSERT INTO users (name, unit_id, department_id, designation_id, parent_id, ...) 
   VALUES ('Officer', 1, 1, 3, 2, ...);
   
   -- And so on... unlimited depth
   ```

## Key Features

### 1. Unlimited User Hierarchy
- Users can have unlimited levels of parent-child relationships
- Each user can have multiple child users
- Enables complex organizational structures

### 2. Unit-Department Relationship
- Departments are now explicitly connected to units
- This enables proper organizational grouping
- A unit can have multiple departments

### 3. Complete Referential Integrity
- All foreign keys properly configured
- ON DELETE RESTRICT for critical relationships
- ON DELETE SET NULL for optional relationships

### 4. Password Management
- Passwords are hashed using bcrypt
- Default password for sample users: `admin123`
- Hash: `$2a$12$UxSeLoeManJbBuKOTkZZCe7nERf.kwNlesS7ExTt0too33egCs1CK`

## Users Table Structure

```sql
users (
  id                  INT PRIMARY KEY AUTO_INCREMENT,
  name                VARCHAR(255) NOT NULL,
  rank_id             INT,
  service_no          VARCHAR(50) NOT NULL UNIQUE,
  unit_id             INT NOT NULL,                    -- Required: belongs to a unit
  department_id       INT,                             -- Optional: can belong to a department
  role_id             INT NOT NULL DEFAULT 3,          -- Role (Super Admin, Admin, User)
  designation_id      INT NOT NULL,                    -- Required: must have a designation
  phone               VARCHAR(20) NOT NULL,
  mobile              VARCHAR(20),
  alternative_mobile  VARCHAR(20),
  email               VARCHAR(255) NOT NULL UNIQUE,
  avatar              VARCHAR(500),
  status              ENUM('online','offline','busy') DEFAULT 'offline',
  last_seen           TIMESTAMP,
  password_hash       VARCHAR(255) NOT NULL,
  parent_id           INT,                             -- Parent user for hierarchy
  is_active           TINYINT(1) DEFAULT 1,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (unit_id) REFERENCES units(id),
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (designation_id) REFERENCES designations(id),
  FOREIGN KEY (parent_id) REFERENCES users(id)        -- Self-referencing for hierarchy
)
```

## Sample Data Included

### Roles
- Super_admin (level 100)
- Admin (level 50)
- User (level 10)

### Units
- Naval Headquarters
- Dhaka Naval Area
- Chittagong Naval Area
- Khulna Naval Area
- Information Technology Department
- Engineering Division
- Operations Division

### Departments (all under Naval HQ)
- CNS, NS, JAG, ACNS, DNO, DNI, DNP, D SIG, D Works
- Naval Avn, D Hydro, D Sub, D Spl Ops, SD & Cer
- Overseas Ops, DPS, DNT, D Wel, DMS, D Edn, D Civ Pers

### Designations
- Complete hierarchical structure with 95+ designations
- Organized by department (CNS, NS, Operations, Personnel, Material, Logistics)
- Each with proper parent-child relationships

### Users
- **Super Admin**: s_admin@gmail.com
- **Admin**: admin@gmail.com

## Migration Notes

If you have an existing database, you'll need to:

1. **Backup your data first!**

2. **Add unit_id to departments**:
   ```sql
   ALTER TABLE departments 
   ADD COLUMN unit_id INT NOT NULL AFTER name;
   
   ALTER TABLE departments 
   ADD CONSTRAINT departments_ibfk_1 
   FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT;
   ```

3. **Update existing department records** with appropriate unit_id values

4. **Remove contact_type from users**:
   ```sql
   ALTER TABLE users DROP COLUMN contact_type;
   ```

5. **Clean up dummy user data** (if desired):
   ```sql
   DELETE FROM users WHERE role_id = 3;
   -- Or keep specific users you need
   ```

## Benefits of New Structure

1. **Clear Hierarchy**: Units -> Departments -> Users flow
2. **Unlimited Depth**: Users can nest infinitely via parent_id
3. **Better Organization**: Departments explicitly tied to units
4. **Scalability**: Structure supports any organizational complexity

