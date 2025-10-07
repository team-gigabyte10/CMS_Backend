const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');

class ContactController {
  // Get all contacts with enhanced tree structure based on units
  static async getAllContacts(req, res, next) {
    try {
      const {
        page = 1,
        limit = 100,
        search = '',
        parent_id = null,
        unit_id = '',
        department_id = '',
        tree = 'true',
        format = 'tree', // 'tree', 'flat', 'hierarchical'
        include_inactive = 'false',
        role_filter = 'all' // 'all', 'super_admin', 'admin', 'user'
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        parent_id: parent_id === 'null' ? null : parent_id,
        unit_id,
        department_id,
        include_children: tree === 'true',
        include_inactive: include_inactive === 'true',
        role_filter
      };

      let contacts;
      let formattedContacts;

      if (tree === 'true') {
        // Get tree structure
        contacts = await Contact.getContactTree(options);
        
        // Format based on requested format
        switch (format) {
          case 'flat':
            formattedContacts = ContactController.flattenTreeStructure(contacts);
            break;
          case 'hierarchical':
            formattedContacts = ContactController.formatHierarchicalStructure(contacts);
            break;
          case 'tree':
          default:
            formattedContacts = ContactController.formatTreeStructure(contacts);
            break;
        }
      } else {
        // Get flat list
        contacts = await Contact.findAll(options);
        formattedContacts = contacts.map(contact => contact.toJSON());
      }

      // Get enhanced statistics
      const statistics = await Contact.getEnhancedStatistics(options);

      res.status(200).json({
        status: 'success',
        message: 'Contacts retrieved successfully',
        data: {
          contacts: formattedContacts,
          statistics,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: contacts.length,
            format: format
          },
          filters: {
            search,
            unit_id,
            department_id,
            tree: tree === 'true',
            include_inactive: include_inactive === 'true',
            role_filter
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Get contact by ID
  static async getContactById(req, res, next) {
    try {
      const { id } = req.params;
      const contact = await Contact.findById(id);

      if (!contact) {
        return res.status(404).json({
          status: 'error',
          message: 'Contact not found'
        });
      }

      // Get children if requested
      if (req.query.include_children === 'true') {
        const children = await Contact.getChildren(id);
        contact.children = children;
      }

      res.status(200).json({
        status: 'success',
        message: 'Contact retrieved successfully',
        data: {
          contact: contact.toJSON()
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Create new contact with enhanced tree structure support
  static async createContact(req, res, next) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const {
        name, rank_id, service_no, login_id, unit_id, department_id,
        designation_id, phone, mobile, alternative_mobile, email, parent_id,
        password_hash, role_id = 3, status = 'offline', avatar = null
      } = req.body;

      // Validate parent-child relationship
      if (parent_id) {
        const parentValidation = await ContactController.validateParentChildRelationship(
          parent_id, unit_id
        );
        
        if (!parentValidation.valid) {
          return res.status(400).json({
            status: 'error',
            message: parentValidation.message
          });
        }
      }

      // Check for duplicate service number, email, or login_id
      const duplicateCheck = await ContactController.checkForDuplicates(service_no, email, login_id);
      if (duplicateCheck.exists) {
        return res.status(400).json({
          status: 'error',
          message: duplicateCheck.message
        });
      }

      // Create contact with enhanced data following database structure
      const contactData = {
        name,
        rank_id,
        service_no,
        login_id,
        unit_id,
        department_id,
        designation_id,
        phone,
        mobile,
        alternative_mobile,
        email,
        parent_id,
        password_hash,
        role_id,
        status,
        avatar
      };

      // Set default role_id if not provided (following database structure)
      if (!contactData.role_id) {
        contactData.role_id = 3; // Default to regular user
      }

      // Validate organizational structure
      const orgValidation = await ContactController.validateOrganizationalStructure(
        contactData.unit_id, 
        contactData.department_id, 
        contactData.parent_id
      );
      
      if (!orgValidation.valid) {
        return res.status(400).json({
          status: 'error',
          message: orgValidation.message
        });
      }

      const contactId = await Contact.create(contactData);

      // Fetch created contact with full details
      const newContact = await Contact.findById(contactId);

      // Get updated tree structure for the unit
      const treeStructure = await Contact.getContactTree({ 
        unit_id: newContact.unit_id,
        format: 'tree'
      });

      // Get updated statistics
      const statistics = await Contact.getEnhancedStatistics({ 
        unit_id: newContact.unit_id 
      });

      res.status(201).json({
        status: 'success',
        message: 'Contact created successfully',
        data: {
          contact: newContact.toJSON(),
          tree_structure: ContactController.formatTreeStructure(treeStructure),
          statistics,
          parent_info: parent_id ? await Contact.findById(parent_id) : null
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Update contact with enhanced tree structure support
  static async updateContact(req, res, next) {
    try {
      const { id } = req.params;
      const contact = await Contact.findById(id);

      if (!contact) {
        return res.status(404).json({
          status: 'error',
          message: 'Contact not found'
        });
      }

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const updateData = req.body;
      const originalParentId = contact.parent_id;

      // Validate parent-child relationship if parent_id is being updated
      if (updateData.parent_id !== undefined) {
        if (updateData.parent_id) {
          // Check for self-reference
          if (updateData.parent_id == id) {
            return res.status(400).json({
              status: 'error',
              message: 'Contact cannot be its own parent'
            });
          }

          // Check for circular reference
          const circularCheck = await ContactController.checkCircularReference(id, updateData.parent_id);
          if (circularCheck.hasCircularReference) {
            return res.status(400).json({
              status: 'error',
              message: circularCheck.message
            });
          }

          // Validate parent-child relationship
          const parentValidation = await ContactController.validateParentChildRelationship(
            updateData.parent_id, 
            updateData.unit_id || contact.unit_id
          );
          
          if (!parentValidation.valid) {
            return res.status(400).json({
              status: 'error',
              message: parentValidation.message
            });
          }
        }
      }

      // Check for duplicate service number or email if being updated
      if (updateData.service_no || updateData.email) {
        const duplicateCheck = await ContactController.checkForDuplicatesOnUpdate(
          id, 
          updateData.service_no || contact.service_no, 
          updateData.email || contact.email,
          updateData.login_id || contact.login_id
        );
        if (duplicateCheck.exists) {
          return res.status(400).json({
            status: 'error',
            message: duplicateCheck.message
          });
        }
      }

      // Update contact
      const updated = await contact.update(updateData);

      if (!updated) {
        return res.status(400).json({
          status: 'error',
          message: 'Failed to update contact'
        });
      }

      // Fetch updated contact with full details
      const updatedContact = await Contact.findById(id);

      // Get updated tree structure for the unit
      const treeStructure = await Contact.getContactTree({ 
        unit_id: updatedContact.unit_id,
        format: 'tree'
      });

      // Get updated statistics
      const statistics = await Contact.getEnhancedStatistics({ 
        unit_id: updatedContact.unit_id 
      });

      // Check if parent changed and get affected tree structures
      const parentChanged = originalParentId !== updatedContact.parent_id;
      let affectedTrees = {};

      if (parentChanged) {
        // Get tree structure for original parent's unit if different
        if (originalParentId) {
          const originalParent = await Contact.findById(originalParentId);
          if (originalParent && originalParent.unit_id !== updatedContact.unit_id) {
            affectedTrees.original_unit_tree = await Contact.getContactTree({ 
              unit_id: originalParent.unit_id,
              format: 'tree'
            });
          }
        }

        // Get tree structure for new parent's unit if different
        if (updatedContact.parent_id) {
          const newParent = await Contact.findById(updatedContact.parent_id);
          if (newParent && newParent.unit_id !== updatedContact.unit_id) {
            affectedTrees.new_unit_tree = await Contact.getContactTree({ 
              unit_id: newParent.unit_id,
              format: 'tree'
            });
          }
        }
      }

      res.status(200).json({
        status: 'success',
        message: 'Contact updated successfully',
        data: {
          contact: updatedContact.toJSON(),
          tree_structure: ContactController.formatTreeStructure(treeStructure),
          statistics,
          parent_info: updatedContact.parent_id ? await Contact.findById(updatedContact.parent_id) : null,
          parent_changed: parentChanged,
          affected_trees: Object.keys(affectedTrees).length > 0 ? affectedTrees : null
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Delete contact
  static async deleteContact(req, res, next) {
    try {
      const { id } = req.params;
      const contact = await Contact.findById(id);

      if (!contact) {
        return res.status(404).json({
          status: 'error',
          message: 'Contact not found'
        });
      }

      // Check if contact has children
      const children = await Contact.getChildren(id);
      if (children.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot delete contact with children. Please delete children first or reassign them.'
        });
      }

      // Soft delete contact
      const deleted = await contact.delete();

      if (!deleted) {
        return res.status(400).json({
          status: 'error',
          message: 'Failed to delete contact'
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Contact deleted successfully'
      });

    } catch (error) {
      next(error);
    }
  }

  // Get contact children
  static async getContactChildren(req, res, next) {
    try {
      const { id } = req.params;
      const contact = await Contact.findById(id);

      if (!contact) {
        return res.status(404).json({
          status: 'error',
          message: 'Contact not found'
        });
      }

      const children = await Contact.getChildren(id);

      res.status(200).json({
        status: 'success',
        message: 'Contact children retrieved successfully',
        data: {
          parent: contact.toJSON(),
          children: children.map(child => child.toJSON())
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Get full hierarchy path for a contact
  static async getContactHierarchy(req, res, next) {
    try {
      const { id } = req.params;
      const contact = await Contact.findById(id);

      if (!contact) {
        return res.status(404).json({
          status: 'error',
          message: 'Contact not found'
        });
      }

      // Build hierarchy path from root to current contact
      const hierarchyPath = await ContactController.buildHierarchyPath(id);

      res.status(200).json({
        status: 'success',
        message: 'Contact hierarchy retrieved successfully',
        data: {
          contact: contact.toJSON(),
          hierarchy_path: hierarchyPath,
          hierarchy_depth: hierarchyPath.length,
          organizational_info: {
            unit_name: contact.unit_name,
            unit_code: contact.unit_code,
            department_name: contact.department_name,
            designation_name: contact.designation_name,
            rank_name: contact.rank_name
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Search contacts
  static async searchContacts(req, res, next) {
    try {
      const { q: searchTerm, unit_id = '', department_id = '', limit = 20 } = req.query;

      if (!searchTerm || searchTerm.trim().length < 2) {
        return res.status(400).json({
          status: 'error',
          message: 'Search term must be at least 2 characters long'
        });
      }

      const contacts = await Contact.search(searchTerm.trim(), {
        unit_id,
        department_id,
        limit: parseInt(limit)
      });

      res.status(200).json({
        status: 'success',
        message: 'Search completed successfully',
        data: {
          contacts: contacts.map(contact => contact.toJSON()),
          searchTerm: searchTerm.trim(),
          filters: {
            unit_id,
            department_id
          },
          total: contacts.length
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Get contact statistics
  static async getContactStatistics(req, res, next) {
    try {
      const statistics = await Contact.getStatistics();

      res.status(200).json({
        status: 'success',
        message: 'Contact statistics retrieved successfully',
        data: {
          statistics
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Bulk operations
  static async bulkDeleteContacts(req, res, next) {
    try {
      const { contactIds } = req.body;

      if (!Array.isArray(contactIds) || contactIds.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Contact IDs array is required'
        });
      }

      const results = [];
      const errors = [];

      for (const id of contactIds) {
        try {
          const contact = await Contact.findById(id);
          if (!contact) {
            errors.push({ id, error: 'Contact not found' });
            continue;
          }

          // Check if contact has children
          const children = await Contact.getChildren(id);
          if (children.length > 0) {
            errors.push({ id, error: 'Contact has children' });
            continue;
          }

          const deleted = await contact.delete();
          if (deleted) {
            results.push({ id, status: 'deleted' });
          } else {
            errors.push({ id, error: 'Failed to delete' });
          }
        } catch (error) {
          errors.push({ id, error: error.message });
        }
      }

      res.status(200).json({
        status: 'success',
        message: 'Bulk delete operation completed',
        data: {
          deleted: results,
          errors: errors,
          summary: {
            total: contactIds.length,
            deleted: results.length,
            errors: errors.length
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Move contact to different parent
  static async moveContact(req, res, next) {
    try {
      const { id } = req.params;
      const { parent_id } = req.body;

      const contact = await Contact.findById(id);
      if (!contact) {
        return res.status(404).json({
          status: 'error',
          message: 'Contact not found'
        });
      }

      // Check if new parent exists (if parent_id is provided)
      if (parent_id) {
        const parentContact = await Contact.findById(parent_id);
        if (!parentContact) {
          return res.status(400).json({
            status: 'error',
            message: 'Parent contact not found'
          });
        }

        // Prevent self-reference
        if (parent_id == id) {
          return res.status(400).json({
            status: 'error',
            message: 'Contact cannot be its own parent'
          });
        }
      }

      // Update parent
      const updated = await contact.update({ parent_id });

      if (!updated) {
        return res.status(400).json({
          status: 'error',
          message: 'Failed to move contact'
        });
      }

      // Fetch updated contact
      const updatedContact = await Contact.findById(id);

      res.status(200).json({
        status: 'success',
        message: 'Contact moved successfully',
        data: {
          contact: updatedContact.toJSON()
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Get contact tree by unit with enhanced filtering
  static async getContactTreeByUnit(req, res, next) {
    try {
      const { unitId } = req.params;
      const {
        search = '',
        department_id = '',
        format = 'tree',
        include_inactive = 'false',
        role_filter = 'all'
      } = req.query;

      const options = {
        search,
        unit_id: unitId,
        department_id,
        include_inactive: include_inactive === 'true',
        role_filter
      };

      // Get contact tree for specific unit
      let contactTree = await Contact.getContactTree(options);

      // Format based on requested format
      let formattedContacts;
      switch (format) {
        case 'flat':
          formattedContacts = ContactController.flattenTreeStructure(contactTree);
          break;
        case 'hierarchical':
          formattedContacts = ContactController.formatHierarchicalStructure(contactTree);
          break;
        case 'tree':
        default:
          formattedContacts = ContactController.formatTreeStructure(contactTree);
          break;
      }

      // Get unit-specific statistics
      const statistics = await Contact.getEnhancedStatistics(options);

      res.status(200).json({
        status: 'success',
        message: 'Unit contact tree retrieved successfully',
        data: {
          unit_id: parseInt(unitId),
          contacts: formattedContacts,
          statistics,
          filters: {
            search,
            department_id,
            format,
            include_inactive: include_inactive === 'true',
            role_filter
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Get contact tree by department
  static async getContactTreeByDepartment(req, res, next) {
    try {
      const { departmentId } = req.params;
      const {
        search = '',
        format = 'tree',
        include_inactive = 'false',
        role_filter = 'all'
      } = req.query;

      const options = {
        search,
        department_id: departmentId,
        include_inactive: include_inactive === 'true',
        role_filter
      };

      // Get contact tree for specific department
      let contactTree = await Contact.getContactTree(options);

      // Format based on requested format
      let formattedContacts;
      switch (format) {
        case 'flat':
          formattedContacts = ContactController.flattenTreeStructure(contactTree);
          break;
        case 'hierarchical':
          formattedContacts = ContactController.formatHierarchicalStructure(contactTree);
          break;
        case 'tree':
        default:
          formattedContacts = ContactController.formatTreeStructure(contactTree);
          break;
      }

      // Get department-specific statistics
      const statistics = await Contact.getEnhancedStatistics(options);

      res.status(200).json({
        status: 'success',
        message: 'Department contact tree retrieved successfully',
        data: {
          department_id: parseInt(departmentId),
          contacts: formattedContacts,
          statistics,
          filters: {
            search,
            format,
            include_inactive: include_inactive === 'true',
            role_filter
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Get contact tree by department (replaces branch)
  static async getContactTreeByBranch(req, res, next) {
    try {
      const { branchId } = req.params;
      const {
        search = '',
        format = 'tree',
        include_inactive = 'false',
        role_filter = 'all'
      } = req.query;

      const options = {
        search,
        department_id: branchId, // Using department_id for backward compatibility
        unit_id: branchId, // Since branches don't exist, we'll use unit_id instead
        include_inactive: include_inactive === 'true',
        role_filter
      };

      // Get contact tree for specific branch
      let contactTree = await Contact.getContactTree(options);

      // Format based on requested format
      let formattedContacts;
      switch (format) {
        case 'flat':
          formattedContacts = ContactController.flattenTreeStructure(contactTree);
          break;
        case 'hierarchical':
          formattedContacts = ContactController.formatHierarchicalStructure(contactTree);
          break;
        case 'tree':
        default:
          formattedContacts = ContactController.formatTreeStructure(contactTree);
          break;
      }

      // Get branch-specific statistics
      const statistics = await Contact.getEnhancedStatistics(options);

      res.status(200).json({
        status: 'success',
        message: 'Department contact tree retrieved successfully',
        data: {
          department_id: parseInt(branchId),
          contacts: formattedContacts,
          statistics,
          filters: {
            search,
            format,
            include_inactive: include_inactive === 'true',
            role_filter
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Get hierarchical organizational structure
  static async getOrganizationalHierarchy(req, res, next) {
    try {
      const { pool } = require('../config/database');

      // Get organizational hierarchy with user counts
      const [units] = await pool.execute(`
        SELECT u.*, 
               COUNT(DISTINCT u_users.id) as user_count
        FROM units u
        LEFT JOIN users u_users ON u.id = u_users.unit_id AND u_users.is_active = 1
        WHERE u.is_active = 1
        GROUP BY u.id
        ORDER BY u.name
      `);

      res.status(200).json({
        status: 'success',
        message: 'Organizational hierarchy retrieved successfully',
        data: {
          units
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Bulk move contacts to different parent
  static async bulkMoveContacts(req, res, next) {
    try {
      const { contactIds, parent_id } = req.body;

      if (!Array.isArray(contactIds) || contactIds.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Contact IDs array is required'
        });
      }

      // Validate parent if provided
      if (parent_id) {
        const parentContact = await Contact.findById(parent_id);
        if (!parentContact) {
          return res.status(400).json({
            status: 'error',
            message: 'Parent contact not found'
          });
        }
      }

      const results = [];
      const errors = [];

      for (const id of contactIds) {
        try {
          const contact = await Contact.findById(id);
          if (!contact) {
            errors.push({ id, error: 'Contact not found' });
            continue;
          }

          // Check for circular reference
          if (parent_id) {
            const circularCheck = await ContactController.checkCircularReference(id, parent_id);
            if (circularCheck.hasCircularReference) {
              errors.push({ id, error: circularCheck.message });
              continue;
            }
          }

          // Validate parent-child relationship
          if (parent_id) {
            const parentValidation = await ContactController.validateParentChildRelationship(
              parent_id,
              contact.unit_id
            );
            
            if (!parentValidation.valid) {
              errors.push({ id, error: parentValidation.message });
              continue;
            }
          }

          const updated = await contact.update({ parent_id });
          if (updated) {
            results.push({ id, status: 'moved', new_parent_id: parent_id });
          } else {
            errors.push({ id, error: 'Failed to move contact' });
          }
        } catch (error) {
          errors.push({ id, error: error.message });
        }
      }

      res.status(200).json({
        status: 'success',
        message: 'Bulk move operation completed',
        data: {
          moved: results,
          errors: errors,
          summary: {
            total: contactIds.length,
            moved: results.length,
            errors: errors.length
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Helper method to flatten tree structure
  static flattenTreeStructure(tree, level = 0) {
    const flattened = [];
    
    const flattenNode = (node) => {
      const nodeData = typeof node.toJSON === 'function' ? node.toJSON() : node;
      flattened.push({
        ...nodeData,
        level,
        has_children: node.children && node.children.length > 0,
        children_count: node.children ? node.children.length : 0,
        hierarchy_path: ContactController.getHierarchyPath(node),
        organizational_path: ContactController.getOrganizationalPath(node)
      });
      
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => flattenNode(child, level + 1));
      }
    };

    tree.forEach(node => flattenNode(node));
    return flattened;
  }

  // Helper method to format tree structure
  static formatTreeStructure(tree) {
    return tree.map(node => {
      const nodeData = typeof node.toJSON === 'function' ? node.toJSON() : node;
      return {
        ...nodeData,
        display_name: `${node.rank_name || ''} ${node.name}`.trim(),
        display_info: `${node.designation_name || ''} - ${node.service_no || ''}`.trim(),
        organizational_path: ContactController.getOrganizationalPath(node),
        hierarchy_path: ContactController.getHierarchyPath(node),
        has_children: node.children && node.children.length > 0,
        children_count: node.children ? node.children.length : 0,
        children: node.children ? ContactController.formatTreeStructure(node.children) : []
      };
    });
  }

  // Helper method to format hierarchical structure
  static formatHierarchicalStructure(tree) {
    return tree.map(node => {
      const nodeData = typeof node.toJSON === 'function' ? node.toJSON() : node;
      return {
        ...nodeData,
        display_name: `${node.rank_name || ''} ${node.name}`.trim(),
        display_info: `${node.designation_name || ''} - ${node.service_no || ''}`.trim(),
        organizational_path: ContactController.getOrganizationalPath(node),
        hierarchy_path: ContactController.getHierarchyPath(node),
        level: 0,
        has_children: node.children && node.children.length > 0,
        children_count: node.children ? node.children.length : 0,
        children: node.children ? ContactController.formatHierarchicalStructure(node.children, 1) : []
      };
    });
  }

  // Helper method to get organizational path
  static getOrganizationalPath(contact) {
    const path = [];
    if (contact.unit_name) path.push(contact.unit_name);
    return path.join(' > ');
  }

  // Helper method to get hierarchy path
  static getHierarchyPath(contact) {
    const path = [];
    if (contact.rank_name) path.push(contact.rank_name);
    path.push(contact.name);
    if (contact.designation_name) path.push(contact.designation_name);
    return path.join(' - ');
  }

  // Helper method to validate parent-child relationship
  static async validateParentChildRelationship(parentId, unitId) {
    try {
      const parent = await Contact.findById(parentId);
      
      if (!parent) {
        return { valid: false, message: 'Parent contact not found' };
      }

      // Check if parent is in the same organizational structure
      if (parent.unit_id !== unitId) {
        return { valid: false, message: 'Parent must be in the same unit' };
      }

      return { valid: true, message: 'Parent-child relationship is valid' };
    } catch (error) {
      return { valid: false, message: 'Error validating parent-child relationship' };
    }
  }

  // Helper method to check for duplicates
  static async checkForDuplicates(serviceNo, email, loginId) {
    try {
      const { pool } = require('../config/database');
      
      // Check for duplicate service number
      const [serviceNoRows] = await pool.execute(
        'SELECT id FROM users WHERE service_no = ? AND is_active = 1',
        [serviceNo]
      );

      if (serviceNoRows.length > 0) {
        return { exists: true, message: 'Service number already exists' };
      }

      // Check for duplicate email
      const [emailRows] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND is_active = 1',
        [email]
      );

      if (emailRows.length > 0) {
        return { exists: true, message: 'Email already exists' };
      }

      // Check for duplicate login_id
      const [loginIdRows] = await pool.execute(
        'SELECT id FROM users WHERE login_id = ? AND is_active = 1',
        [loginId]
      );

      if (loginIdRows.length > 0) {
        return { exists: true, message: 'Login ID already exists' };
      }

      return { exists: false, message: 'No duplicates found' };
    } catch (error) {
      return { exists: true, message: 'Error checking for duplicates' };
    }
  }

  // Helper method to check for duplicates on update (excluding current contact)
  static async checkForDuplicatesOnUpdate(contactId, serviceNo, email, loginId = null) {
    try {
      const { pool } = require('../config/database');
      
      // Check for duplicate service number
      const [serviceNoRows] = await pool.execute(
        'SELECT id FROM users WHERE service_no = ? AND is_active = 1 AND id != ?',
        [serviceNo, contactId]
      );

      if (serviceNoRows.length > 0) {
        return { exists: true, message: 'Service number already exists' };
      }

      // Check for duplicate email
      const [emailRows] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND is_active = 1 AND id != ?',
        [email, contactId]
      );

      if (emailRows.length > 0) {
        return { exists: true, message: 'Email already exists' };
      }

      // Check for duplicate login_id (if provided)
      if (loginId) {
        const [loginIdRows] = await pool.execute(
          'SELECT id FROM users WHERE login_id = ? AND is_active = 1 AND id != ?',
          [loginId, contactId]
        );

        if (loginIdRows.length > 0) {
          return { exists: true, message: 'Login ID already exists' };
        }
      }

      return { exists: false, message: 'No duplicates found' };
    } catch (error) {
      return { exists: true, message: 'Error checking for duplicates' };
    }
  }

  // Helper method to check for circular reference
  static async checkCircularReference(contactId, parentId) {
    try {
      const { pool } = require('../config/database');
      
      // Check if the potential parent is a descendant of the contact being updated
      const checkQuery = `
        WITH RECURSIVE descendant_tree AS (
          SELECT id, parent_id, 1 as level
          FROM users 
          WHERE id = ?
          AND is_active = 1
          
          UNION ALL
          
          SELECT u.id, u.parent_id, dt.level + 1
          FROM users u
          INNER JOIN descendant_tree dt ON u.parent_id = dt.id
          WHERE u.is_active = 1
          AND dt.level < 10 -- Prevent infinite recursion
        )
        SELECT id FROM descendant_tree WHERE id = ?
      `;

      const [rows] = await pool.execute(checkQuery, [contactId, parentId]);

      if (rows.length > 0) {
        return { 
          hasCircularReference: true, 
          message: 'Cannot set parent as it would create a circular reference' 
        };
      }

      return { hasCircularReference: false, message: 'No circular reference detected' };
    } catch (error) {
      return { hasCircularReference: true, message: 'Error checking for circular reference' };
    }
  }

  // Helper method to build hierarchy path
  static async buildHierarchyPath(contactId) {
    try {
      const { pool } = require('../config/database');
      
      // Get the full hierarchy path from root to the contact
      const hierarchyQuery = `
        WITH RECURSIVE hierarchy_path AS (
          SELECT id, parent_id, name, rank_name, designation_name, 0 as level
          FROM users 
          WHERE id = ?
          AND is_active = 1
          
          UNION ALL
          
          SELECT u.id, u.parent_id, u.name, u.rank_name, u.designation_name, hp.level + 1
          FROM users u
          INNER JOIN hierarchy_path hp ON u.id = hp.parent_id
          WHERE u.is_active = 1
          AND hp.level < 10 -- Prevent infinite recursion
        )
        SELECT id, parent_id, name, rank_name, designation_name, level
        FROM hierarchy_path
        ORDER BY level DESC
      `;

      const [rows] = await pool.execute(hierarchyQuery, [contactId]);
      
      return rows.map(row => ({
        id: row.id,
        name: row.name,
        rank_name: row.rank_name,
        designation_name: row.designation_name,
        level: row.level,
        display_name: `${row.rank_name || ''} ${row.name}`.trim(),
        hierarchy_position: row.level === 0 ? 'current' : 'ancestor'
      }));
    } catch (error) {
      throw new Error(`Error building hierarchy path: ${error.message}`);
    }
  }

  // Helper method to validate organizational structure
  static async validateOrganizationalStructure(unitId, departmentId, parentId) {
    try {
      const { pool } = require('../config/database');
      
      // Validate unit exists and is active
      const [unitRows] = await pool.execute(
        'SELECT id, name FROM units WHERE id = ? AND is_active = 1',
        [unitId]
      );
      
      if (unitRows.length === 0) {
        return { valid: false, message: 'Invalid unit ID or unit is inactive' };
      }

      // Validate department exists and belongs to the unit (if department is provided)
      if (departmentId) {
        const [deptRows] = await pool.execute(
          'SELECT id, name, unit_id FROM departments WHERE id = ? AND is_active = 1',
          [departmentId]
        );
        
        if (deptRows.length === 0) {
          return { valid: false, message: 'Invalid department ID or department is inactive' };
        }
        
        if (deptRows[0].unit_id !== unitId) {
          return { valid: false, message: 'Department does not belong to the specified unit' };
        }
      }

      // Validate parent exists and belongs to the same unit (if parent is provided)
      if (parentId) {
        const [parentRows] = await pool.execute(
          'SELECT id, name, unit_id, department_id FROM users WHERE id = ? AND is_active = 1',
          [parentId]
        );
        
        if (parentRows.length === 0) {
          return { valid: false, message: 'Invalid parent ID or parent is inactive' };
        }
        
        if (parentRows[0].unit_id !== unitId) {
          return { valid: false, message: 'Parent must belong to the same unit' };
        }
      }

      return { valid: true, message: 'Organizational structure is valid' };
    } catch (error) {
      return { valid: false, message: 'Error validating organizational structure' };
    }
  }
}

module.exports = ContactController;
