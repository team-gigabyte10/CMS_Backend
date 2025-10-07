# Dashboard API Documentation

## Overview
The Dashboard API provides comprehensive statistics and analytics for the CMS Backend system. It includes data for Total Contacts, Active Conversations, Online Contacts, and Security Alerts with role-based access control.

## Base URL
```
http://localhost:3000/api/dashboard
```

## Authentication
All dashboard endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### 1. Get Dashboard Statistics
**GET** `/api/dashboard/stats`

Returns comprehensive dashboard statistics including total contacts, active conversations, online contacts, and security alerts.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "totalContacts": {
      "total_contacts": 1,
      "active_contacts": 1,
      "inactive_contacts": 0,
      "new_contacts_30d": 1,
      "new_contacts_7d": 1
    },
    "activeConversations": {
      "total_conversations": 0,
      "active_24h": 0,
      "active_7d": 0,
      "direct_conversations": 0,
      "group_conversations": 0
    },
    "onlineContacts": {
      "online_now": 1,
      "busy_now": 0,
      "offline_now": 0,
      "recently_active": 0,
      "active_1h": 0,
      "active_24h": 1
    },
    "securityAlerts": {
      "failed_logins_24h": 0,
      "failed_logins_7d": 0,
      "password_changes_7d": 0,
      "deletions_7d": 0,
      "admin_actions_7d": 0,
      "total_activities_1h": 0,
      "total_activities_24h": 1
    },
    "recentActivity": [
      {
        "action": "USER_UPDATED",
        "target_type": "user",
        "target_name": "System Administrator",
        "details": "email from \"admin@navy.mil.bd\" to \"admin@gmail.com\";",
        "created_at": "2025-09-28T09:46:59.000Z",
        "user_name": "System Administrator",
        "user_rank": "Admiral"
      }
    ],
    "conversationStats": {
      "total_messages_24h": 0,
      "unique_senders_24h": 0,
      "active_conversations_24h": 0,
      "text_messages_24h": 0,
      "system_messages_24h": 0
    },
    "userStats": {
      "super_admins": 1,
      "admins": 0,
      "regular_users": 0,
      "army_users": 0,
      "navy_users": 0,
      "air_force_users": 0,
      "new_users_30d": 1,
      "active_users_7d": 1
    },
    "timestamp": "2025-09-28T10:51:54.294Z"
  }
}
```

### 2. Get Dashboard Analytics
**GET** `/api/dashboard/analytics`

Returns chart data for analytics and visualizations.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `period` (optional): Time period for analytics (`7d`, `30d`, `90d`). Default: `7d`

**Example Request:**
```
GET /api/dashboard/analytics?period=30d
```

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "userActivityChart": [
      {
        "date": "2025-09-26T18:00:00.000Z",
        "new_users": 1,
        "online_users": 1
      }
    ],
    "conversationChart": [
      {
        "date": "2025-09-27T18:00:00.000Z",
        "new_conversations": 2,
        "direct_conversations": 1,
        "group_conversations": 1
      }
    ],
    "messageChart": [
      {
        "date": "2025-09-27T18:00:00.000Z",
        "total_messages": 15,
        "text_messages": 12,
        "system_messages": 3,
        "unique_senders": 5
      }
    ],
    "securityChart": [
      {
        "date": "2025-09-27T18:00:00.000Z",
        "total_activities": 1,
        "login_activities": 0,
        "password_activities": 0,
        "delete_activities": 0
      }
    ],
    "period": "7d",
    "timestamp": "2025-09-28T10:51:59.176Z"
  }
}
```

## Data Structure Details

### Total Contacts
- `total_contacts`: Total number of users in the system
- `active_contacts`: Number of active (non-deleted) users
- `inactive_contacts`: Number of inactive/deleted users
- `new_contacts_30d`: New users registered in last 30 days
- `new_contacts_7d`: New users registered in last 7 days

