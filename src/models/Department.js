const { pool } = require('../config/database');

class Department {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.unit_id = data.unit_id;
    this.parent_id = data.parent_id;
    this.description = data.description;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    
    // Additional fields from joins
    this.unit_name = data.unit_name;
    this.unit_code = data.unit_code;
    this.parent_name = data.parent_name;
    this.total_users = data.total_users || 0;
  }

  // Create a new department
  static async create(departmentData) {
    const { name, unit_id, parent_id, description } = departmentData;

    const query = `
      INSERT INTO departments (name, unit_id, parent_id, description)
      VALUES (?, ?, ?, ?)
    `;

    const values = [name, unit_id, parent_id || null, description || null];

    try {
      const [result] = await pool.execute(query, values);
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Department name already exists');
      }
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        if (error.message.includes('unit_id')) {
          throw new Error('Invalid unit_id. Unit does not exist');
        } else if (error.message.includes('parent_id')) {
          throw new Error('Invalid parent_id. Parent department does not exist');
        }
        throw new Error('Invalid reference. Referenced record does not exist');
      }
      throw new Error(`Error creating department: ${error.message}`);
    }
  }

  // Find department by ID with full details
  static async findById(id) {
    const query = `
      SELECT 
        d.*,
        u.name as unit_name,
        u.code as unit_code,
        pd.name as parent_name,
        (SELECT COUNT(*) FROM users WHERE department_id = d.id AND is_active = 1) as total_users
      FROM departments d
      LEFT JOIN units u ON d.unit_id = u.id
      LEFT JOIN departments pd ON d.parent_id = pd.id
      WHERE d.id = ? AND d.is_active = 1
    `;
    
    try {
      const [rows] = await pool.execute(query, [id]);
      if (rows.length > 0) {
        return new Department(rows[0]);
      }
      return null;
    } catch (error) {
      throw new Error(`Error finding department: ${error.message}`);
    }
  }

  // Get all departments with optional filtering
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 50,
      search = '',
      unit_id = '',
      include_inactive = false
    } = options;

    // Ensure page and limit are valid positive integers
    const validPage = Math.max(1, parseInt(page) || 1);
    const validLimit = Math.min(Math.max(1, parseInt(limit) || 50), 1000); // Cap at 1000

    let query = `
      SELECT 
        d.*,
        u.name as unit_name,
        u.code as unit_code,
        pd.name as parent_name,
        (SELECT COUNT(*) FROM users WHERE department_id = d.id AND is_active = 1) as total_users
      FROM departments d
      LEFT JOIN units u ON d.unit_id = u.id
      LEFT JOIN departments pd ON d.parent_id = pd.id
      WHERE ${include_inactive ? '1=1' : 'd.is_active = 1'}
    `;
    
    const conditions = [];
    const values = [];

    if (search) {
      conditions.push('(d.name LIKE ? OR d.description LIKE ? OR u.name LIKE ?)');
      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (unit_id) {
      conditions.push('d.unit_id = ?');
      values.push(unit_id);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY u.name ASC, d.name ASC';

    // Add pagination - use validated values
    const offset = (validPage - 1) * validLimit;
    query += ` LIMIT ${validLimit} OFFSET ${offset}`;

    try {
      const [rows] = await pool.execute(query, values);
      return rows.map(row => new Department(row));
    } catch (error) {
      throw new Error(`Error finding departments: ${error.message}`);
    }
  }

  // Get departments by unit
  static async findByUnit(unitId) {
    const query = `
      SELECT 
        d.*,
        u.name as unit_name,
        u.code as unit_code,
        pd.name as parent_name,
        (SELECT COUNT(*) FROM users WHERE department_id = d.id AND is_active = 1) as total_users
      FROM departments d
      LEFT JOIN units u ON d.unit_id = u.id
      LEFT JOIN departments pd ON d.parent_id = pd.id
      WHERE d.unit_id = ? AND d.is_active = 1
      ORDER BY d.name ASC
    `;
    
    try {
      const [rows] = await pool.execute(query, [unitId]);
      return rows.map(row => new Department(row));
    } catch (error) {
      throw new Error(`Error finding departments by unit: ${error.message}`);
    }
  }

  // Update department
  static async update(id, updateData) {
    const allowedFields = ['name', 'unit_id', 'parent_id', 'description', 'is_active'];
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);

    const query = `
      UPDATE departments 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_active = 1
    `;

    try {
      const [result] = await pool.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Department name already exists');
      }
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        if (error.message.includes('unit_id')) {
          throw new Error('Invalid unit_id. Unit does not exist');
        } else if (error.message.includes('parent_id')) {
          throw new Error('Invalid parent_id. Parent department does not exist');
        }
        throw new Error('Invalid reference. Referenced record does not exist');
      }
      throw new Error(`Error updating department: ${error.message}`);
    }
  }

  // Soft delete department
  static async delete(id) {
    // Check if department has users
    const [users] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE department_id = ? AND is_active = 1',
      [id]
    );

    if (users[0].count > 0) {
      throw new Error('Cannot delete department with active users. Please reassign or delete users first.');
    }

    const query = 'UPDATE departments SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    
    try {
      const [result] = await pool.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting department: ${error.message}`);
    }
  }

  // Get department statistics
  static async getStatistics() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_departments,
          COUNT(DISTINCT unit_id) as units_with_departments,
          (SELECT COUNT(*) FROM users WHERE department_id IS NOT NULL AND is_active = 1) as total_users_in_departments,
          (SELECT COUNT(*) FROM users WHERE department_id IS NULL AND is_active = 1) as total_users_without_department
        FROM departments 
        WHERE is_active = 1
      `;
      
      const [rows] = await pool.execute(query);
      return rows[0];
    } catch (error) {
      throw new Error(`Error getting department statistics: ${error.message}`);
    }
  }

  // Get departments grouped by unit
  static async getDepartmentsByUnit() {
    try {
      const query = `
        SELECT 
          u.id as unit_id,
          u.name as unit_name,
          u.code as unit_code,
          d.id as department_id,
          d.name as department_name,
          d.description as department_description,
          (SELECT COUNT(*) FROM users WHERE department_id = d.id AND is_active = 1) as total_users
        FROM units u
        LEFT JOIN departments d ON u.id = d.unit_id AND d.is_active = 1
        WHERE u.is_active = 1
        ORDER BY u.name ASC, d.name ASC
      `;
      
      const [rows] = await pool.execute(query);
      
      // Group departments by unit
      const unitMap = new Map();
      
      rows.forEach(row => {
        if (!unitMap.has(row.unit_id)) {
          unitMap.set(row.unit_id, {
            id: row.unit_id,
            name: row.unit_name,
            code: row.unit_code,
            departments: []
          });
        }
        
        if (row.department_id) {
          unitMap.get(row.unit_id).departments.push({
            id: row.department_id,
            name: row.department_name,
            description: row.department_description,
            total_users: row.total_users
          });
        }
      });
      
      return Array.from(unitMap.values());
    } catch (error) {
      throw new Error(`Error getting departments by unit: ${error.message}`);
    }
  }

  // Check if department name exists in unit
  static async nameExistsInUnit(name, unitId, excludeId = null) {
    let query = 'SELECT COUNT(*) as count FROM departments WHERE name = ? AND unit_id = ? AND is_active = 1';
    const values = [name, unitId];

    if (excludeId) {
      query += ' AND id != ?';
      values.push(excludeId);
    }

    try {
      const [rows] = await pool.execute(query, values);
      return rows[0].count > 0;
    } catch (error) {
      throw new Error(`Error checking department name: ${error.message}`);
    }
  }

  // Get child departments
  static async getChildren(departmentId) {
    const query = `
      SELECT 
        d.*,
        u.name as unit_name,
        u.code as unit_code,
        pd.name as parent_name,
        (SELECT COUNT(*) FROM users WHERE department_id = d.id AND is_active = 1) as total_users
      FROM departments d
      LEFT JOIN units u ON d.unit_id = u.id
      LEFT JOIN departments pd ON d.parent_id = pd.id
      WHERE d.parent_id = ? AND d.is_active = 1
      ORDER BY d.name ASC
    `;
    
    try {
      const [rows] = await pool.execute(query, [departmentId]);
      return rows.map(row => new Department(row));
    } catch (error) {
      throw new Error(`Error getting child departments: ${error.message}`);
    }
  }

  // Get department hierarchy (tree structure)
  static async getHierarchy(unitId = null) {
    let whereClause = 'WHERE d.is_active = 1';
    let values = [];
    
    if (unitId) {
      whereClause += ' AND d.unit_id = ?';
      values.push(unitId);
    }

    const query = `
      SELECT 
        d.*,
        u.name as unit_name,
        u.code as unit_code,
        pd.name as parent_name,
        (SELECT COUNT(*) FROM users WHERE department_id = d.id AND is_active = 1) as total_users
      FROM departments d
      LEFT JOIN units u ON d.unit_id = u.id
      LEFT JOIN departments pd ON d.parent_id = pd.id
      ${whereClause}
      ORDER BY u.name ASC, d.name ASC
    `;
    
    try {
      const [rows] = await pool.execute(query, values);
      const departments = rows.map(row => new Department(row));
      
      // Build hierarchy tree
      const departmentMap = new Map();
      const rootDepartments = [];
      
      // First pass: create map of all departments
      departments.forEach(dept => {
        departmentMap.set(dept.id, { ...dept.toJSON(), children: [] });
      });
      
      // Second pass: build tree structure
      departments.forEach(dept => {
        if (dept.parent_id) {
          const parent = departmentMap.get(dept.parent_id);
          if (parent) {
            parent.children.push(departmentMap.get(dept.id));
          }
        } else {
          rootDepartments.push(departmentMap.get(dept.id));
        }
      });
      
      return rootDepartments;
    } catch (error) {
      throw new Error(`Error getting department hierarchy: ${error.message}`);
    }
  }

  // Check if department can be parent (avoid circular references)
  static async canBeParent(departmentId, potentialParentId) {
    if (departmentId === potentialParentId) {
      return false; // Cannot be parent of itself
    }
    
    try {
      // Check if potential parent is a descendant of the department
      const query = `
        WITH RECURSIVE dept_hierarchy AS (
          SELECT id, parent_id, 1 as level
          FROM departments 
          WHERE id = ? AND is_active = 1
          
          UNION ALL
          
          SELECT d.id, d.parent_id, dh.level + 1
          FROM departments d
          INNER JOIN dept_hierarchy dh ON d.parent_id = dh.id
          WHERE d.is_active = 1 AND dh.level < 10 -- Prevent infinite loops
        )
        SELECT COUNT(*) as count
        FROM dept_hierarchy 
        WHERE id = ?
      `;
      
      const [rows] = await pool.execute(query, [departmentId, potentialParentId]);
      return rows[0].count === 0;
    } catch (error) {
      throw new Error(`Error checking parent validity: ${error.message}`);
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      unit_id: this.unit_id,
      unit_name: this.unit_name,
      unit_code: this.unit_code,
      parent_id: this.parent_id,
      parent_name: this.parent_name,
      description: this.description,
      is_active: this.is_active,
      total_users: this.total_users,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Department;

