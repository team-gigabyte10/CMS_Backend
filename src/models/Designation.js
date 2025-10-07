const { pool } = require('../config/database')

class Designation {
  constructor (data) {
    this.id = data.id
    this.name = data.name
    this.department_id = data.department_id
    this.parent_id = data.parent_id
    this.description = data.description
    this.is_active = data.is_active
    this.created_at = data.created_at
    this.updated_at = data.updated_at

    // Additional fields from joins
    this.parent_name = data.parent_name
    this.department_name = data.department_name
    this.children = data.children || []
  }

  // Create a new designation
  static async create (designationData) {
    const {
      name, department_id, parent_id, description
    } = designationData

    const query = `
      INSERT INTO designations (name, department_id, parent_id, description)
      VALUES (?, ?, ?, ?)
    `

    // Convert undefined values to null for MySQL compatibility
    const values = [
      name,
      department_id,
      parent_id || null,
      description || null
    ]

    try {
      const [result] = await pool.execute(query, values)
      return result.insertId
    } catch (error) {
      throw new Error(`Error creating designation: ${error.message}`)
    }
  }

  // Get designation by ID
  static async findById (id) {
    const query = `
      SELECT 
        d.*,
        parent.name as parent_name,
        dept.name as department_name
      FROM designations d
      LEFT JOIN designations parent ON d.parent_id = parent.id
      LEFT JOIN departments dept ON d.department_id = dept.id
      WHERE d.id = ?
    `

    try {
      const [rows] = await pool.execute(query, [id])
      return rows.length > 0 ? new Designation(rows[0]) : null
    } catch (error) {
      throw new Error(`Error finding designation: ${error.message}`)
    }
  }

  // Get all designations
  static async findAll (options = {}) {
    const { search = '', parent_id = '', department_id = '', is_active = '' } = options

    let query = `
      SELECT 
        d.*,
        parent.name as parent_name,
        dept.name as department_name
      FROM designations d
      LEFT JOIN designations parent ON d.parent_id = parent.id
      LEFT JOIN departments dept ON d.department_id = dept.id
      WHERE 1=1
    `

    const values = []
    const conditions = []

    if (search) {
      conditions.push('(d.name LIKE ? OR d.description LIKE ? OR dept.name LIKE ?)')
      values.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (department_id !== '') {
      conditions.push('d.department_id = ?')
      values.push(department_id)
    }

    if (parent_id !== '') {
      if (parent_id === 'null') {
        conditions.push('d.parent_id IS NULL')
      } else {
        conditions.push('d.parent_id = ?')
        values.push(parent_id)
      }
    }

    if (is_active !== '') {
      conditions.push('d.is_active = ?')
      values.push(is_active === 'true' ? 1 : 0)
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ')
    }

    query += ' ORDER BY d.name ASC'

    try {
      const [rows] = await pool.execute(query, values)
      return rows.map(row => new Designation(row))
    } catch (error) {
      throw new Error(`Error finding designations: ${error.message}`)
    }
  }

  // Get designation tree structure
  static async getDesignationTree (department_id = null) {
    let query = `
      SELECT 
        d.*,
        parent.name as parent_name,
        dept.name as department_name
      FROM designations d
      LEFT JOIN designations parent ON d.parent_id = parent.id
      LEFT JOIN departments dept ON d.department_id = dept.id
      WHERE d.is_active = 1
    `

    const values = []
    if (department_id) {
      query += ' AND d.department_id = ?'
      values.push(department_id)
    }

    query += ' ORDER BY d.department_id, d.parent_id, d.name'

    try {
      const [rows] = await pool.execute(query, values)
      return this.buildTree(rows)
    } catch (error) {
      throw new Error(`Error getting designation tree: ${error.message}`)
    }
  }

  // Build tree structure
  static buildTree (designations) {
    const designationMap = new Map()
    const rootDesignations = []

    // Create designation objects
    designations.forEach(designation => {
      designationMap.set(designation.id, new Designation(designation))
    })

    // Build parent-child relationships
    designations.forEach(designation => {
      if (designation.parent_id) {
        const parent = designationMap.get(designation.parent_id)
        if (parent) {
          parent.children.push(designationMap.get(designation.id))
        }
      } else {
        rootDesignations.push(designationMap.get(designation.id))
      }
    })

    return rootDesignations
  }

  // Update designation
  static async update (id, designationData) {
    const {
      name, department_id, parent_id, description, is_active
    } = designationData

    const query = `
      UPDATE designations 
      SET name = ?, department_id = ?, parent_id = ?, description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `

    // Convert undefined values to null for MySQL compatibility
    const values = [
      name,
      department_id,
      parent_id || null,
      description || null,
      is_active,
      id
    ]

    try {
      const [result] = await pool.execute(query, values)
      return result.affectedRows > 0
    } catch (error) {
      throw new Error(`Error updating designation: ${error.message}`)
    }
  }

  // Delete designation (soft delete)
  static async delete (id) {
    const query = 'UPDATE designations SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?'

    try {
      const [result] = await pool.execute(query, [id])
      return result.affectedRows > 0
    } catch (error) {
      throw new Error(`Error deleting designation: ${error.message}`)
    }
  }

  // Get designation statistics
  static async getStatistics () {
    const query = `
      SELECT 
        COUNT(*) as total_designations,
        SUM(CASE WHEN parent_id IS NULL THEN 1 ELSE 0 END) as root_designations,
        SUM(CASE WHEN parent_id IS NOT NULL THEN 1 ELSE 0 END) as child_designations,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_designations,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_designations
      FROM designations
    `

    try {
      const [rows] = await pool.execute(query)
      return rows[0]
    } catch (error) {
      throw new Error(`Error getting designation statistics: ${error.message}`)
    }
  }

  // Get users by designation
  static async getUsersByDesignation (designation_id) {
    const query = `
      SELECT u.*, r.name as role_name, r.level as role_level
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.designation_id = ? AND u.is_active = 1 ORDER BY u.name
    `
    try {
      const [rows] = await pool.execute(query, [designation_id])
      return rows
    } catch (error) {
      throw new Error(`Error getting users by designation: ${error.message}`)
    }
  }

  // Convert to JSON
  toJSON () {
    return {
      id: this.id,
      name: this.name,
      department_id: this.department_id,
      department_name: this.department_name,
      parent_id: this.parent_id,
      parent_name: this.parent_name,
      description: this.description,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at,
      children: this.children.map(child => child.toJSON())
    }
  }
}

module.exports = Designation
