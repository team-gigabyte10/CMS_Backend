const Contact = require('../models/Contact');
class ContactTreeController {
    // Get comprehensive contact tree with enhanced display options
    static async getEnhancedContactTree(req, res, next) {
        try {
            const { search = '', contact_type = '', unit_id = '', branch_id = '', role_filter = '', show_hierarchy = 'true', include_inactive = 'false' } = req.query;
            const options = {
                search,
                contact_type,
                unit_id,
                branch_id
            };
            // Get contact tree
            let contactTree = await Contact.getContactTree(options);
            // Apply role filtering
            if (role_filter && role_filter !== 'all') {
                contactTree = ContactTreeController.filterTreeByRole(contactTree, role_filter);
            }
            // Apply hierarchy display options
            if (show_hierarchy === 'false') {
                contactTree = ContactTreeController.flattenTree(contactTree);
            }
            // Get enhanced statistics
            const statistics = await ContactTreeController.getEnhancedStatistics();
            // Format tree for display with additional information
            const formattedTree = ContactTreeController.formatTreeForDisplay(contactTree);
            res.status(200).json({
                status: 'success',
                message: 'Enhanced contact tree retrieved successfully',
                data: {
                    contactTree: formattedTree,
                    statistics,
                    filters: {
                        search,
                        contact_type,
                        unit_id,
                        branch_id,
                        role_filter,
                        show_hierarchy: show_hierarchy === 'true',
                        include_inactive: include_inactive === 'true'
                    }
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get contact tree for specific organizational unit
    static async getContactTreeByUnit(req, res, next) {
        try {
            const { unitId } = req.params;
            const { search = '', contact_type = '', branch_id = '', role_filter = '' } = req.query;
            const options = {
                search,
                contact_type,
                unit_id: unitId,
                branch_id
            };
            // Get contact tree for specific unit
            let contactTree = await Contact.getContactTree(options);
            // Apply role filtering
            if (role_filter && role_filter !== 'all') {
                contactTree = ContactTreeController.filterTreeByRole(contactTree, role_filter);
            }
            // Get unit-specific statistics
            const statistics = await ContactTreeController.getUnitStatistics(unitId);
            res.status(200).json({
                status: 'success',
                message: 'Unit contact tree retrieved successfully',
                data: {
                    unitId: parseInt(unitId),
                    contactTree,
                    statistics
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get contact tree for specific branch
    static async getContactTreeByBranch(req, res, next) {
        try {
            const { branchId } = req.params;
            const { search = '', contact_type = '', role_filter = '' } = req.query;
            const options = {
                search,
                contact_type,
                branch_id: branchId
            };
            // Get contact tree for specific branch
            let contactTree = await Contact.getContactTree(options);
            // Apply role filtering
            if (role_filter && role_filter !== 'all') {
                contactTree = ContactTreeController.filterTreeByRole(contactTree, role_filter);
            }
            // Get branch-specific statistics
            const statistics = await ContactTreeController.getBranchStatistics(branchId);
            res.status(200).json({
                status: 'success',
                message: 'Branch contact tree retrieved successfully',
                data: {
                    branchId: parseInt(branchId),
                    contactTree,
                    statistics
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get hierarchical structure with organizational details
    static async getHierarchicalStructure(req, res, next) {
        try {
            const { pool } = require('../config/database');
            // Get organizational hierarchy
            const [units] = await pool.execute(`
        SELECT u.*, 
               COUNT(DISTINCT b.id) as branch_count,
               COUNT(DISTINCT u_users.id) as user_count
        FROM units u
        LEFT JOIN branches b ON u.id = b.unit_id AND b.is_active = 1
        LEFT JOIN users u_users ON u.id = u_users.unit_id AND u_users.is_active = 1
        WHERE u.is_active = 1
        GROUP BY u.id
        ORDER BY u.name
      `);
            const [branches] = await pool.execute(`
        SELECT b.*, 
               u.name as unit_name,
               COUNT(DISTINCT sb.id) as sub_branch_count,
               COUNT(DISTINCT b_users.id) as user_count
        FROM branches b
        LEFT JOIN units u ON b.unit_id = u.id
        LEFT JOIN sub_branches sb ON b.id = sb.branch_id AND sb.is_active = 1
        LEFT JOIN users b_users ON b.id = b_users.branch_id AND b_users.is_active = 1
        WHERE b.is_active = 1
        GROUP BY b.id
        ORDER BY u.name, b.name
      `);
            const [subBranches] = await pool.execute(`
        SELECT sb.*, 
               b.name as branch_name,
               u.name as unit_name,
               COUNT(DISTINCT d.id) as designation_count,
               COUNT(DISTINCT sb_users.id) as user_count
        FROM sub_branches sb
        LEFT JOIN branches b ON sb.branch_id = b.id
        LEFT JOIN units u ON b.unit_id = u.id
        LEFT JOIN designations d ON sb.id = d.sub_branch_id AND d.is_active = 1
        LEFT JOIN users sb_users ON sb.id = sb_users.sub_branch_id AND sb_users.is_active = 1
        WHERE sb.is_active = 1
        GROUP BY sb.id
        ORDER BY u.name, b.name, sb.name
      `);
            res.status(200).json({
                status: 'success',
                message: 'Hierarchical structure retrieved successfully',
                data: {
                    units,
                    branches,
                    subBranches
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Search contacts across the tree
    static async searchContactsInTree(req, res, next) {
        try {
            const { q: searchTerm } = req.query;
            const { contact_type = '', unit_id = '', branch_id = '', role_filter = '', limit = 50 } = req.query;
            if (!searchTerm || searchTerm.trim().length < 2) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Search term must be at least 2 characters long'
                });
            }
            const options = {
                search: searchTerm.trim(),
                contact_type,
                unit_id,
                branch_id,
                limit: parseInt(limit)
            };
            // Search contacts
            const contacts = await Contact.search(searchTerm.trim(), options);
            // Apply role filtering
            let filteredContacts = contacts;
            if (role_filter && role_filter !== 'all') {
                filteredContacts = contacts.filter(contact => {
                    switch (role_filter) {
                        case 'admin':
                            return contact.role_id === 2;
                        case 'user':
                            return contact.role_id === 3;
                        case 'super_admin':
                            return contact.role_id === 1;
                        default:
                            return true;
                    }
                });
            }
            // Format results with hierarchy path
            const formattedResults = filteredContacts.map(contact => ({
                ...contact.toJSON(),
                hierarchy_path: ContactTreeController.getHierarchyPath(contact)
            }));
            res.status(200).json({
                status: 'success',
                message: 'Search completed successfully',
                data: {
                    contacts: formattedResults,
                    searchTerm: searchTerm.trim(),
                    total: formattedResults.length,
                    filters: {
                        contact_type,
                        unit_id,
                        branch_id,
                        role_filter
                    }
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get contact tree statistics
    static async getContactTreeStatistics(req, res, next) {
        try {
            const statistics = await ContactTreeController.getEnhancedStatistics();
            res.status(200).json({
                status: 'success',
                message: 'Contact tree statistics retrieved successfully',
                data: {
                    statistics
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Helper method to filter tree by role
    static filterTreeByRole(tree, roleFilter) {
        const filterNode = (node) => {
            // Check if current node matches role filter
            const matchesRole = roleFilter === 'all' ||
                (roleFilter === 'admin' && node.role_id === 2) ||
                (roleFilter === 'user' && node.role_id === 3) ||
                (roleFilter === 'super_admin' && node.role_id === 1);
            // Filter children recursively
            const filteredChildren = node.children
                ? node.children.map(child => filterNode(child)).filter(child => child !== null)
                : [];
            // Return node if it matches role or has matching children
            if (matchesRole || filteredChildren.length > 0) {
                return {
                    ...node,
                    children: filteredChildren
                };
            }
            return null;
        };
        return tree.map(node => filterNode(node)).filter(node => node !== null);
    }
    // Helper method to flatten tree structure
    static flattenTree(tree) {
        const flattened = [];
        const flattenNode = (node, level = 0) => {
            flattened.push({
                ...node,
                level,
                children: undefined // Remove children for flat structure
            });
            if (node.children) {
                node.children.forEach(child => flattenNode(child, level + 1));
            }
        };
        tree.forEach(node => flattenNode(node));
        return flattened;
    }
    // Helper method to format tree for display
    static formatTreeForDisplay(tree) {
        return tree.map(node => ({
            ...node.toJSON(),
            display_name: `${node.rank_name || ''} ${node.name}`.trim(),
            display_info: `${node.designation_name || ''} - ${node.service_no || ''}`.trim(),
            organizational_path: ContactTreeController.getOrganizationalPath(node),
            children: node.children ? ContactTreeController.formatTreeForDisplay(node.children) : []
        }));
    }
    // Helper method to get organizational path
    static getOrganizationalPath(contact) {
        const path = [];
        if (contact.unit_name)
            path.push(contact.unit_name);
        if (contact.branch_name)
            path.push(contact.branch_name);
        if (contact.sub_branch_name)
            path.push(contact.sub_branch_name);
        if (contact.department_name)
            path.push(contact.department_name);
        return path.join(' > ');
    }
    // Helper method to get hierarchy path
    static getHierarchyPath(contact) {
        const path = [];
        if (contact.rank_name)
            path.push(contact.rank_name);
        path.push(contact.name);
        if (contact.designation_name)
            path.push(contact.designation_name);
        return path.join(' - ');
    }
    // Helper method to get enhanced statistics
    static async getEnhancedStatistics() {
        const { pool } = require('../config/database');
        const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_contacts,
        SUM(CASE WHEN contact_type = 'internal' THEN 1 ELSE 0 END) as internal_contacts,
        SUM(CASE WHEN contact_type = 'external' THEN 1 ELSE 0 END) as external_contacts,
        SUM(CASE WHEN parent_id IS NULL THEN 1 ELSE 0 END) as root_contacts,
        SUM(CASE WHEN parent_id IS NOT NULL THEN 1 ELSE 0 END) as child_contacts,
        SUM(CASE WHEN role_id = 1 THEN 1 ELSE 0 END) as super_admins,
        SUM(CASE WHEN role_id = 2 THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role_id = 3 THEN 1 ELSE 0 END) as regular_users,
        SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as online_users,
        SUM(CASE WHEN status = 'offline' THEN 1 ELSE 0 END) as offline_users
      FROM users 
      WHERE is_active = 1
    `);
        return stats[0];
    }
    // Helper method to get unit statistics
    static async getUnitStatistics(unitId) {
        const { pool } = require('../config/database');
        const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_contacts,
        SUM(CASE WHEN role_id = 1 THEN 1 ELSE 0 END) as super_admins,
        SUM(CASE WHEN role_id = 2 THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role_id = 3 THEN 1 ELSE 0 END) as regular_users,
        SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as online_users
      FROM users 
      WHERE unit_id = ? AND is_active = 1
    `, [unitId]);
        return stats[0];
    }
    // Helper method to get branch statistics
    static async getBranchStatistics(branchId) {
        const { pool } = require('../config/database');
        const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_contacts,
        SUM(CASE WHEN role_id = 1 THEN 1 ELSE 0 END) as super_admins,
        SUM(CASE WHEN role_id = 2 THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role_id = 3 THEN 1 ELSE 0 END) as regular_users,
        SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as online_users
      FROM users 
      WHERE branch_id = ? AND is_active = 1
    `, [branchId]);
        return stats[0];
    }
}
module.exports = ContactTreeController;
//# sourceMappingURL=contactTreeController.js.map