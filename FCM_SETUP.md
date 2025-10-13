# Firebase Cloud Messaging (FCM) Setup Guide

This guide explains how to set up Firebase Cloud Messaging (FCM) for push notifications in the SpearWin backend.

## Prerequisites

1. A Firebase project with FCM enabled
2. Firebase service account credentials
3. Node.js environment with npm/yarn installed

## Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
```

## Getting Firebase Credentials

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Cloud Messaging in the project settings

### Step 2: Generate Service Account Key

1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract the required values from the JSON file:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com"
}
```

### Step 3: Configure Environment Variables

Update your `.env` file with the extracted values:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
```

**Important Notes:**
- The `FIREBASE_PRIVATE_KEY` should include the `\n` characters as literal newlines
- Make sure to wrap the private key in quotes
- Never commit the service account JSON file to version control

## Database Migration

Run the following command to apply the database schema changes for FCM tokens:

```bash
npx prisma db push
```

Or if you prefer migrations:

```bash
npx prisma migrate dev --name add-fcm-tokens
```

## Installation

Install the required dependencies:

```bash
npm install firebase-admin
# or
yarn add firebase-admin
```

## API Endpoints

### FCM Token Management

#### Register FCM Token
```http
POST /api/notifications/fcm/register
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "token": "fcm-device-token-here",
  "deviceInfo": {
    "platform": "android",
    "appVersion": "1.0.0",
    "deviceModel": "Pixel 6",
    "osVersion": "13"
  }
}
```

#### Unregister FCM Token
```http
POST /api/notifications/fcm/unregister
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "token": "fcm-device-token-here"
}
```

#### Get User FCM Tokens
```http
GET /api/notifications/fcm/tokens
Authorization: Bearer <jwt-token>
```

#### Validate FCM Token
```http
POST /api/notifications/fcm/validate
Content-Type: application/json

{
  "token": "fcm-device-token-here"
}
```

### Push Notification Sending (Admin Only)

#### Send to User
```http
POST /api/notifications/fcm/send-to-user
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "userId": "user-id-here",
  "title": "Notification Title",
  "body": "Notification message body",
  "data": {
    "customKey": "customValue"
  },
  "imageUrl": "https://example.com/image.jpg",
  "clickAction": "/notifications/123"
}
```

#### Send to Multiple Users
```http
POST /api/notifications/fcm/send-to-multiple-users
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "userIds": ["user-id-1", "user-id-2"],
  "title": "Bulk Notification Title",
  "body": "Bulk notification message",
  "data": {
    "type": "bulk"
  }
}
```

#### Send to Specific Token
```http
POST /api/notifications/fcm/send-to-token
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "token": "fcm-device-token-here",
  "title": "Direct Token Notification",
  "body": "Message sent directly to token",
  "data": {
    "direct": "true"
  }
}
```

#### Send to Multiple Tokens
```http
POST /api/notifications/fcm/send-to-multiple-tokens
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "tokens": ["token-1", "token-2", "token-3"],
  "title": "Multi-Token Notification",
  "body": "Message sent to multiple tokens",
  "data": {
    "multi": "true"
  }
}
```

#### Send to Topic
```http
POST /api/notifications/fcm/send-to-topic
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "topic": "job-alerts",
  "title": "New Job Alert",
  "body": "New jobs matching your criteria",
  "data": {
    "topic": "job-alerts"
  }
}
```

### Topic Management

#### Subscribe to Topic
```http
POST /api/notifications/fcm/subscribe-to-topic
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "tokens": ["token-1", "token-2"],
  "topic": "job-alerts"
}
```

#### Unsubscribe from Topic
```http
POST /api/notifications/fcm/unsubscribe-from-topic
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "tokens": ["token-1", "token-2"],
  "topic": "job-alerts"
}
```

### Enhanced Notification Creation

#### Create Notification with Push
```http
POST /api/notifications/with-push
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "userId": "user-id-here",
  "type": "JOB_ALERT",
  "title": "New Job Alert",
  "message": "A new job matches your criteria",
  "data": {
    "jobId": "job-123",
    "companyName": "Tech Corp"
  },
  "imageUrl": "https://example.com/job-image.jpg",
  "clickAction": "/jobs/123",
  "sendPush": true,
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

#### Send Bulk Notifications
```http
POST /api/notifications/bulk
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "notifications": [
    {
      "userId": "user-1",
      "type": "JOB_ALERT",
      "title": "New Job Alert",
      "message": "New job available",
      "sendPush": true
    },
    {
      "userId": "user-2",
      "type": "APPLICATION_UPDATE",
      "title": "Application Update",
      "message": "Your application status has changed",
      "sendPush": true
    }
  ]
}
```

## Features

### Automatic Token Management
- Tokens are automatically validated when sending notifications
- Invalid tokens are marked as inactive in the database
- Failed notifications are logged for debugging

### Multi-Platform Support
- Android notifications with custom sounds and actions
- iOS notifications with badges and sounds
- Web push notifications with icons and actions

### Error Handling
- Comprehensive error handling for FCM failures
- Detailed response messages for debugging
- Graceful degradation when FCM is unavailable

### Security
- Admin-only endpoints for sending notifications
- JWT authentication for all endpoints
- Input validation for all requests

## Testing

### Test FCM Setup
1. Register a test device token
2. Send a test notification using the API
3. Verify the notification appears on the device

### Test Token Validation
```bash
curl -X POST http://localhost:3000/api/notifications/fcm/validate \
  -H "Content-Type: application/json" \
  -d '{"token": "your-test-token"}'
```

## Troubleshooting

### Common Issues

1. **Firebase initialization fails**
   - Check environment variables are correctly set
   - Verify the service account has the correct permissions
   - Ensure the private key format is correct

2. **Notifications not received**
   - Verify the device token is valid and active
   - Check if the app has notification permissions
   - Ensure the FCM service is properly initialized

3. **Invalid token errors**
   - Tokens expire and need to be refreshed
   - Check if the app is properly configured for FCM
   - Verify the Firebase project settings

### Debug Mode

Enable debug logging by setting the log level in your environment:

```bash
LOG_LEVEL=debug
```

## Production Considerations

1. **Rate Limiting**: Implement rate limiting for notification sending
2. **Monitoring**: Set up monitoring for FCM success/failure rates
3. **Cleanup**: Regularly clean up inactive tokens
4. **Security**: Use environment variables for all sensitive data
5. **Scaling**: Consider using Firebase Cloud Functions for high-volume notifications

## Support

For issues related to:
- Firebase setup: Check [Firebase Documentation](https://firebase.google.com/docs)
- FCM implementation: Review the service code in `src/notification/fcm.service.ts`
- API usage: Check the controller code in `src/notification/notification.controller.ts`
