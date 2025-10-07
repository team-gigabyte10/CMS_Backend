# User Excel Upload API Documentation

## Overview
This API allows administrators to upload user data in bulk using Excel files. The system automatically maps names to IDs for ranks, units, departments, roles, and designations, making it easy to import user data without needing to know the internal database IDs.

## Features
- ✅ Excel file validation (.xlsx, .xls formats)
- ✅ Automatic name-to-ID mapping for organizational data
- ✅ Comprehensive data validation
- ✅ Duplicate detection (service numbers and emails)
- ✅ Bulk user creation with error handling
- ✅ Excel template download
- ✅ Lookup values API for reference
- ✅ Detailed error reporting with row numbers

## API Endpoints

### 1. Upload Excel File
**POST** `/api/users/excel/upload`

Upload an Excel file containing user data for bulk creation.

#### Headers
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

#### Request Body
- `excelFile` (file): Excel file (.xlsx or .xls)

#### Required Excel Columns
| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| Name | ✅ | Full name of the user | "John Doe" |
| Service No | ✅ | Unique service number | "BN10003" |
| Rank | ✅ | Rank name (must exist in system) | "Captain" |
| Unit | ✅ | Unit name or code (must exist in system) | "Naval Headquarters" |
| Department | ❌ | Department name (optional) | "CNS" |
| Role | ✅ | Role name (must exist in system) | "User" |
| Designation | ✅ | Designation name (must exist in system) | "SO(O)" |
| Phone | ✅ | Primary phone number | "+880211111113" |
| Mobile | ❌ | Mobile number (optional) | "+8801811111113" |
| Alternative Mobile | ❌ | Alternative mobile (optional) | "+8801811111113" |
| Email | ✅ | Email address (must be unique) | "john.doe@navy.mil" |
| Password | ❌ | Password (defaults to "password123") | "password123" |

#### Response
```json
{
  "success": true,
  "message": "Excel file processed successfully",
  "data": {
    "totalRows": 10,
    "processedUsers": 8,
    "errors": [],
    "warnings": [
      {
        "row": 3,
        "warning": "Service number \"BN10001\" already exists in database",
        "data": {...}
      }
    ],
    "insertedUsers": 7,
    "skippedUsers": 1,
    "details": [
      {
        "row": 2,
        "status": "success",
        "message": "User \"John Doe\" created successfully",
        "userId": 123
      }
    ]
  }
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Error processing Excel file",
  "error": "Missing required columns: Rank, Unit"
}
```

### 2. Download Excel Template
**GET** `/api/users/excel/template`

Download a pre-formatted Excel template with sample data and proper column headers.

#### Headers
```
Authorization: Bearer <token>
```

#### Response
- Returns an Excel file (.xlsx) with sample data
- File name: `user_upload_template.xlsx`

### 3. Get Lookup Values
**GET** `/api/users/excel/lookup-values`

Get all available lookup values for ranks, units, departments, roles, and designations.

#### Headers
```
Authorization: Bearer <token>
```

#### Response
```json
{
  "success": true,
  "message": "Lookup values retrieved successfully",
  "data": {
    "ranks": [
      {"name": "General", "id": 1},
      {"name": "Lieutenant General", "id": 2},
      ...
    ],
    "units": [
      {"name": "Naval Headquarters", "id": 1},
      {"name": "Dhaka Naval Area", "id": 2},
      ...
    ],
    "departments": [
      {"name": "CNS", "id": 1},
      {"name": "NS", "id": 2},
      ...
    ],
    "roles": [
      {"name": "Super_admin", "id": 1},
      {"name": "Admin", "id": 2},
      {"name": "User", "id": 3}
    ],
    "designations": [
      {"name": "CNS", "id": 1},
      {"name": "Secy to CNS", "id": 2},
      ...
    ]
  }
}
```

## Excel File Format

### Sample Excel Content
```
| Name | Service No | Rank | Unit | Department | Role | Designation | Phone | Mobile | Alternative Mobile | Email | Password |
|------|------------|------|------|------------|------|-------------|-------|--------|-------------------|-------|----------|
| John Doe | BN10003 | Captain | Naval Headquarters | CNS | User | SO(O) | +880211111113 | +8801811111113 | +8801811111113 | john.doe@navy.mil | password123 |
| Jane Smith | BN10004 | Major | Dhaka Naval Area | Operations Division | User | SO(Plan-1) | +880211111114 | +8801811111114 | | jane.smith@navy.mil | password123 |
```

### Important Notes
1. **Case Insensitive**: All name lookups are case-insensitive
2. **Unit Matching**: Units can be matched by either name or code
3. **Department Optional**: Departments are optional but must exist if provided
4. **Password Default**: If password is not provided, defaults to "password123"
5. **Email Validation**: Email addresses must be in valid format
6. **Phone Validation**: Phone numbers must be in valid format (10+ digits)

