const { pool } = require('../config/database')

class Unit {
  constructor (data) {
    this.id = data.id
    this.name = data.name
    this.code = data.code
    this.description = data.description
    this.parent_id = data.parent_id
    this.is_active = data.is_active
    this.created_by = data.created_by
    this.created_at = data.created_at
    this.updated_at = data.updated_at

    // Additional fields from joins
    this.parent_name = data.parent_name
    this.creator_name = data.creator_name
    this.total_users = data.total_users || 0
    this.total_departments = data.total_departments || 0
    this.children = data.children || []
  }

  // Create a new unit
  static async create (unitData) {
    const {
      name, code, description, parent_id, created_by
    } = unitData

    const query = `
      INSERT INTO units (name, code, description, parent_id, created_by)
      VALUES (?, ?, ?, ?, ?)
    `

    // Convert undefined values to null for MySQL compatibility
    const values = [
      name,
      code,
      description || null,
      parent_id || null,
      created_by
    ]

    try {
      const [result] = await pool.execute(query, values)
      return result.insertId
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Unit code already exists')
      }
      throw new Error(`Error creating unit: ${error.message}`)
    }
  }

  // Find unit by ID with full details
  static async findById (id) {
    const query = `
      SELECT 
        u.*,
        p.name as parent_name,
        creator.name as creator_name,
        (SELECT COUNT(*) FROM users WHERE unit_id = u.id AND is_active = 1) as total_users,
        (SELECT COUNT(*) FROM departments WHERE unit_id = u.id AND is_active = 1) as total_departments
      FROM units u
      LEFT JOIN units p ON u.parent_id = p.id
      LEFT JOIN users creator ON u.created_by = creator.id
      WHERE u.id = ? AND u.is_active = 1
    `

    try {
      const [rows] = await pool.execute(query, [id])
      if (rows.length > 0) {
        return new Unit(rows[0])
      }
      return null
    } catch (error) {
      throw new Error(`Error finding unit: ${error.message}`)
    }
  }

  // Get all units with optional filtering
  static async findAll (options = {}) {
    const {
      page = 1,
      limit = 50,
      search = '',
      parent_id = null,
      include_inactive = false
    } = options

    // Ensure page and limit are valid positive integers
    const validPage = Math.max(1, parseInt(page) || 1)
    const validLimit = Math.min(Math.max(1, parseInt(limit) || 50), 1000) // Cap at 1000

    let query = `
      SELECT 
        u.*,
        p.name as parent_name,
        creator.name as creator_name,
        (SELECT COUNT(*) FROM users WHERE unit_id = u.id AND is_active = 1) as total_users,
        (SELECT COUNT(*) FROM departments WHERE unit_id = u.id AND is_active = 1) as total_departments
      FROM units u
      LEFT JOIN units p ON u.parent_id = p.id
      LEFT JOIN users creator ON u.created_by = creator.id
      WHERE ${include_inactive ? '1=1' : 'u.is_active = 1'}
    `

    const conditions = []
    const values = []

    if (search) {
      conditions.push('(u.name LIKE ? OR u.code LIKE ? OR u.description LIKE ?)')
      values.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (parent_id !== null) {
      if (parent_id === 'null' || parent_id === '') {
        conditions.push('u.parent_id IS NULL')
      } else {
        conditions.push('u.parent_id = ?')
        values.push(parent_id)
      }
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ')
    }

    query += ' ORDER BY u.name ASC'

    // Add pagination - use validated values
    const offset = (validPage - 1) * validLimit
    query += ` LIMIT ${validLimit} OFFSET ${offset}`

    try {
      const [rows] = await pool.execute(query, values)
      return rows.map(row => new Unit(row))
    } catch (error) {
      throw new Error(`Error finding units: ${error.message}`)
    }
  }

  // Get unit tree structure
  static async getUnitTree (options = {}) {
    const { include_inactive = false } = options

    try {
      const query = `
        SELECT 
          u.*,
          p.name as parent_name,
          creator.name as creator_name,
          (SELECT COUNT(*) FROM users WHERE unit_id = u.id AND is_active = 1) as total_users,
          (SELECT COUNT(*) FROM departments WHERE unit_id = u.id AND is_active = 1) as total_departments
        FROM units u
        LEFT JOIN units p ON u.parent_id = p.id
        LEFT JOIN users creator ON u.created_by = creator.id
        WHERE ${include_inactive ? '1=1' : 'u.is_active = 1'}
        ORDER BY u.name ASC
      `

      const [rows] = await pool.execute(query)
      const units = rows.map(row => new Unit(row))
      return Unit.buildTreeStructure(units)
    } catch (error) {
      throw new Error(`Error getting unit tree: ${error.message}`)
    }
  }

  // Build tree structure from flat list
  static buildTreeStructure (units) {
    const unitMap = new Map()
    const rootUnits = []

    // Create a map of all units
    units.forEach(unit => {
      unitMap.set(unit.id, { ...unit, children: [] })
    })

    // Build the tree structure
    units.forEach(unit => {
      if (unit.parent_id && unitMap.has(unit.parent_id)) {
        unitMap.get(unit.parent_id).children.push(unitMap.get(unit.id))
      } else {
        rootUnits.push(unitMap.get(unit.id))
      }
    })

    return rootUnits
  }

  // Get children of a unit
  static async getChildren (parentId) {
    const query = `
      SELECT 
        u.*,
        p.name as parent_name,
        (SELECT COUNT(*) FROM users WHERE unit_id = u.id AND is_active = 1) as total_users,
        (SELECT COUNT(*) FROM departments WHERE unit_id = u.id AND is_active = 1) as total_departments
      FROM units u
      LEFT JOIN units p ON u.parent_id = p.id
      WHERE u.parent_id = ? AND u.is_active = 1
      ORDER BY u.name ASC
    `

    try {
      const [rows] = await pool.execute(query, [parentId])
      return rows.map(row => new Unit(row))
    } catch (error) {
      throw new Error(`Error getting unit children: ${error.message}`)
    }
  }

  // Update unit
  static async update (id, updateData) {
    const allowedFields = ['name', 'code', 'description', 'parent_id', 'is_active']
    const fields = []
    const values = []

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        fields.push(`${key} = ?`)
        // Convert undefined to null for MySQL compatibility
        const value = updateData[key]
        values.push(value === undefined ? null : value)
      }
    })

    if (fields.length === 0) {
      throw new Error('No valid fields to update')
    }

    values.push(id)

    const query = `
      UPDATE units 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_active = 1
    `

    try {
      const [result] = await pool.execute(query, values)
      return result.affectedRows > 0
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Unit code already exists')
      }
      throw new Error(`Error updating unit: ${error.message}`)
    }
  }

  // Soft delete unit
  static async delete (id) {
    // Check if unit has users
    const [users] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE unit_id = ? AND is_active = 1',
      [id]
    )

    if (users[0].count > 0) {
      throw new Error('Cannot delete unit with active users. Please reassign or delete users first.')
    }

    // Check if unit has departments
    const [departments] = await pool.execute(
      'SELECT COUNT(*) as count FROM departments WHERE unit_id = ? AND is_active = 1',
      [id]
    )

    if (departments[0].count > 0) {
      throw new Error('Cannot delete unit with active departments. Please reassign or delete departments first.')
    }

    // Check if unit has child units
    const [children] = await pool.execute(
      'SELECT COUNT(*) as count FROM units WHERE parent_id = ? AND is_active = 1',
      [id]
    )

    if (children[0].count > 0) {
      throw new Error('Cannot delete unit with child units. Please delete or reassign child units first.')
    }

    const query = 'UPDATE units SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?'

    try {
      const [result] = await pool.execute(query, [id])
      return result.affectedRows > 0
    } catch (error) {
      throw new Error(`Error deleting unit: ${error.message}`)
    }
  }

  // Get unit statistics
  static async getStatistics () {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_units,
          SUM(CASE WHEN parent_id IS NULL THEN 1 ELSE 0 END) as root_units,
          SUM(CASE WHEN parent_id IS NOT NULL THEN 1 ELSE 0 END) as child_units,
          (SELECT COUNT(*) FROM users WHERE is_active = 1) as total_users,
          (SELECT COUNT(*) FROM departments WHERE is_active = 1) as total_departments
        FROM units 
        WHERE is_active = 1
      `

      const [rows] = await pool.execute(query)
      return rows[0]
    } catch (error) {
      throw new Error(`Error getting unit statistics: ${error.message}`)
    }
  }

  // Check if unit code exists
  static async codeExists (code, excludeId = null) {
    let query = 'SELECT COUNT(*) as count FROM units WHERE code = ? AND is_active = 1'
    const values = [code]

    if (excludeId) {
      query += ' AND id != ?'
      values.push(excludeId)
    }

    try {
      const [rows] = await pool.execute(query, values)
      return rows[0].count > 0
    } catch (error) {
      throw new Error(`Error checking unit code: ${error.message}`)
    }
  }

  // Convert to JSON
  toJSON () {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      description: this.description,
      parent_id: this.parent_id,
      parent_name: this.parent_name,
      is_active: this.is_active,
      created_by: this.created_by,
      creator_name: this.creator_name,
      total_users: this.total_users,
      total_departments: this.total_departments,
      created_at: this.created_at,
      updated_at: this.updated_at,
      children: this.children
    }
  }
}

module.exports = Unit
