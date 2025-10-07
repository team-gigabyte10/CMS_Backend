const { pool } = require('../config/database');

class Contact {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.rank_id = data.rank_id;
    this.service_no = data.service_no;
    this.login_id = data.login_id;
    this.unit_id = data.unit_id;
    this.department_id = data.department_id;
    this.designation_id = data.designation_id;
    this.phone = data.phone;
    this.mobile = data.mobile;
    this.alternative_mobile = data.alternative_mobile;
    this.email = data.email;
    this.parent_id = data.parent_id;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    
    // Additional fields from users table
    this.role_id = data.role_id;
    this.avatar = data.avatar;
    this.status = data.status;
    this.last_seen = data.last_seen;
    this.password_hash = data.password_hash;
    
    // Additional fields from joins
    this.rank_name = data.rank_name;
    this.unit_name = data.unit_name;
    this.unit_code = data.unit_code;
    this.department_name = data.department_name;
    this.designation_name = data.designation_name;
    this.role_name = data.role_name;
    this.parent_name = data.parent_name;
    this.children = data.children || [];
  }

  // Create a new contact (using users table)
  static async create(contactData) {
    const {
      name, rank_id, service_no, login_id, unit_id, department_id,
      designation_id, phone, mobile, alternative_mobile, email, parent_id,
      password_hash,
      role_id = 3, status = 'offline', avatar = null
    } = contactData;

    // Validate required fields
    if (!name || !service_no || !login_id || !unit_id || !department_id || !designation_id || !email || !password_hash) {
      throw new Error('Required fields missing: name, service_no, login_id, unit_id, department_id, designation_id, email, and password_hash are required');
    }

    // Ensure all required fields have values (convert undefined to null for optional fields)
    const values = [
      name, 
      rank_id || null, 
      service_no, 
      login_id,
      unit_id, 
      department_id,
      designation_id, 
      phone || null, 
      mobile || null, 
      alternative_mobile || null, 
      email, 
      parent_id || null,
      password_hash, 
      role_id, 
      status, 
      avatar
    ];

    const query = `
      INSERT INTO users (
        name, rank_id, service_no, login_id, unit_id, department_id,
        designation_id, phone, mobile, alternative_mobile, email, parent_id,
        password_hash, role_id, status, avatar
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      const [result] = await pool.execute(query, values);
      return result.insertId;
    } catch (error) {
      throw new Error(`Error creating contact: ${error.message}`);
    }
  }

  // Find contact by ID with full details
  static async findById(id) {
    const query = `
      SELECT 
        u.*,
        r.name as rank_name,
        un.name as unit_name,
        un.code as unit_code,
        d.name as department_name,
        des.name as designation_name,
        ro.name as role_name,
        p.name as parent_name
      FROM users u
      LEFT JOIN ranks r ON u.rank_id = r.id
      LEFT JOIN units un ON u.unit_id = un.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN designations des ON u.designation_id = des.id
      LEFT JOIN roles ro ON u.role_id = ro.id
      LEFT JOIN users p ON u.parent_id = p.id
      WHERE u.id = ? AND u.is_active = 1
    `;
    
    try {
      const [rows] = await pool.execute(query, [id]);
      if (rows.length > 0) {
        return new Contact(rows[0]);
      }
      return null;
    } catch (error) {
      throw new Error(`Error finding contact by ID: ${error.message}`);
    }
  }

  // Get all contacts with tree structure
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 50,
      search = '',
      parent_id = null,
      unit_id = '',
      department_id = '',
      include_children = true
    } = options;

    // Ensure page and limit are valid positive integers
    const validPage = Math.max(1, parseInt(page) || 1);
    const validLimit = Math.min(Math.max(1, parseInt(limit) || 50), 1000); // Cap at 1000

    let query = `
      SELECT 
        u.*,
        r.name as rank_name,
        un.name as unit_name,
        un.code as unit_code,
        d.name as department_name,
        des.name as designation_name,
        ro.name as role_name,
        p.name as parent_name
      FROM users u
      LEFT JOIN ranks r ON u.rank_id = r.id
      LEFT JOIN units un ON u.unit_id = un.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN designations des ON u.designation_id = des.id
      LEFT JOIN roles ro ON u.role_id = ro.id
      LEFT JOIN users p ON u.parent_id = p.id
      WHERE u.is_active = 1
    `;
    
    const conditions = [];
    const values = [];

    if (search) {
      conditions.push('(u.name LIKE ? OR u.email LIKE ? OR u.service_no LIKE ? OR u.phone LIKE ?)');
      values.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (parent_id !== null) {
      conditions.push('u.parent_id = ?');
      values.push(parent_id);
    }

    if (unit_id) {
      conditions.push('u.unit_id = ?');
      values.push(unit_id);
    }

    if (department_id) {
      conditions.push('u.department_id = ?');
      values.push(department_id);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY u.name ASC';

    // Add pagination - use validated values
    const offset = (validPage - 1) * validLimit;
    query += ` LIMIT ${validLimit} OFFSET ${offset}`;

    try {
      const [rows] = await pool.execute(query, values);
      const contacts = rows.map(row => new Contact(row));

      // If include_children is true, build tree structure
      if (include_children) {
        return await Contact.buildTreeStructure(contacts);
      }

      return contacts;
    } catch (error) {
      throw new Error(`Error finding contacts: ${error.message}`);
    }
  }

  // Build tree structure from flat list
  static async buildTreeStructure(contacts) {
    const contactMap = new Map();
    const rootContacts = [];

    // Create a map of all contacts
    contacts.forEach(contact => {
      contactMap.set(contact.id, { ...contact, children: [] });
    });

    // Build the tree structure
    contacts.forEach(contact => {
      // Handle self-reference (parent_id = id) - treat as root contact
      if (contact.parent_id && contact.parent_id === contact.id) {
        rootContacts.push(contactMap.get(contact.id));
      }
      // Handle normal parent-child relationship
      else if (contact.parent_id && contactMap.has(contact.parent_id)) {
        contactMap.get(contact.parent_id).children.push(contactMap.get(contact.id));
      } 
      // Handle root contacts (no parent or parent not found)
      else {
        rootContacts.push(contactMap.get(contact.id));
      }
    });

    return rootContacts;
  }

  // Get contact tree (all contacts in tree format)
  static async getContactTree(options = {}) {
    const { 
      search = '', 
      unit_id = '', 
      department_id = '',
      include_inactive = false,
      role_filter = 'all'
    } = options;
    
    try {
      let query = `
        SELECT 
          u.*,
          r.name as rank_name,
          un.name as unit_name,
          un.code as unit_code,
          d.name as department_name,
          des.name as designation_name,
          ro.name as role_name,
          p.name as parent_name
        FROM users u
        LEFT JOIN ranks r ON u.rank_id = r.id
        LEFT JOIN units un ON u.unit_id = un.id
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN designations des ON u.designation_id = des.id
        LEFT JOIN roles ro ON u.role_id = ro.id
        LEFT JOIN users p ON u.parent_id = p.id
        WHERE ${include_inactive ? '1=1' : 'u.is_active = 1'}
      `;
      
      const conditions = [];
      const values = [];

      if (search) {
        conditions.push('(u.name LIKE ? OR u.email LIKE ? OR u.service_no LIKE ? OR u.phone LIKE ?)');
        values.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (unit_id) {
        conditions.push('u.unit_id = ?');
        values.push(unit_id);
      }

      if (department_id) {
        conditions.push('u.department_id = ?');
        values.push(department_id);
      }

      // Apply role filter
      if (role_filter !== 'all') {
        switch (role_filter) {
          case 'super_admin':
            conditions.push('u.role_id = 1');
            break;
          case 'admin':
            conditions.push('u.role_id = 2');
            break;
          case 'user':
            conditions.push('u.role_id = 3');
            break;
        }
      }

      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }

      query += ' ORDER BY u.unit_id ASC, u.name ASC';

      const [rows] = await pool.execute(query, values);
      const contacts = rows.map(row => new Contact(row));
      return await Contact.buildTreeStructure(contacts);
    } catch (error) {
      throw new Error(`Error getting contact tree: ${error.message}`);
    }
  }

  // Get children of a contact
  static async getChildren(parentId) {
    const query = `
      SELECT 
        u.*,
        r.name as rank_name,
        un.name as unit_name,
        un.code as unit_code,
        d.name as department_name,
        des.name as designation_name,
        ro.name as role_name,
        p.name as parent_name
      FROM users u
      LEFT JOIN ranks r ON u.rank_id = r.id
      LEFT JOIN units un ON u.unit_id = un.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN designations des ON u.designation_id = des.id
      LEFT JOIN roles ro ON u.role_id = ro.id
      LEFT JOIN users p ON u.parent_id = p.id
      WHERE u.parent_id = ? AND u.is_active = 1
      ORDER BY u.name ASC
    `;
    
    try {
      const [rows] = await pool.execute(query, [parentId]);
      return rows.map(row => new Contact(row));
    } catch (error) {
      throw new Error(`Error getting children: ${error.message}`);
    }
  }

  // Update contact
  async update(updateData) {
    const allowedFields = [
      'name', 'rank_id', 'service_no', 'unit_id', 'department_id',
      'designation_id', 'phone', 'mobile', 'alternative_mobile',
      'email', 'parent_id'
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
      throw new Error(`Error updating contact: ${error.message}`);
    }
  }

  // Soft delete contact
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
      throw new Error(`Error deleting contact: ${error.message}`);
    }
  }

  // Get contact statistics
  static async getStatistics() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_contacts,
          SUM(CASE WHEN parent_id IS NULL THEN 1 ELSE 0 END) as root_contacts,
          SUM(CASE WHEN parent_id IS NOT NULL THEN 1 ELSE 0 END) as child_contacts,
          SUM(CASE WHEN role_id = 1 THEN 1 ELSE 0 END) as super_admins,
          SUM(CASE WHEN role_id = 2 THEN 1 ELSE 0 END) as admins,
          SUM(CASE WHEN role_id = 3 THEN 1 ELSE 0 END) as regular_users,
          COUNT(DISTINCT unit_id) as total_units,
          COUNT(DISTINCT department_id) as total_departments
        FROM users 
        WHERE is_active = 1
      `;
      
      const [rows] = await pool.execute(query);
      return rows[0];
    } catch (error) {
      throw new Error(`Error getting contact statistics: ${error.message}`);
    }
  }

  // Get enhanced contact statistics
  static async getEnhancedStatistics(options = {}) {
    const { 
      unit_id = '', 
      department_id = '',
      include_inactive = false,
      role_filter = 'all'
    } = options;

    try {
      let whereClause = include_inactive ? '1=1' : 'u.is_active = 1';
      const conditions = [];
      const values = [];

      if (unit_id) {
        conditions.push('u.unit_id = ?');
        values.push(unit_id);
      }

      if (department_id) {
        conditions.push('u.department_id = ?');
        values.push(department_id);
      }

      // Apply role filter
      if (role_filter !== 'all') {
        switch (role_filter) {
          case 'super_admin':
            conditions.push('u.role_id = 1');
            break;
          case 'admin':
            conditions.push('u.role_id = 2');
            break;
          case 'user':
            conditions.push('u.role_id = 3');
            break;
        }
      }

      if (conditions.length > 0) {
        whereClause += ' AND ' + conditions.join(' AND ');
      }

      const query = `
        SELECT 
          COUNT(*) as total_contacts,
          SUM(CASE WHEN u.parent_id IS NULL OR u.parent_id = u.id THEN 1 ELSE 0 END) as root_contacts,
          SUM(CASE WHEN u.parent_id IS NOT NULL AND u.parent_id != u.id THEN 1 ELSE 0 END) as child_contacts,
          SUM(CASE WHEN u.role_id = 1 THEN 1 ELSE 0 END) as super_admins,
          SUM(CASE WHEN u.role_id = 2 THEN 1 ELSE 0 END) as admins,
          SUM(CASE WHEN u.role_id = 3 THEN 1 ELSE 0 END) as regular_users,
          SUM(CASE WHEN u.status = 'online' THEN 1 ELSE 0 END) as online_users,
          SUM(CASE WHEN u.status = 'offline' THEN 1 ELSE 0 END) as offline_users,
          SUM(CASE WHEN u.status = 'busy' THEN 1 ELSE 0 END) as busy_users,
          COUNT(DISTINCT u.unit_id) as total_units
        FROM users u
        WHERE ${whereClause}
      `;
      
      const [rows] = await pool.execute(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error getting enhanced contact statistics: ${error.message}`);
    }
  }

  // Search contacts
  static async search(searchTerm, options = {}) {
    const { unit_id = '', department_id = '', limit = 20 } = options;
    
    try {
      let query = `
        SELECT 
          u.*,
          r.name as rank_name,
          un.name as unit_name,
          un.code as unit_code,
          d.name as department_name,
          des.name as designation_name,
          ro.name as role_name,
          p.name as parent_name
        FROM users u
        LEFT JOIN ranks r ON u.rank_id = r.id
        LEFT JOIN units un ON u.unit_id = un.id
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN designations des ON u.designation_id = des.id
        LEFT JOIN roles ro ON u.role_id = ro.id
        LEFT JOIN users p ON u.parent_id = p.id
        WHERE u.is_active = 1
        AND (u.name LIKE ? OR u.email LIKE ? OR u.service_no LIKE ? OR u.phone LIKE ?)
      `;
      
      const values = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];

      if (unit_id) {
        query += ' AND u.unit_id = ?';
        values.push(unit_id);
      }

      if (department_id) {
        query += ' AND u.department_id = ?';
        values.push(department_id);
      }

      query += ' ORDER BY u.name ASC LIMIT ?';
      values.push(limit);

      const [rows] = await pool.execute(query, values);
      return rows.map(row => new Contact(row));
    } catch (error) {
      throw new Error(`Error searching contacts: ${error.message}`);
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      rank_id: this.rank_id,
      rank_name: this.rank_name,
      service_no: this.service_no,
      unit_id: this.unit_id,
      unit_name: this.unit_name,
      unit_code: this.unit_code,
      department_id: this.department_id,
      department_name: this.department_name,
      designation_id: this.designation_id,
      designation_name: this.designation_name,
      phone: this.phone,
      mobile: this.mobile,
      alternative_mobile: this.alternative_mobile,
      email: this.email,
      parent_id: this.parent_id,
      parent_name: this.parent_name,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at,
      // Additional user fields
      role_id: this.role_id,
      role_name: this.role_name,
      avatar: this.avatar,
      status: this.status,
      last_seen: this.last_seen,
      children: this.children
    };
  }
}

module.exports = Contact;
