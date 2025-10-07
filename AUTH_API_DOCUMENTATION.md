# Authentication API Documentation

## Overview
This document describes the authentication API endpoints for the CMS Backend system. The API uses JWT (JSON Web Tokens) for authentication and includes comprehensive validation and security features.

## Base URL
```
http://localhost:3000/api/auth
```

## Authentication Flow
1. **Login** - POST `/login` to get access and refresh tokens
2. **Use Access Token** - Include in Authorization header: `Bearer <token>`
3. **Refresh Token** - POST `/refresh-token` when access token expires
4. **Logout** - POST `/logout` (client-side token removal)

## API Endpoints

### 1. Login
**POST** `/api/auth/login`

Authenticate user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "role": "User",
      "rank": "Captain",
      "service_no": "12345",
      "unit": "Alpha Company",
      "branch": "Army",
      "status": "online",
      "last_seen": "2024-01-01T12:00:00.000Z",
      "created_at": "2024-01-01T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response (Error):**
```json
{
  "status": "error",
  "message": "Invalid credentials"
}
```

### 2. Register (Admin Only)
**POST** `/api/auth/register`

Register a new user (requires Admin or Super_admin role).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "service_no": "12345",
  "rank": "Captain",
  "unit": "Alpha Company",
  "branch": "Army",
  "sub_branch": "Infantry",
  "department": "Operations",
  "role": "User",
  "designation": "Company Commander",
  "phone": "1234567890",
  "mobile": "9876543210",
  "alternative_mobile": "5555555555"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 2,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "User",
      "rank": "Captain",
      "service_no": "12345",
      "unit": "Alpha Company",
      "branch": "Army",
      "is_active": 1,
      "created_at": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### 3. Refresh Token
**POST** `/api/auth/refresh-token`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4. Get Profile
**GET** `/api/auth/profile`

Get current user's profile information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "role": "User",
      "rank": "Captain",
      "service_no": "12345",
      "unit": "Alpha Company",
      "branch": "Army",
      "status": "online",
      "last_seen": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### 5. Update Profile
**PUT** `/api/auth/profile`

Update current user's profile information. Users can update their personal information including name, contact details, and organizational information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "service_no": "12345",
  "phone": "1111111111",
  "mobile": "2222222222",
  "alternative_mobile": "3333333333",
  "rank_id": 1,
  "unit_id": 2,
  "department_id": 3,
  "designation_id": 4,
  "avatar": "https://example.com/avatar.jpg"
}
```

**Validation Rules:**
- `name`: Optional, 2-100 characters
- `email`: Optional, valid email format (will check for uniqueness)
- `service_no`: Optional, 1-20 characters (will check for uniqueness)
- `phone`: Optional, max 20 characters
- `mobile`: Optional, max 20 characters
- `alternative_mobile`: Optional, max 20 characters
- `rank_id`: Optional, positive integer
- `unit_id`: Optional, positive integer
- `department_id`: Optional, positive integer
- `designation_id`: Optional, positive integer
- `avatar`: Optional, max 500 characters

**Response (Success):**
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Smith",
      "email": "john.smith@example.com",
      "service_no": "12345",
      "phone": "1111111111",
      "mobile": "2222222222",
      "alternative_mobile": "3333333333",
      "rank_id": 1,
      "rank_name": "Captain",
      "unit_id": 2,
      "unit_name": "Alpha Company",
      "unit_code": "AC",
      "department_id": 3,
      "department_name": "Operations",
      "designation_id": 4,
      "designation_name": "Team Leader",
      "avatar": "https://example.com/avatar.jpg",
      "role_id": 3,
      "role_name": "User",
      "permissions": ["read_contacts", "create_contacts"]
    }
  }
}
```

**Error Responses:**

**400 Bad Request - Validation Error:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

**409 Conflict - Email Already Exists:**
```json
{
  "status": "error",
  "message": "Email is already in use by another user"
}
```

**409 Conflict - Service Number Already Exists:**
```json
{
  "status": "error",
  "message": "Service number is already in use by another user"
}
```

### 6. Change Password
**PUT** `/api/auth/change-password`

Change current user's password. Requires current password verification for security.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "NewSecurePass123"
}
```

**Validation Rules:**
- `currentPassword`: Required, must match user's current password
- `newPassword`: Required, minimum 6 characters, must contain at least one lowercase letter, one uppercase letter, and one number
- New password must be different from current password

**Response (Success):**
```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```

**Error Responses:**

**400 Bad Request - Validation Error:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "newPassword",
      "message": "New password must contain at least one lowercase letter, one uppercase letter, and one number"
    }
  ]
}
```

**400 Bad Request - Same Password:**
```json
{
  "status": "error",
  "message": "New password must be different from current password"
}
```

**400 Bad Request - Incorrect Current Password:**
```json
{
  "status": "error",
  "message": "Current password is incorrect"
}
```

### 7. Logout
**POST** `/api/auth/logout`

Logout current user (client-side token removal).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Logout successful"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Email is required",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "status": "error",
  "message": "Insufficient permissions"
}
```

### 409 Conflict
```json
{
  "status": "error",
  "message": "User with this email already exists"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

## Security Features

1. **JWT Tokens**: Secure token-based authentication
2. **Password Hashing**: Bcrypt with 12 rounds
3. **Input Validation**: Comprehensive validation for all inputs
4. **Rate Limiting**: Prevents brute force attacks
5. **Role-based Access**: Different permission levels
6. **Token Expiration**: Configurable token lifetimes
7. **Secure Headers**: Helmet.js for security headers

## Environment Variables

Make sure to set these environment variables in your `.env` file:

```env
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
SESSION_SECRET=your_session_secret_here
```

## Testing the API

You can test the login API using curl:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Get profile (replace TOKEN with actual token)
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

## User Roles

- **Super_admin**: Full system access
- **Admin**: User management and system configuration
- **User**: Basic user access

## Password Requirements

- Minimum 6 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
