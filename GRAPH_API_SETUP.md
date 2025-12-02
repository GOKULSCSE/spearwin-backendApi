# Microsoft Graph API Email Setup Guide

This guide explains how to configure Microsoft Graph API for sending emails when SMTP AUTH is blocked by security defaults.

## Why Use Graph API?

When Microsoft 365 has security defaults enabled, SMTP AUTH is blocked. Microsoft Graph API is the recommended alternative for sending emails programmatically.

## Prerequisites

1. Azure AD App Registration
2. Admin consent for application permissions
3. Client credentials (Client ID, Client Secret, Tenant ID)

## Azure AD App Registration Setup

### Step 1: Create App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Enter a name (e.g., "SpearWin Mail Service")
5. Select **Accounts in this organizational directory only**
6. Click **Register**

### Step 2: Configure API Permissions

1. In your app registration, go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Application permissions** (not Delegated)
5. Search for and add:
   - `Mail.Send` - **Required** for sending emails
6. Click **Add permissions**
7. **Important**: Click **Grant admin consent for [Your Organization]**

### Step 3: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Enter a description (e.g., "Mail Service Secret")
4. Choose expiration period
5. Click **Add**
6. **Copy the secret value immediately** (it won't be shown again)

### Step 4: Get Application Details

1. Go to **Overview**
2. Copy:
   - **Application (client) ID**
   - **Directory (tenant) ID**

## Environment Variables

Add these to your `.env` file:

```bash
# Microsoft Graph API Configuration
GRAPH_TENANT_ID=your-tenant-id-here
GRAPH_CLIENT_ID=your-client-id-here
GRAPH_CLIENT_SECRET=your-client-secret-here
GRAPH_USER_EMAIL=noreply@spearwin.com  # Email address to send from
GRAPH_FROM_NAME=SpearWin                # Display name for sender

# Optional: Fallback SMTP (not used when Graph API is configured)
SMTP_TO=contact@spearwin.com            # Email to receive contact form submissions
APP_NAME=SpearWin
```

## Required Permissions Summary

| Permission | Type | Description | Required |
|------------|------|-------------|----------|
| `Mail.Send` | Application | Send mail as any user | ✅ Yes |

## Troubleshooting

### Error: "Insufficient privileges to complete the operation"

**Solution**: Ensure admin consent has been granted for the `Mail.Send` application permission.

1. Go to Azure Portal > App registrations > Your app > API permissions
2. Verify `Mail.Send` shows "Granted for [Your Organization]"
3. If not, click **Grant admin consent**

### Error: "The user or administrator has not consented to use the application"

**Solution**: The app needs admin consent. Contact your Azure AD administrator to grant consent.

### Error: "Invalid client secret"

**Solution**: 
- Verify the client secret in your `.env` file matches the one created in Azure Portal
- Check if the secret has expired (create a new one if needed)
- Ensure there are no extra spaces or quotes in the `.env` file

### Error: "User not found"

**Solution**: 
- Verify `GRAPH_USER_EMAIL` exists in your Azure AD tenant
- Ensure the email address is correct and active
- The app must have permission to send as this user

## Testing

After configuration, test the endpoint:

```bash
curl -X POST http://localhost:5000/mail/contact \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "1234567890",
    "service": "Core Banking",
    "message": "Test message"
  }'
```

## Security Notes

1. **Never commit secrets to git** - Always use `.env` file (already in `.gitignore`)
2. **Rotate secrets regularly** - Update client secrets periodically
3. **Use least privilege** - Only grant the `Mail.Send` permission needed
4. **Monitor usage** - Check Azure AD sign-in logs for suspicious activity

## How It Works

1. The service authenticates with Azure AD using client credentials (OAuth 2.0)
2. Obtains an access token with `Mail.Send` permission
3. Uses Microsoft Graph API to send emails on behalf of the configured user
4. Tokens are cached and automatically refreshed before expiry

## Fallback to SMTP

If Graph API is not configured, the service will log a warning but won't crash. You can configure SMTP as a fallback, but it won't work if security defaults are enabled.