## Validation Rules

### File Validation
- ✅ File type: Only .xlsx and .xls files allowed
- ✅ File size: Maximum 10MB
- ✅ File structure: Must contain header row and at least one data row

### Data Validation
- ✅ Required fields: Name, Service No, Rank, Unit, Role, Designation, Phone, Email
- ✅ Unique constraints: Service No and Email must be unique
- ✅ Format validation: Email and phone number formats
- ✅ Foreign key validation: All referenced names must exist in system

### Duplicate Detection
- ✅ Service numbers: Checked within Excel file and against database
- ✅ Email addresses: Checked within Excel file and against database
- ✅ Warnings: Duplicates are reported as warnings, not errors

## Error Handling

### File Errors
- `FILE_REQUIRED`: No file uploaded
- `INVALID_FILE_TYPE`: File is not an Excel file
- `FILE_TOO_LARGE`: File exceeds 10MB limit

### Data Errors
- `MISSING_COLUMNS`: Required columns are missing from Excel
- `INVALID_FORMAT`: Data format is invalid (email, phone)
- `NOT_FOUND`: Referenced name doesn't exist in system
- `DUPLICATE`: Service number or email already exists

### Row-Level Errors
Each error includes:
- `row`: Row number in Excel file
- `error`: Error message
- `data`: The problematic data

## Usage Examples

### Frontend Integration (JavaScript)
```javascript
// Upload Excel file
const uploadExcel = async (file) => {
  const formData = new FormData();
  formData.append('excelFile', file);

  try {
    const response = await fetch('/api/users/excel/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`Successfully processed ${result.data.insertedUsers} users`);
      console.log(`Errors: ${result.data.errors.length}`);
      console.log(`Warnings: ${result.data.warnings.length}`);
    } else {
      console.error('Upload failed:', result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Download template
const downloadTemplate = async () => {
  try {
    const response = await fetch('/api/users/excel/template', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_upload_template.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
  }
};

// Get lookup values
const getLookupValues = async () => {
  try {
    const response = await fetch('/api/users/excel/lookup-values', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    if (result.success) {
      console.log('Available ranks:', result.data.ranks);
      console.log('Available units:', result.data.units);
      // Use this data to populate dropdowns or validate Excel data
    }
  } catch (error) {
    console.error('Failed to get lookup values:', error);
  }
};
```

### cURL Examples
```bash
# Upload Excel file
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "excelFile=@users.xlsx" \
  http://localhost:3000/api/users/excel/upload

# Download template
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o user_template.xlsx \
  http://localhost:3000/api/users/excel/template

# Get lookup values
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/users/excel/lookup-values
```

## Security & Permissions

### Authentication
- All endpoints require valid JWT token
- Token must be included in Authorization header

### Authorization
- Only users with `Super_admin` or `Admin` roles can access these endpoints
- Regular users cannot upload Excel files

### File Security
- Uploaded files are temporarily stored and automatically deleted after processing
- File type validation prevents malicious file uploads
- File size limits prevent DoS attacks

## Troubleshooting

### Common Issues

1. **"Missing required columns" Error**
   - Ensure Excel file has all required column headers
   - Check for typos in column names
   - Download template for reference

2. **"Rank/Unit/Role not found" Error**
   - Use exact names from the lookup values API
   - Check for typos in names
   - Ensure the referenced item exists and is active

3. **"Duplicate service number/email" Warning**
   - Check if user already exists in database
   - Remove duplicates from Excel file
   - Use unique service numbers and emails

4. **"Invalid email/phone format" Error**
   - Ensure email follows standard format (user@domain.com)
   - Ensure phone has at least 10 digits
   - Check for special characters

### Best Practices

1. **Prepare Data**
   - Use the template for proper formatting
   - Validate data before uploading
   - Check lookup values for correct names

2. **Test Upload**
   - Start with small files (1-5 users)
   - Check for errors and warnings
   - Verify data in database after upload

3. **Handle Errors**
   - Review error messages carefully
   - Fix issues in Excel file
   - Re-upload corrected file

4. **Monitor Results**
   - Check inserted vs skipped counts
   - Review warnings for potential issues
   - Verify user data in system

## API Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (validation errors) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 413 | Payload Too Large (file too big) |
| 500 | Internal Server Error |

## Rate Limiting

- Excel upload endpoints are subject to rate limiting
- Default: 100 requests per 15 minutes per IP
- Large file uploads may take longer to process

## File Storage

- Uploaded files are stored temporarily in `/uploads` directory
- Files are automatically deleted after processing
- No permanent storage of uploaded Excel files
- Ensure sufficient disk space for temporary files