### Active Conversations
- `total_conversations`: Total number of conversations
- `active_24h`: Conversations active in last 24 hours
- `active_7d`: Conversations active in last 7 days
- `direct_conversations`: Number of direct (1-on-1) conversations
- `group_conversations`: Number of group conversations

### Online Contacts
- `online_now`: Users currently online
- `busy_now`: Users currently busy
- `offline_now`: Users currently offline
- `recently_active`: Users active in last 5 minutes
- `active_1h`: Users active in last 1 hour
- `active_24h`: Users active in last 24 hours

### Security Alerts
- `failed_logins_24h`: Failed login attempts in last 24 hours
- `failed_logins_7d`: Failed login attempts in last 7 days
- `password_changes_7d`: Password changes in last 7 days
- `deletions_7d`: Deletion activities in last 7 days
- `admin_actions_7d`: Admin actions in last 7 days
- `total_activities_1h`: Total activities in last 1 hour
- `total_activities_24h`: Total activities in last 24 hours

### Recent Activity
Array of recent audit log entries with:
- `action`: Type of action performed
- `target_type`: Type of target (user, conversation, etc.)
- `target_name`: Name of the target
- `details`: Additional details about the action
- `created_at`: Timestamp of the activity
- `user_name`: Name of user who performed the action
- `user_rank`: Rank of user who performed the action

### Conversation Stats
- `total_messages_24h`: Total messages in last 24 hours
- `unique_senders_24h`: Unique message senders in last 24 hours
- `active_conversations_24h`: Conversations with activity in last 24 hours
- `text_messages_24h`: Text messages in last 24 hours
- `system_messages_24h`: System messages in last 24 hours

### User Stats
- `super_admins`: Number of super admin users
- `admins`: Number of admin users
- `regular_users`: Number of regular users
- `army_users`: Number of army users
- `navy_users`: Number of navy users
- `air_force_users`: Number of air force users
- `new_users_30d`: New users in last 30 days
- `active_users_7d`: Users active in last 7 days

## Role-Based Access Control

### Super Admin & Admin
- Can view all system statistics
- Can see all users, conversations, and activities
- Have access to comprehensive security monitoring

### Regular Users
- Can view limited statistics related to their own activities
- Cannot see other users' detailed information
- Have access to their own conversation and activity data

## Error Responses

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Access token is required"
}
```

### 403 Forbidden
```json
{
  "status": "error",
  "message": "Insufficient permissions"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

## Usage Examples

### Get Dashboard Statistics
```bash
curl -X GET http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get 30-Day Analytics
```bash
curl -X GET "http://localhost:3000/api/dashboard/analytics?period=30d" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using PowerShell
```powershell
# Get dashboard stats
$token = "YOUR_JWT_TOKEN"
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/dashboard/stats" \
  -Headers @{ Authorization = "Bearer $token" } -UseBasicParsing
$data = $response.Content | ConvertFrom-Json
```

## Performance Considerations

1. **Caching**: Consider implementing caching for dashboard data as it involves multiple database queries
2. **Pagination**: Recent activity is limited to 10 entries for performance
3. **Time Periods**: Analytics queries are optimized for common time periods (7d, 30d, 90d)
4. **Role Filtering**: Data is filtered based on user role to improve query performance

## Integration with Frontend

The dashboard API is designed to work seamlessly with frontend dashboard components:

- **Statistics Cards**: Use the main stats endpoint for key metrics
- **Charts**: Use the analytics endpoint for time-series data
- **Activity Feeds**: Use the recent activity data for activity streams
- **Real-time Updates**: Consider implementing WebSocket connections for live updates

## Security Features

1. **JWT Authentication**: All endpoints require valid JWT tokens
2. **Role-based Access**: Data is filtered based on user permissions
3. **Audit Logging**: All dashboard access is logged for security monitoring
4. **Input Validation**: Query parameters are validated and sanitized
