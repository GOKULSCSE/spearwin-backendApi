# Configuring Multiple Email Senders with Microsoft Graph API

## Problem
If emails are only coming from one email address (e.g., `gokul03903@gmail.com`) and not from other configured emails, it's because Microsoft Graph API with application permissions can only send from email addresses that:

1. **Exist in your Azure AD tenant**
2. **Have been granted permission in the Azure AD app registration**

## Solution

### Step 1: Verify Email Addresses in Azure AD

All email addresses you want to send from must exist in your Azure AD tenant:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **Users**
3. Verify that all email addresses you want to use exist as users in your tenant
   - `noreply@spearwin.com` ✅
   - `gokul03903@gmail.com` ✅
   - Any other email addresses you want to use

### Step 2: Grant Mail.Send Permission for All Users

The Azure AD app needs permission to send emails on behalf of all users:

1. Go to **Azure Active Directory** > **App registrations** > Your app
2. Go to **API permissions**
3. Ensure `Mail.Send` (Application permission) is added
4. Click **Grant admin consent for [Your Organization]**

**Important**: With Application permissions, the app can send emails on behalf of ANY user in the tenant, as long as:
- The user exists in Azure AD
- The app has the `Mail.Send` application permission
- Admin consent has been granted

### Step 3: Configure Environment Variables

In your `.env` file, set the default sender email:

```bash
# Default email to send from (can be overridden in code)
GRAPH_USER_EMAIL=noreply@spearwin.com
GRAPH_FROM_NAME=SpearWin
```

### Step 4: Using Different Email Addresses in Code

The `MailService` now has a generic `sendEmail` method that accepts a `fromEmail` parameter:

```typescript
// Send from default email (GRAPH_USER_EMAIL)
await mailService.sendEmail(
  'noreply@spearwin.com',
  'user@example.com',
  'Subject',
  '<html>Content</html>',
  'SpearWin'
);

// Send from a different email
await mailService.sendEmail(
  'gokul03903@gmail.com',
  'user@example.com',
  'Subject',
  '<html>Content</html>',
  'Gokul'
);
```

### Step 5: Troubleshooting

#### Error: "User not found"
- **Solution**: The email address doesn't exist in Azure AD. Add it as a user first.

#### Error: "Insufficient privileges"
- **Solution**: 
  1. Ensure `Mail.Send` application permission is granted
  2. Ensure admin consent is provided
  3. Verify the email exists in Azure AD

#### Error: "Mail sending is disabled"
- **Solution**: Enable mail sending for the user in Microsoft 365 admin center

#### Emails only coming from one address
- **Check**: Verify all email addresses exist in Azure AD
- **Check**: Verify the app has `Mail.Send` application permission (not delegated)
- **Check**: Verify admin consent is granted

## Current Configuration

Check your current `.env` file:

```bash
GRAPH_USER_EMAIL=noreply@spearwin.com  # Default sender
```

To use a different email, either:
1. Change `GRAPH_USER_EMAIL` in `.env` and restart the server
2. Use the `sendEmail` method with a specific `fromEmail` parameter in code

## Testing

Test sending from different email addresses:

```bash
# Test from default email
curl -X POST http://localhost:5000/mail/contact \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "1234567890",
    "service": "Test",
    "message": "Test message",
    "name": "Test User"
  }'
```

Check the server logs to see which email address is being used:
```
Sending email from noreply@spearwin.com to contact@spearwin.com
```

## Notes

- **Application Permissions**: With `Mail.Send` application permission, you can send from ANY user in the tenant
- **Delegated Permissions**: Would require each user to consent individually (not recommended for automated emails)
- **Email Verification**: All sender emails must be verified users in Azure AD
- **Rate Limits**: Microsoft Graph API has rate limits - check logs for throttling errors


