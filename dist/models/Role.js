const { pool } = require('../config/database');
class Role {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.level = data.level;
        this.is_active = data.is_active;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }
    // Get all active roles
    static async findAll() {
        const query = 'SELECT * FROM roles WHERE is_active = 1 ORDER BY level DESC';
        try {
            const [rows] = await pool.execute(query);
            return rows.map(row => new Role(row));
        }
        catch (error) {
            throw new Error(`Error finding roles: ${error.message}`);
        }
    }
    // Find role by ID
    static async findById(id) {
        const query = 'SELECT * FROM roles WHERE id = ? AND is_active = 1';
        try {
            const [rows] = await pool.execute(query, [id]);
            return rows.length > 0 ? new Role(rows[0]) : null;
        }
        catch (error) {
            throw new Error(`Error finding role by ID: ${error.message}`);
        }
    }
    // Find role by name
    static async findByName(name) {
        const query = 'SELECT * FROM roles WHERE name = ? AND is_active = 1';
        try {
            const [rows] = await pool.execute(query, [name]);
            return rows.length > 0 ? new Role(rows[0]) : null;
        }
        catch (error) {
            throw new Error(`Error finding role by name: ${error.message}`);
        }
    }
    // Get role with permissions
    static async getRoleWithPermissions(roleId) {
        const query = `
      SELECT 
        r.*,
        GROUP_CONCAT(p.name) as permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id AND p.is_active = 1
      WHERE r.id = ? AND r.is_active = 1
      GROUP BY r.id
    `;
        try {
            const [rows] = await pool.execute(query, [roleId]);
            if (rows.length > 0) {
                const role = new Role(rows[0]);
                role.permissions = rows[0].permissions ? rows[0].permissions.split(',') : [];
                return role;
            }
            return null;
        }
        catch (error) {
            throw new Error(`Error getting role with permissions: ${error.message}`);
        }
    }
    // Get user permissions (role permissions + direct user permissions)
    static async getUserPermissions(userId) {
        const query = `
      SELECT DISTINCT p.name, p.description, p.resource, p.action
      FROM permissions p
      WHERE p.is_active = 1
      AND (
        p.id IN (
          SELECT rp.permission_id 
          FROM role_permissions rp
          JOIN users u ON u.role_id = rp.role_id
          WHERE u.id = ?
        )
        OR p.id IN (
          SELECT up.permission_id 
          FROM user_permissions up
          WHERE up.user_id = ?
        )
      )
      ORDER BY p.resource, p.action
    `;
        try {
            const [rows] = await pool.execute(query, [userId, userId]);
            return rows;
        }
        catch (error) {
            throw new Error(`Error getting user permissions: ${error.message}`);
        }
    }
    // Check if user has permission
    static async userHasPermission(userId, permissionName) {
        const query = `
      SELECT COUNT(*) as count
      FROM permissions p
      WHERE p.name = ? AND p.is_active = 1
      AND (
        p.id IN (
          SELECT rp.permission_id 
          FROM role_permissions rp
          JOIN users u ON u.role_id = rp.role_id
          WHERE u.id = ?
        )
        OR p.id IN (
          SELECT up.permission_id 
          FROM user_permissions up
          WHERE up.user_id = ?
        )
      )
    `;
        try {
            const [rows] = await pool.execute(query, [permissionName, userId, userId]);
            return rows[0].count > 0;
        }
        catch (error) {
            throw new Error(`Error checking user permission: ${error.message}`);
        }
    }
    // Check if user has role
    static async userHasRole(userId, roleName) {
        const query = `
      SELECT COUNT(*) as count
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ? AND r.name = ? AND r.is_active = 1
    `;
        try {
            const [rows] = await pool.execute(query, [userId, roleName]);
            return rows[0].count > 0;
        }
        catch (error) {
            throw new Error(`Error checking user role: ${error.message}`);
        }
    }
    // Convert to JSON
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            level: this.level,
            is_active: this.is_active,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}
module.exports = Role;
//# sourceMappingURL=Role.js.map