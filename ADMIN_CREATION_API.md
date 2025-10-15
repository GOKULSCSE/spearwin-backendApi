# Admin Creation API Documentation

## 🚀 Overview

The Admin Creation API allows SUPER_ADMIN users to create new admin users in the system. This API requires JWT authentication and proper authorization.

## 📋 API Endpoints

### 1. Admin Login (Get JWT Token)
**Endpoint:** `POST /api/admin/login`

**Purpose:** Authenticate as SUPER_ADMIN to get JWT token for creating admins

**Request Body:**
```json
{
  "email": "superadmin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "super_admin_id",
      "email": "superadmin@example.com",
      "role": "SUPER_ADMIN",
      "status": "ACTIVE",
      "firstName": "Super",
      "lastName": "Admin",
      "designation": "System Administrator",
      "department": "IT",
      "lastLoginAt": "2025-01-15T14:30:00.000Z",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

### 2. Create Admin User
**Endpoint:** `POST /api/admin/create-admin`

**Purpose:** Create a new admin user (requires SUPER_ADMIN role)

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newadmin@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "ADMIN",
  "department": "Human Resources",
  "position": "HR Manager"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin created successfully",
  "data": {
    "user": {
      "id": "new_admin_user_id",
      "email": "newadmin@example.com",
      "role": "ADMIN",
      "status": "ACTIVE",
      "emailVerified": true,
      "phoneVerified": true,
      "profileCompleted": true,
      "twoFactorEnabled": false,
      "createdAt": "2025-01-15T14:35:00.000Z"
    },
    "admin": {
      "id": "new_admin_id",
      "firstName": "John",
      "lastName": "Doe",
      "department": "Human Resources",
      "position": "HR Manager",
      "createdAt": "2025-01-15T14:35:00.000Z"
    }
  }
}
```

## 📝 Request Body Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✅ | Admin email address (must be unique) |
| `password` | string | ✅ | Password (minimum 8 characters) |
| `firstName` | string | ✅ | Admin's first name |
| `lastName` | string | ✅ | Admin's last name |
| `phone` | string | ❌ | Phone number (optional, must be unique if provided) |
| `role` | enum | ✅ | Either "ADMIN" or "SUPER_ADMIN" |
| `department` | string | ❌ | Department name (optional) |
| `position` | string | ❌ | Job position/title (optional) |

## 🔐 Security Features

### Authentication
- **JWT Token Required:** All admin creation requests must include valid JWT token
- **Role-based Access:** Only SUPER_ADMIN users can create new admins
- **Token Expiration:** Access tokens expire in 15 minutes

### Validation
- **Email Uniqueness:** Email addresses must be unique across the system
- **Phone Uniqueness:** Phone numbers must be unique if provided
- **Password Strength:** Minimum 8 characters required
- **Role Validation:** Only ADMIN and SUPER_ADMIN roles allowed

### Data Protection
- **Password Hashing:** Passwords are hashed using bcrypt
- **Auto-verification:** Admin accounts are automatically verified
- **Activity Logging:** All admin creation activities are logged

## 📊 Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 201 | Created | Admin created successfully |
| 400 | Bad Request | Invalid data or duplicate email/phone |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions (not SUPER_ADMIN) |
| 500 | Internal Server Error | Server error during creation |

## 🚨 Error Responses

### Unauthorized (401)
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### Forbidden (403)
```json
{
  "message": "Only SUPER_ADMIN can create admins",
  "error": "Forbidden",
  "statusCode": 403
}
```

### Bad Request (400)
```json
{
  "message": "User with this email already exists",
  "error": "Bad Request",
  "statusCode": 400
}
```

## 🧪 Testing Examples

### 1. Create Regular Admin
```bash
curl -X POST http://localhost:5000/api/admin/create-admin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADMIN",
    "department": "HR",
    "position": "HR Manager"
  }'
```

### 2. Create Super Admin
```bash
curl -X POST http://localhost:5000/api/admin/create-admin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin2@example.com",
    "password": "SuperSecurePass456!",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "SUPER_ADMIN",
    "department": "IT",
    "position": "Senior System Administrator"
  }'
```

### 3. Create Admin with Minimal Data
```bash
curl -X POST http://localhost:5000/api/admin/create-admin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "minimal@example.com",
    "password": "MinimalPass789!",
    "firstName": "Bob",
    "lastName": "Wilson",
    "role": "ADMIN"
  }'
```

## 📁 Postman Collection

A complete Postman collection is available in `admin-creation-collection.json` with:
- ✅ Admin login request
- ✅ Create admin user request
- ✅ Create super admin request
- ✅ Create minimal admin request
- ✅ Error handling examples
- ✅ Auto-token extraction

## 🔄 Workflow

1. **Login as SUPER_ADMIN** → Get JWT token
2. **Use JWT token** → Create new admin users
3. **New admins can login** → Use the same login endpoint
4. **Chain continues** → New SUPER_ADMINs can create more admins

## 🎯 Key Features

✅ **JWT Authentication** - Secure token-based authentication  
✅ **Role-based Authorization** - Only SUPER_ADMIN can create admins  
✅ **Data Validation** - Comprehensive input validation  
✅ **Auto-verification** - Admin accounts are pre-verified  
✅ **Activity Logging** - All actions are logged for audit  
✅ **Error Handling** - Detailed error messages  
✅ **Flexible Creation** - Support for minimal and full admin profiles  

## 🚀 Quick Start

1. **Import** the Postman collection
2. **Login** as SUPER_ADMIN to get JWT token
3. **Create** new admin users with the token
4. **Test** the created admins by logging in

The admin creation API is now fully functional with JWT authentication! 🎉
