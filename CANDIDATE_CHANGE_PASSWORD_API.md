# Candidate Change Password API

## ✅ Endpoint Added

**URL:** `PUT /candidate/change-password`

**Authentication:** Required (JWT Bearer Token)

**Controller:** `CandidateController`

**Service Method:** `CandidateService.changePassword()`

## 📋 Request Payload

```json
{
  "currentPassword": "your_current_password",
  "newPassword": "your_new_password_min_8_chars"
}
```

### Validation Rules

- `currentPassword`: Required, string
- `newPassword`: Required, string, minimum 8 characters

## 📤 Response

### Success (200 OK)
```json
{
  "message": "Password changed successfully"
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["newPassword must be longer than or equal to 8 characters"],
  "error": "Bad Request"
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Current password is incorrect",
  "error": "Unauthorized"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

## 🔒 Security Features

1. ✅ Current password verification using bcrypt
2. ✅ Password hashing with bcrypt (12 rounds)
3. ✅ Activity logging for password changes
4. ✅ JWT authentication required

## 🎯 Frontend Integration

### Service Method

**File:** `spearwin-landing/src/services/candidateService.js`

```javascript
changePassword: (data) => api.put('/candidate/change-password', data)
```

### Usage Example

```javascript
import { candidateService } from '@/services/candidateService';

try {
  await candidateService.changePassword({
    currentPassword: 'oldPassword123',
    newPassword: 'newPassword123'
  });
  console.log('Password changed successfully!');
} catch (error) {
  console.error('Error:', error.response?.data?.message);
}
```

## 📄 Frontend Page

**File:** `spearwin-landing/src/app/change-password/page.js`

✅ Fully integrated with:
- Form validation
- Loading states
- Error handling
- Success messages
- Auto-redirect after success

## 🔄 Alternative Endpoint

If you prefer using the generic user endpoint:

**URL:** `PUT /user/change-password`

Works the same way and accepts the same payload.

## 📝 Notes

- Password is hashed using bcrypt with 12 salt rounds
- Password change is logged in activity logs
- Both endpoints (`/candidate/change-password` and `/user/change-password`) work for candidates
- New password must be at least 8 characters long
- Current password is verified before allowing the change

