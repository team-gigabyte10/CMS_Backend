const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

/**
 * Test script to demonstrate Excel upload functionality
 * This script creates a sample Excel file and shows how to use the API
 */

// Create sample data for testing
const sampleData = [
  ['Name', 'Service No', 'Rank', 'Unit', 'Department', 'Role', 'Designation', 'Phone', 'Mobile', 'Alternative Mobile', 'Email', 'Password'],
  ['Captain John Smith', 'BN10010', 'Captain', 'Naval Headquarters', 'CNS', 'User', 'SO(O)', '+880211111120', '+8801811111120', '+8801811111120', 'john.smith@navy.mil', 'password123'],
  ['Major Sarah Johnson', 'BN10011', 'Major', 'Dhaka Naval Area', 'Operations Division', 'User', 'SO(Plan-1)', '+880211111121', '+8801811111121', '', 'sarah.johnson@navy.mil', 'password123'],
  ['Lieutenant Mike Brown', 'BN10012', 'Lieutenant', 'Chittagong Naval Area', 'Engineering Division', 'User', 'SO(Tec)', '+880211111122', '+8801811111122', '+8801811111122', 'mike.brown@navy.mil', 'password123'],
  ['Commander Lisa Davis', 'BN10013', 'Commander', 'Naval Headquarters', 'NS', 'Admin', 'DDNO', '+880211111123', '+8801811111123', '', 'lisa.davis@navy.mil', 'password123'],
  ['Lieutenant Colonel Tom Wilson', 'BN10014', 'Lieutenant Colonel', 'Khulna Naval Area', 'Drafting Authority', 'User', 'DD Drafting', '+880211111124', '+8801811111124', '+8801811111124', 'tom.wilson@navy.mil', 'password123']
];

// Create Excel file
function createSampleExcelFile() {
  try {
    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(sampleData);

    // Set column widths for better readability
    const colWidths = [
      { wch: 25 }, // Name
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
      { wch: 15 }  // Password
    ];
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, 'test_files');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write file
    const filePath = path.join(outputDir, 'sample_users.xlsx');
    XLSX.writeFile(workbook, filePath);

    console.log('✅ Sample Excel file created successfully!');
    console.log(`📁 File location: ${filePath}`);
    console.log(`📊 Contains ${sampleData.length - 1} sample users`);
    
    return filePath;
  } catch (error) {
    console.error('❌ Error creating Excel file:', error.message);
    return null;
  }
}

// Display usage instructions
function displayUsageInstructions() {
  console.log('\n📋 Excel Upload API Usage Instructions:');
  console.log('=====================================\n');
  
  console.log('1. 📥 Upload Excel File:');
  console.log('   POST /api/users/excel/upload');
  console.log('   Content-Type: multipart/form-data');
  console.log('   Body: { excelFile: <file> }');
  console.log('   Headers: { Authorization: Bearer <token> }\n');
  
  console.log('2. 📄 Download Template:');
  console.log('   GET /api/users/excel/template');
  console.log('   Headers: { Authorization: Bearer <token> }\n');
  
  console.log('3. 🔍 Get Lookup Values:');
  console.log('   GET /api/users/excel/lookup-values');
  console.log('   Headers: { Authorization: Bearer <token> }\n');
  
  console.log('📝 Required Excel Columns:');
  console.log('   - Name (required)');
  console.log('   - Service No (required)');
  console.log('   - Rank (required)');
  console.log('   - Unit (required)');
  console.log('   - Department (optional)');
  console.log('   - Role (required)');
  console.log('   - Designation (required)');
  console.log('   - Phone (required)');
  console.log('   - Mobile (optional)');
  console.log('   - Alternative Mobile (optional)');
  console.log('   - Email (required)');
  console.log('   - Password (optional, defaults to "password123")\n');
  
  console.log('⚠️  Important Notes:');
  console.log('   - Only Super_admin and Admin roles can upload Excel files');
  console.log('   - Service numbers and emails must be unique');
  console.log('   - All referenced names (rank, unit, etc.) must exist in the system');
  console.log('   - File size limit: 10MB');
  console.log('   - Supported formats: .xlsx, .xls\n');
  
  console.log('🔧 Testing with cURL:');
  console.log('   # Upload file');
  console.log('   curl -X POST \\');
  console.log('     -H "Authorization: Bearer YOUR_TOKEN" \\');
  console.log('     -F "excelFile=@sample_users.xlsx" \\');
  console.log('     http://localhost:3000/api/users/excel/upload\n');
  
  console.log('   # Download template');
  console.log('   curl -X GET \\');
  console.log('     -H "Authorization: Bearer YOUR_TOKEN" \\');
  console.log('     -o template.xlsx \\');
  console.log('     http://localhost:3000/api/users/excel/template\n');
  
  console.log('   # Get lookup values');
  console.log('   curl -X GET \\');
  console.log('     -H "Authorization: Bearer YOUR_TOKEN" \\');
  console.log('     http://localhost:3000/api/users/excel/lookup-values\n');
}

// Display sample data preview
function displaySampleDataPreview() {
  console.log('\n📊 Sample Data Preview:');
  console.log('======================\n');
  
  // Display headers
  const headers = sampleData[0];
  console.log('Headers:', headers.join(' | '));
  console.log('-'.repeat(headers.join(' | ').length));
  
  // Display first few rows
  sampleData.slice(1, 4).forEach((row, index) => {
    console.log(`Row ${index + 2}:`, row.join(' | '));
  });
  
  if (sampleData.length > 4) {
    console.log(`... and ${sampleData.length - 4} more rows`);
  }
}

// Main execution
function main() {
  console.log('🚀 Excel Upload API Test Script');
  console.log('===============================\n');
  
  // Create sample Excel file
  const filePath = createSampleExcelFile();
  
  if (filePath) {
    // Display sample data preview
    displaySampleDataPreview();
    
    // Display usage instructions
    displayUsageInstructions();
    
    console.log('✅ Test script completed successfully!');
    console.log('📁 Check the "test_files" directory for the sample Excel file.');
    console.log('🔗 Use the API endpoints above to test the Excel upload functionality.');
  } else {
    console.log('❌ Test script failed. Please check the error messages above.');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  createSampleExcelFile,
  displayUsageInstructions,
  displaySampleDataPreview,
  sampleData
};

