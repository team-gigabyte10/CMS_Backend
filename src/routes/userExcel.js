const express = require('express')
const multer = require('multer')
const path = require('path')
const UserExcelController = require('../controllers/userExcelController')
const auth = require('../middleware/auth')

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../uploads')
    const fs = require('fs')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'user-upload-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
  // Accept only Excel files
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'application/vnd.ms-excel.sheet.macroEnabled.12' // .xlsm
  ]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only Excel files (.xlsx, .xls) are allowed'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only one file at a time
  }
})

// Routes

/**
 * @route POST /api/users/excel/upload
 * @desc Upload Excel file and create users in bulk
 * @access Private (Admin/Super Admin only)
 */
router.post('/upload',
  auth.authenticateToken,
  auth.authorize('Super_admin', 'Admin'),
  upload.single('excelFile'),
  UserExcelController.uploadUsersFromExcel
)

/**
 * @route GET /api/users/excel/template
 * @desc Download Excel template for user upload
 * @access Private (Admin/Super Admin only)
 */
router.get('/template',
  auth.authenticateToken,
  auth.authorize('Super_admin', 'Admin'),
  UserExcelController.getExcelTemplate
)

/**
 * @route GET /api/users/excel/lookup-values
 * @desc Get available lookup values for Excel upload
 * @access Private (Admin/Super Admin only)
 */
router.get('/lookup-values',
  auth.authenticateToken,
  auth.authorize('Super_admin', 'Admin'),
  UserExcelController.getLookupValues
)

module.exports = router
