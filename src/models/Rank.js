const { pool } = require('../config/database');

class Rank {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.level = data.level;
    this.description = data.description;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new rank
  static async create(rankData) {
    const {
      name, level, description
    } = rankData;

    const query = `
      INSERT INTO ranks (name, level, description)
      VALUES (?, ?, ?)
    `;

    const values = [name, level, description];

    try {
      const [result] = await pool.execute(query, values);
      return result.insertId;
    } catch (error) {
      throw new Error(`Error creating rank: ${error.message}`);
    }
  }

  // Get rank by ID
  static async findById(id) {
    const query = `
      SELECT * FROM ranks WHERE id = ?
    `;

    try {
      const [rows] = await pool.execute(query, [id]);
      return rows.length > 0 ? new Rank(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error finding rank: ${error.message}`);
    }
  }

  // Get all ranks
  static async findAll(options = {}) {
    const { search = '', level = '', is_active = '' } = options;

    let query = `
      SELECT * FROM ranks WHERE 1=1
    `;

    const values = [];
    const conditions = [];

    if (search) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      values.push(`%${search}%`, `%${search}%`);
    }

    if (level !== '') {
      conditions.push('level = ?');
      values.push(level);
    }

    if (is_active !== '') {
      conditions.push('is_active = ?');
      values.push(is_active === 'true' ? 1 : 0);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY level ASC, name ASC';

    try {
      const [rows] = await pool.execute(query, values);
      return rows.map(row => new Rank(row));
    } catch (error) {
      throw new Error(`Error finding ranks: ${error.message}`);
    }
  }

  // Get ranks ordered by level
  static async findByLevel() {
    const query = `
      SELECT * FROM ranks 
      WHERE is_active = 1 
      ORDER BY level ASC, name ASC
    `;

    try {
      const [rows] = await pool.execute(query);
      return rows.map(row => new Rank(row));
    } catch (error) {
      throw new Error(`Error finding ranks by level: ${error.message}`);
    }
  }

  // Update rank
  static async update(id, rankData) {
    const {
      name, level, description, is_active
    } = rankData;

    const query = `
      UPDATE ranks 
      SET name = ?, level = ?, description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const values = [name, level, description, is_active, id];

    try {
      const [result] = await pool.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating rank: ${error.message}`);
    }
  }

  // Delete rank (soft delete)
  static async delete(id) {
    const query = 'UPDATE ranks SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?';

    try {
      const [result] = await pool.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting rank: ${error.message}`);
    }
  }

  // Get rank statistics
  static async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) as total_ranks,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_ranks,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_ranks,
        MIN(level) as min_level,
        MAX(level) as max_level
      FROM ranks
    `;

    try {
      const [rows] = await pool.execute(query);
      return rows[0];
    } catch (error) {
      throw new Error(`Error getting rank statistics: ${error.message}`);
    }
  }

  // Get users by rank
  static async getUsersByRank(rank_id) {
    const query = `
      SELECT u.*, r.name as role_name, r.level as role_level
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.rank_id = ? AND u.is_active = 1 ORDER BY u.name
    `;
    try {
      const [rows] = await pool.execute(query, [rank_id]);
      return rows;
    } catch (error) {
      throw new Error(`Error getting users by rank: ${error.message}`);
    }
  }

  // Check if rank name exists
  static async findByName(name, excludeId = null) {
    let query = 'SELECT * FROM ranks WHERE name = ?';
    const values = [name];

    if (excludeId) {
      query += ' AND id != ?';
      values.push(excludeId);
    }

    try {
      const [rows] = await pool.execute(query, values);
      return rows.length > 0 ? new Rank(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error checking rank name: ${error.message}`);
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      level: this.level,
      description: this.description,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Rank;
