const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api/auth';
const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPass123'
};

let authToken = '';

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    },
    ...(data && { data })
  };
  
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    return error.response?.data || { error: error.message };
  }
};

// Test functions
const testLogin = async () => {
  console.log('\n🔐 Testing Login...');
  const result = await makeRequest('POST', '/login', TEST_USER);
  
  if (result.status === 'success') {
    authToken = result.data.token;
    console.log('✅ Login successful');
    console.log('User:', result.data.user.name);
    console.log('Role:', result.data.user.role);
    return true;
  } else {
    console.log('❌ Login failed:', result.message);
    return false;
  }
};

const testGetProfile = async () => {
  console.log('\n👤 Testing Get Profile...');
  const result = await makeRequest('GET', '/profile');
  
  if (result.status === 'success') {
    console.log('✅ Profile retrieved successfully');
    console.log('Current Profile:', {
      name: result.data.user.name,
      email: result.data.user.email,
      service_no: result.data.user.service_no,
      phone: result.data.user.phone,
      mobile: result.data.user.mobile
    });
    return result.data.user;
  } else {
    console.log('❌ Get profile failed:', result.message);
    return null;
  }
};

const testUpdateProfile = async () => {
  console.log('\n✏️ Testing Update Profile...');
  
  const updateData = {
    name: 'Updated Test User',
    phone: '1234567890',
    mobile: '0987654321',
    alternative_mobile: '1122334455'
  };
  
  const result = await makeRequest('PUT', '/profile', updateData);
  
  if (result.status === 'success') {
    console.log('✅ Profile updated successfully');
    console.log('Updated Profile:', {
      name: result.data.user.name,
      phone: result.data.user.phone,
      mobile: result.data.user.mobile,
      alternative_mobile: result.data.user.alternative_mobile
    });
    return true;
  } else {
    console.log('❌ Profile update failed:', result.message);
    if (result.errors) {
      console.log('Validation errors:', result.errors);
    }
    return false;
  }
};

const testUpdateProfileWithEmail = async () => {
  console.log('\n📧 Testing Update Profile with Email...');
  
  const updateData = {
    email: 'updated.test@example.com'
  };
  
  const result = await makeRequest('PUT', '/profile', updateData);
  
  if (result.status === 'success') {
    console.log('✅ Email updated successfully');
    console.log('New email:', result.data.user.email);
    return true;
  } else {
    console.log('❌ Email update failed:', result.message);
    return false;
  }
};

const testUpdateProfileWithServiceNo = async () => {
  console.log('\n🔢 Testing Update Profile with Service Number...');
  
  const updateData = {
    service_no: 'TEST123'
  };
  
  const result = await makeRequest('PUT', '/profile', updateData);
  
  if (result.status === 'success') {
    console.log('✅ Service number updated successfully');
    console.log('New service number:', result.data.user.service_no);
    return true;
  } else {
    console.log('❌ Service number update failed:', result.message);
    return false;
  }
};

const testChangePassword = async () => {
  console.log('\n🔑 Testing Change Password...');
  
  const passwordData = {
    currentPassword: 'TestPass123',
    newPassword: 'NewTestPass123'
  };
  
  const result = await makeRequest('PUT', '/change-password', passwordData);
  
  if (result.status === 'success') {
    console.log('✅ Password changed successfully');
    return true;
  } else {
    console.log('❌ Password change failed:', result.message);
    if (result.errors) {
      console.log('Validation errors:', result.errors);
    }
    return false;
  }
};

const testChangePasswordWithSamePassword = async () => {
  console.log('\n🔑 Testing Change Password with Same Password...');
  
  const passwordData = {
    currentPassword: 'NewTestPass123',
    newPassword: 'NewTestPass123'
  };
  
  const result = await makeRequest('PUT', '/change-password', passwordData);
  
  if (result.status === 'error' && result.message.includes('different')) {
    console.log('✅ Correctly rejected same password');
    return true;
  } else {
    console.log('❌ Should have rejected same password');
    return false;
  }
};

const testChangePasswordWithWrongCurrent = async () => {
  console.log('\n🔑 Testing Change Password with Wrong Current Password...');
  
  const passwordData = {
    currentPassword: 'WrongPassword123',
    newPassword: 'AnotherNewPass123'
  };
  
  const result = await makeRequest('PUT', '/change-password', passwordData);
  
  if (result.status === 'error' && result.message.includes('incorrect')) {
    console.log('✅ Correctly rejected wrong current password');
    return true;
  } else {
    console.log('❌ Should have rejected wrong current password');
    return false;
  }
};

const testValidationErrors = async () => {
  console.log('\n⚠️ Testing Validation Errors...');
  
  const invalidData = {
    name: 'A', // Too short
    email: 'invalid-email', // Invalid email
    phone: '123456789012345678901', // Too long
    mobile: '123456789012345678901' // Too long
  };
  
  const result = await makeRequest('PUT', '/profile', invalidData);
  
  if (result.status === 'error' && result.errors) {
    console.log('✅ Validation errors caught correctly');
    console.log('Errors:', result.errors.map(e => `${e.path}: ${e.msg}`));
    return true;
  } else {
    console.log('❌ Should have caught validation errors');
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Profile Update API Tests\n');
  
  try {
    // Test login
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
      console.log('❌ Cannot proceed without login');
      return;
    }
    
    // Test get profile
    await testGetProfile();
    
    // Test update profile
    await testUpdateProfile();
    
    // Test update profile with email
    await testUpdateProfileWithEmail();
    
    // Test update profile with service number
    await testUpdateProfileWithServiceNo();
    
    // Test change password
    await testChangePassword();
    
    // Test change password with same password
    await testChangePasswordWithSamePassword();
    
    // Test change password with wrong current password
    await testChangePasswordWithWrongCurrent();
    
    // Test validation errors
    await testValidationErrors();
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testLogin,
  testGetProfile,
  testUpdateProfile,
  testChangePassword
};
