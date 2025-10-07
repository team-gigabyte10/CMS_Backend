const { pool } = require('../config/database');

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.rank_id = data.rank_id;
    this.rank_name = data.rank_name;
    this.service_no = data.service_no;
    this.unit_id = data.unit_id;
    this.unit_name = data.unit_name;
    this.unit_code = data.unit_code;
    this.department_id = data.department_id;
    this.department_name = data.department_name;
    this.role_id = data.role_id;
    this.role = data.role || data.role_name; // Support both old and new
    this.role_name = data.role_name;
    this.designation_id = data.designation_id;
    this.designation_name = data.designation_name;
    this.parent_id = data.parent_id; // Tree structure for users
    this.parent_name = data.parent_name;
    this.phone = data.phone;
    this.mobile = data.mobile;
    this.alternative_mobile = data.alternative_mobile;
    this.email = data.email;
    this.avatar = data.avatar;
    this.status = data.status;
    this.last_seen = data.last_seen;
    this.password_hash = data.password_hash;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new user
  static async create(userData) {
    const {
      name, rank_id, service_no, unit_id, department_id,
      role_id, designation_id, parent_id, phone, mobile, alternative_mobile, email, password_hash
    } = userData;

    const query = `
      INSERT INTO users (
        name, rank_id, service_no, unit_id, department_id,
        role_id, designation_id, parent_id, phone, mobile, alternative_mobile, email, password_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Convert undefined values to null for database compatibility
    const values = [
      name, 
      rank_id, 
      service_no, 
      unit_id, 
      department_id === undefined ? null : department_id,
      role_id, 
      designation_id, 
      parent_id === undefined ? null : parent_id, 
      phone, 
      mobile === undefined ? null : mobile, 
      alternative_mobile === undefined ? null : alternative_mobile, 
      email, 
      password_hash
    ];

    try {
      const [result] = await pool.execute(query, values);
      return result.insertId;
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Find user by ID
  static async findById(id) {
    const query = `
      SELECT 
        u.*,
        r.name as role_name,
        r.level as role_level,
        rk.name as rank_name,
        un.name as unit_name,
        un.code as unit_code,
        d.name as department_name,
        des.name as designation_name,
        p.name as parent_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN ranks rk ON u.rank_id = rk.id
      LEFT JOIN units un ON u.unit_id = un.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN designations des ON u.designation_id = des.id
      LEFT JOIN users p ON u.parent_id = p.id
      WHERE u.id = ? AND u.is_active = 1
    `;
    try {
      const [rows] = await pool.execute(query, [id]);
      if (rows.length > 0) {
        const userData = { ...rows[0], role: rows[0].role_name };
        return new User(userData);
      }
      return null;
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  // Find user by email
  static async findByEmail(email) {
    const query = `
      SELECT u.*, r.name as role_name, r.level as role_level
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = ? AND u.is_active = 1
    `;
    try {
      const [rows] = await pool.execute(query, [email]);
      if (rows.length > 0) {
        const userData = { ...rows[0], role: rows[0].role_name };
        return new User(userData);
      }
      return null;
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  // Find user by service number
  static async findByServiceNo(service_no) {
    const query = `
      SELECT u.*, r.name as role_name, r.level as role_level
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.service_no = ? AND u.is_active = 1
    `;
    try {
      const [rows] = await pool.execute(query, [service_no]);
      if (rows.length > 0) {
        const userData = { ...rows[0], role: rows[0].role_name };
        return new User(userData);
      }
      return null;
    } catch (error) {
      throw new Error(`Error finding user by service number: ${error.message}`);
    }
  }

  // Find users by parent_id
  static async findByParentId(parentId) {
    const query = `
      SELECT 
        u.*,
        r.name as role_name,
        rk.name as rank_name,
        un.name as unit_name,
        d.name as department_name,
        des.name as designation_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN ranks rk ON u.rank_id = rk.id
      LEFT JOIN units un ON u.unit_id = un.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN designations des ON u.designation_id = des.id
      WHERE u.parent_id = ? AND u.is_active = 1
      ORDER BY u.name ASC
    `;
    try {
      const [rows] = await pool.execute(query, [parentId]);
      return rows.map(row => new User({ ...row, role: row.role_name }));
    } catch (error) {
      throw new Error(`Error finding users by parent ID: ${error.message}`);
    }
  }

  // Get all users with pagination
  static async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        search = '',
        unit_id = '',
        department_id = '',
        role_id = '',
        parent_id,
        include_inactive = false
      } = options;

      // Ensure page and limit are integers
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 50;
      const offset = (pageNum - 1) * limitNum;

      // Build WHERE conditions
      const whereClauses = [];
      const queryParams = [];

      // Base condition for active users
      if (!include_inactive) {
        whereClauses.push('u.is_active = 1');
      }

      // Search condition
      if (search && search.trim() !== '') {
        whereClauses.push('(u.name LIKE ? OR u.email LIKE ? OR u.service_no LIKE ? OR u.phone LIKE ?)');
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      // Unit filter
      if (unit_id && unit_id !== '') {
        whereClauses.push('u.unit_id = ?');
        queryParams.push(parseInt(unit_id));
      }

      // Department filter
      if (department_id && department_id !== '') {
        whereClauses.push('u.department_id = ?');
        queryParams.push(parseInt(department_id));
      }

      // Role filter
      if (role_id && role_id !== '') {
        whereClauses.push('u.role_id = ?');
        queryParams.push(parseInt(role_id));
      }

      // Parent filter
      if (parent_id !== undefined && parent_id !== null && parent_id !== '') {
        if (parent_id === 'null') {
          whereClauses.push('u.parent_id IS NULL');
        } else {
          whereClauses.push('u.parent_id = ?');
          queryParams.push(parseInt(parent_id));
        }
      }

      // Build WHERE clause
      const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

      // Build final query
      const query = `
        SELECT 
          u.id, u.name, u.rank_id, u.service_no, u.unit_id, u.department_id,
          u.role_id, u.designation_id, u.parent_id, u.phone, u.mobile,
          u.alternative_mobile, u.email, u.avatar, u.status, u.last_seen,
          u.is_active, u.created_at, u.updated_at,
          r.name as role_name,
          r.level as role_level,
          rk.name as rank_name,
          un.name as unit_name,
          un.code as unit_code,
          d.name as department_name,
          des.name as designation_name,
          p.name as parent_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        LEFT JOIN ranks rk ON u.rank_id = rk.id
        LEFT JOIN units un ON u.unit_id = un.id
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN designations des ON u.designation_id = des.id
        LEFT JOIN users p ON u.parent_id = p.id
        ${whereSQL}
        ORDER BY u.name ASC
        LIMIT ${limitNum} OFFSET ${offset}
      `;

      const [rows] = await pool.execute(query, queryParams);
      
      return rows.map(row => {
        const userData = { ...row, role: row.role_name };
        return new User(userData);
      });
    } catch (error) {
      throw new Error(`Error finding users: ${error.message}`);
    }
  }

  // Update user
  async update(updateData) {
    const allowedFields = [
      'name', 'rank_id', 'unit_id', 'department_id',
      'role_id', 'designation_id', 'parent_id', 'phone', 'mobile', 'alternative_mobile',
      'email', 'avatar', 'status', 'last_seen'
    ];

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

    values.push(this.id);

    const query = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    try {
      const [result] = await pool.execute(query, values);
      if (result.affectedRows > 0) {
        // Update local instance
        Object.assign(this, updateData);
        return true;
      }
      return false;
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Update password
  async updatePassword(newPasswordHash) {
    const query = 'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    try {
      const [result] = await pool.execute(query, [newPasswordHash, this.id]);
      if (result.affectedRows > 0) {
        this.password_hash = newPasswordHash;
        return true;
      }
      return false;
    } catch (error) {
      throw new Error(`Error updating password: ${error.message}`);
    }
  }

  // Soft delete user
  async delete() {
    const query = 'UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    try {
      const [result] = await pool.execute(query, [this.id]);
      if (result.affectedRows > 0) {
        this.is_active = 0;
        return true;
      }
      return false;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  // Static update method
  static async update(id, updateData) {
    const allowedFields = [
      'name', 'rank_id', 'service_no', 'unit_id', 'department_id', 'designation_id', 'parent_id',
      'phone', 'mobile', 'alternative_mobile', 'email', 'role_id', 'is_active'
    ];

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

    const query = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    try {
      const [result] = await pool.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Static delete method
  static async delete(id) {
    const query = 'UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    try {
      const [result] = await pool.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  // Get user statistics
  static async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as online_users,
        SUM(CASE WHEN status = 'offline' THEN 1 ELSE 0 END) as offline_users,
        SUM(CASE WHEN status = 'busy' THEN 1 ELSE 0 END) as busy_users,
        SUM(CASE WHEN role_id = 1 THEN 1 ELSE 0 END) as super_admins,
        SUM(CASE WHEN role_id = 2 THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role_id = 3 THEN 1 ELSE 0 END) as regular_users
      FROM users 
      WHERE is_active = 1
    `;

    try {
      const [rows] = await pool.execute(query);
      return rows[0];
    } catch (error) {
      throw new Error(`Error getting user statistics: ${error.message}`);
    }
  }

  // Get users by unit
  static async getByUnit(unit_id) {
    const query = `
      SELECT u.*, r.name as role_name, r.level as role_level
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.unit_id = ? AND u.is_active = 1 ORDER BY u.name
    `;
    try {
      const [rows] = await pool.execute(query, [unit_id]);
      return rows.map(row => {
        const userData = { ...row, role: row.role_name };
        return new User(userData);
      });
    } catch (error) {
      throw new Error(`Error getting users by unit: ${error.message}`);
    }
  }

  // Get users by role
  static async getByRole(role_id) {
    const query = `
      SELECT u.*, r.name as role_name, r.level as role_level
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.role_id = ? AND u.is_active = 1 ORDER BY u.name
    `;
    try {
      const [rows] = await pool.execute(query, [role_id]);
      return rows.map(row => {
        const userData = { ...row, role: row.role_name };
        return new User(userData);
      });
    } catch (error) {
      throw new Error(`Error getting users by role: ${error.message}`);
    }
  }

  // Convert to JSON (exclude sensitive data)
  toJSON() {
    const { password_hash, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User;
