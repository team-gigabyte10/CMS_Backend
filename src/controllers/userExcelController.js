const XLSX = require('xlsx')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const User = require('../models/User')
const Rank = require('../models/Rank')
const Unit = require('../models/Unit')
const Department = require('../models/Department')
const Role = require('../models/Role')
const Designation = require('../models/Designation')

class UserExcelController {
  /**
   * Upload and process Excel file for bulk user creation
   * Expected Excel columns:
   * - Name (required)
   * - Service No (required)
   * - Rank (required)
   * - Unit (required)
   * - Department (optional)
   * - Role (required)
   * - Designation (required)
   * - Phone (required)
   * - Mobile (optional)
   * - Alternative Mobile (optional)
   * - Email (required)
   * - Password (optional, defaults to 'password123')
   */
  static async uploadUsersFromExcel (req, res) {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No Excel file uploaded',
          error: 'FILE_REQUIRED'
        })
      }

      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'application/vnd.ms-excel.sheet.macroEnabled.12' // .xlsm
      ]

      if (!allowedTypes.includes(req.file.mimetype)) {
        // Clean up uploaded file
        fs.unlinkSync(req.file.path)
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Please upload an Excel file (.xlsx, .xls)',
          error: 'INVALID_FILE_TYPE'
        })
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (req.file.size > maxSize) {
        fs.unlinkSync(req.file.path)
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 10MB',
          error: 'FILE_TOO_LARGE'
        })
      }

      // Process the Excel file
      const result = await UserExcelController.processExcelFile(req.file.path)

      // Clean up uploaded file
      fs.unlinkSync(req.file.path)

      // Return result
      res.json({
        success: true,
        message: 'Excel file processed successfully',
        data: result
      })
    } catch (error) {
      console.error('Excel upload error:', error)

      // Clean up file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
      }

      res.status(500).json({
        success: false,
        message: 'Error processing Excel file',
        error: error.message
      })
    }
  }

  /**
   * Process Excel file and extract user data
   */
  static async processExcelFile (filePath) {
    try {
      // Read Excel file
      const workbook = XLSX.readFile(filePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: null,
        blankrows: false
      })

      if (jsonData.length < 2) {
        throw new Error('Excel file must contain at least a header row and one data row')
      }

      // Extract headers and data
      const headers = jsonData[0]
      const dataRows = jsonData.slice(1)

      // Validate headers
      const requiredHeaders = ['Name', 'Service No', 'Rank', 'Unit', 'Role', 'Designation', 'Phone', 'Email']
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header))

      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`)
      }

      // Get lookup data for mapping names to IDs
      const lookupData = await UserExcelController.getLookupData()

      // Process each row
      const processedUsers = []
      const errors = []
      const warnings = []

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i]
        const rowNumber = i + 2 // +2 because we start from row 2 (after header)

        try {
          // Skip empty rows
          if (!row || row.every(cell => !cell || cell.toString().trim() === '')) {
            continue
          }

          const userData = UserExcelController.parseUserRow(row, headers, lookupData, rowNumber)
          processedUsers.push(userData)
        } catch (error) {
          errors.push({
            row: rowNumber,
            error: error.message,
            data: row
          })
        }
      }

      // Validate processed users
      const validationResult = await UserExcelController.validateUsers(processedUsers)

      // Add validation errors to errors array
      errors.push(...validationResult.errors)
      warnings.push(...validationResult.warnings)

      // If there are critical errors, don't proceed with insertion
      if (errors.length > 0) {
        return {
          totalRows: dataRows.length,
          processedUsers: processedUsers.length,
          errors,
          warnings,
          insertedUsers: 0,
          skippedUsers: 0
        }
      }

      // Insert users into database
      const insertionResult = await UserExcelController.insertUsers(processedUsers)

      return {
        totalRows: dataRows.length,
        processedUsers: processedUsers.length,
        errors,
        warnings,
        insertedUsers: insertionResult.inserted,
        skippedUsers: insertionResult.skipped,
        details: insertionResult.details
      }
    } catch (error) {
      throw new Error(`Error processing Excel file: ${error.message}`)
    }
  }

  /**
   * Get lookup data for mapping names to IDs
   */
  static async getLookupData () {
    try {
      const [ranks, units, departments, roles, designations] = await Promise.all([
        Rank.findAll({ is_active: 'true' }),
        Unit.findAll({ include_inactive: false }),
        Department.findAll({ include_inactive: false }),
        Role.findAll(),
        Designation.findAll({ is_active: 'true' })
      ])

      return {
        ranks: ranks.reduce((acc, rank) => {
          acc[rank.name.toLowerCase()] = rank.id
          return acc
        }, {}),
        units: units.reduce((acc, unit) => {
          acc[unit.name.toLowerCase()] = unit.id
          acc[unit.code.toLowerCase()] = unit.id
          return acc
        }, {}),
        departments: departments.reduce((acc, dept) => {
          acc[dept.name.toLowerCase()] = dept.id
          return acc
        }, {}),
        roles: roles.reduce((acc, role) => {
          acc[role.name.toLowerCase()] = role.id
          return acc
        }, {}),
        designations: designations.reduce((acc, des) => {
          acc[des.name.toLowerCase()] = des.id
          return acc
        }, {})
      }
    } catch (error) {
      throw new Error(`Error getting lookup data: ${error.message}`)
    }
  }

  /**
   * Parse a single user row from Excel
   */
  static parseUserRow (row, headers, lookupData, _rowNumber) {
    const userData = {}

    // Helper function to get cell value by header name
    const getCellValue = (headerName) => {
      const index = headers.indexOf(headerName)
      return index !== -1 && row[index] ? row[index].toString().trim() : null
    }

    // Required fields
    userData.name = getCellValue('Name')
    userData.service_no = getCellValue('Service No')
    userData.phone = getCellValue('Phone')
    userData.email = getCellValue('Email')

    // Optional fields - ensure null instead of undefined
    userData.mobile = getCellValue('Mobile') || null
    userData.alternative_mobile = getCellValue('Alternative Mobile') || null
    userData.password = getCellValue('Password') || 'password123' // Default password

    // Validate required fields
    if (!userData.name) {
      throw new Error('Name is required')
    }
    if (!userData.service_no) {
      throw new Error('Service No is required')
    }
    if (!userData.phone) {
      throw new Error('Phone is required')
    }
    if (!userData.email) {
      throw new Error('Email is required')
    }

    // Map names to IDs
    const rankName = getCellValue('Rank')
    const unitName = getCellValue('Unit')
    const departmentName = getCellValue('Department')
    const roleName = getCellValue('Role')
    const designationName = getCellValue('Designation')

    if (!rankName) {
      throw new Error('Rank is required')
    }
    if (!unitName) {
      throw new Error('Unit is required')
    }
    if (!roleName) {
      throw new Error('Role is required')
    }
    if (!designationName) {
      throw new Error('Designation is required')
    }

    // Find IDs by names
    userData.rank_id = lookupData.ranks[rankName.toLowerCase()]
    userData.unit_id = lookupData.units[unitName.toLowerCase()]
    userData.role_id = lookupData.roles[roleName.toLowerCase()]
    userData.designation_id = lookupData.designations[designationName.toLowerCase()]

    // Department is optional
    if (departmentName) {
      userData.department_id = lookupData.departments[departmentName.toLowerCase()]
    } else {
      userData.department_id = null
    }

    // Parent ID is not set from Excel, so set to null
    userData.parent_id = null

    // Validate that all required IDs were found
    if (!userData.rank_id) {
      throw new Error(`Rank "${rankName}" not found in system`)
    }
    if (!userData.unit_id) {
      throw new Error(`Unit "${unitName}" not found in system`)
    }
    if (!userData.role_id) {
      throw new Error(`Role "${roleName}" not found in system`)
    }
    if (!userData.designation_id) {
      throw new Error(`Designation "${designationName}" not found in system`)
    }
    if (departmentName && !userData.department_id) {
      throw new Error(`Department "${departmentName}" not found in system`)
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      throw new Error('Invalid email format')
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/
    if (!phoneRegex.test(userData.phone)) {
      throw new Error('Invalid phone format')
    }

    return userData
  }

  /**
   * Validate users before insertion
   */
  static async validateUsers (users) {
    const errors = []
    const warnings = []

    // Check for duplicate service numbers and emails
    const serviceNumbers = new Set()
    const emails = new Set()

    for (let i = 0; i < users.length; i++) {
      const user = users[i]

      // Check for duplicates within the batch
      if (serviceNumbers.has(user.service_no)) {
        errors.push({
          row: i + 2,
          error: `Duplicate service number "${user.service_no}" in Excel file`,
          data: user
        })
      } else {
        serviceNumbers.add(user.service_no)
      }

      if (emails.has(user.email)) {
        errors.push({
          row: i + 2,
          error: `Duplicate email "${user.email}" in Excel file`,
          data: user
        })
      } else {
        emails.add(user.email)
      }

      // Check if service number or email already exists in database
      try {
        const existingByServiceNo = await User.findByServiceNo(user.service_no)
        if (existingByServiceNo) {
          warnings.push({
            row: i + 2,
            warning: `Service number "${user.service_no}" already exists in database`,
            data: user
          })
        }

        const existingByEmail = await User.findByEmail(user.email)
        if (existingByEmail) {
          warnings.push({
            row: i + 2,
            warning: `Email "${user.email}" already exists in database`,
            data: user
          })
        }
      } catch (error) {
        // Database check failed, but don't stop the process
        warnings.push({
          row: i + 2,
          warning: `Could not verify if service number or email already exists: ${error.message}`,
          data: user
        })
      }
    }

    return { errors, warnings }
  }

  /**
   * Insert users into database
   */
  static async insertUsers (users) {
    const inserted = []
    const skipped = []
    const details = []

    for (let i = 0; i < users.length; i++) {
      const userData = users[i]

      try {
        // Check if user already exists
        const existingByServiceNo = await User.findByServiceNo(userData.service_no)
        const existingByEmail = await User.findByEmail(userData.email)

        if (existingByServiceNo || existingByEmail) {
          skipped.push({
            index: i + 2,
            reason: existingByServiceNo ? 'Service number already exists' : 'Email already exists',
            data: userData
          })
          continue
        }

        // Hash password
        const saltRounds = 12
        userData.password_hash = await bcrypt.hash(userData.password, saltRounds)

        // Create user
        const userId = await User.create(userData)

        inserted.push({
          index: i + 2,
          userId,
          data: userData
        })

        details.push({
          row: i + 2,
          status: 'success',
          message: `User "${userData.name}" created successfully`,
          userId
        })
      } catch (error) {
        details.push({
          row: i + 2,
          status: 'error',
          message: error.message,
          data: userData
        })
      }
    }

    return {
      inserted: inserted.length,
      skipped: skipped.length,
      details
    }
  }

  /**
   * Get Excel template for user upload
   */
  static async getExcelTemplate (req, res) {
    try {
      // Create sample data
      const sampleData = [
        ['Name', 'Service No', 'Rank', 'Unit', 'Department', 'Role', 'Designation', 'Phone', 'Mobile', 'Alternative Mobile', 'Email', 'Password'],
        ['John Doe', 'BN10003', 'Captain', 'Naval Headquarters', 'CNS', 'User', 'SO(O)', '+880211111113', '+8801811111113', '+8801811111113', 'john.doe@navy.mil', 'password123'],
        ['Jane Smith', 'BN10004', 'Major', 'Dhaka Naval Area', 'Operations Division', 'User', 'SO(Plan-1)', '+880211111114', '+8801811111114', '', 'jane.smith@navy.mil', 'password123']
      ]

      // Create workbook
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.aoa_to_sheet(sampleData)

      // Set column widths
      const colWidths = [
        { wch: 20 }, // Name
        { wch: 15 }, // Service No
        { wch: 15 }, // Rank
        { wch: 20 }, // Unit
        { wch: 20 }, // Department
        { wch: 15 }, // Role
        { wch: 20 }, // Designation
        { wch: 15 }, // Phone
        { wch: 15 }, // Mobile
        { wch: 20 }, // Alternative Mobile
        { wch: 25 }, // Email
        { wch: 15 } // Password
      ]
      worksheet['!cols'] = colWidths

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users')

      // Generate buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

      // Set headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', 'attachment; filename="user_upload_template.xlsx"')
      res.setHeader('Content-Length', buffer.length)

      // Send file
      res.send(buffer)
    } catch (error) {
      console.error('Template generation error:', error)
      res.status(500).json({
        success: false,
        message: 'Error generating Excel template',
        error: error.message
      })
    }
  }

  /**
   * Get available lookup values for Excel upload
   */
  static async getLookupValues (req, res) {
    try {
      const lookupData = await UserExcelController.getLookupData()

      // Convert back to arrays with names
      const result = {
        ranks: Object.keys(lookupData.ranks).map(name => ({ name, id: lookupData.ranks[name] })),
        units: Object.keys(lookupData.units).map(name => ({ name, id: lookupData.units[name] })),
        departments: Object.keys(lookupData.departments).map(name => ({ name, id: lookupData.departments[name] })),
        roles: Object.keys(lookupData.roles).map(name => ({ name, id: lookupData.roles[name] })),
        designations: Object.keys(lookupData.designations).map(name => ({ name, id: lookupData.designations[name] }))
      }

      res.json({
        success: true,
        message: 'Lookup values retrieved successfully',
        data: result
      })
    } catch (error) {
      console.error('Lookup values error:', error)
      res.status(500).json({
        success: false,
        message: 'Error retrieving lookup values',
        error: error.message
      })
    }
  }
}

module.exports = UserExcelController
