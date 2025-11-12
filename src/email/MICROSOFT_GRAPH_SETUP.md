# Microsoft Graph API Email Setup

This guide explains how to configure the email service to use Microsoft Graph API for sending emails.

## Prerequisites

1. Azure Active Directory (Azure AD) account
2. Microsoft 365 or Outlook account with email sending permissions
3. App registration in Azure Portal

## Step-by-Step Setup

### 1. Register Your App in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Fill in:
   - **Name**: `Spearwin Email Sender` (or any name)
   - **Supported account types**: Choose based on your needs
   - **Redirect URI**: Leave blank for client credentials flow
5. Click **Register**
6. Note down:
   - **Application (client) ID** → This is your `GRAPH_CLIENT_ID`
   - **Directory (tenant) ID** → This is your `GRAPH_TENANT_ID`

### 2. Configure API Permissions

1. In your registered app, go to **API permissions**
2. Click **Add a permission**
3. Choose **Microsoft Graph** → **Application permissions** (for client credentials flow)
4. Search and add:
   - `Mail.Send` - Required for sending emails
5. Click **Grant admin consent** (requires admin rights)

### 3. Create a Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add description (e.g., "Email Service Secret")
4. Choose expiration (recommended: 24 months)
5. Click **Add**
6. **IMPORTANT**: Copy the **Value** immediately - this is your `GRAPH_CLIENT_SECRET`
   - ⚠️ You won't be able to see it again after leaving this page

### 4. Configure Environment Variables

Add the following to your `.env` file:

```env
# Microsoft Graph API Configuration
GRAPH_TENANT_ID=b96f64f1-7096-49f5-bdfc-c615590d091f
GRAPH_CLIENT_ID=6806b19a-7119-4ea8-9c98-b52310919c17
GRAPH_CLIENT_SECRET=your_client_secret_here
GRAPH_USER_EMAIL=noreply@spearwin.com
GRAPH_FROM_NAME=Spearwin

# Optional: You can also use these alternative variable names
# MS_GRAPH_TENANT_ID=...
# MS_GRAPH_CLIENT_ID=...
# MS_GRAPH_CLIENT_SECRET=...
# MS_GRAPH_USER_EMAIL=...
# MS_GRAPH_FROM_NAME=...
```

### 5. Verify Configuration

When the application starts, you should see:
```
📧 Using Microsoft Graph API for email sending
  Tenant ID: b96f64f1-7096-49f5-bdfc-c615590d091f
  Client ID: 6806b19a-7119-4ea8-9c98-b52310919c17
  User Email: noreply@spearwin.com
✅ Microsoft Graph API access token obtained
```

## How It Works

1. **Token Acquisition**: The service automatically obtains an OAuth 2.0 access token using the client credentials flow
2. **Token Caching**: Tokens are cached and automatically refreshed when they expire
3. **Email Sending**: All email methods (`sendPasswordResetEmail`, `sendVerificationEmail`, `sendWelcomeEmail`, `sendMail`) automatically use Graph API when configured

## Fallback to SMTP

If Graph API credentials are not configured, the service automatically falls back to SMTP. To use SMTP instead, simply don't set the Graph API environment variables.

## Troubleshooting

### Error: "Invalid client secret"
- Make sure you copied the **Value** (not the Secret ID) from Azure Portal
- Check that the secret hasn't expired
- Create a new secret if needed

### Error: "Insufficient privileges"
- Ensure `Mail.Send` permission is granted
- Ensure admin consent is granted for the permission
- Verify the app has the correct permissions in Azure Portal

### Error: "User not found"
- Verify `GRAPH_USER_EMAIL` matches the email address in your Microsoft 365/Outlook account
- Ensure the user has a valid mailbox

### Token Expiration
- Tokens are automatically refreshed when they expire
- The service caches tokens and refreshes them 5 minutes before expiration

## Security Notes

- ⚠️ Never commit `.env` files to version control
- Store client secrets securely
- Rotate client secrets periodically
- Use environment-specific secrets for different environments (dev, staging, production)

## Current Configuration

Based on your setup:
- **Display Name**: Spearwin
- **Username**: noreply@spearwin.com
- **Client ID**: 6806b19a-7119-4ea8-9c98-b52310919c17
- **Tenant ID**: b96f64f1-7096-49f5-bdfc-c615590d091f
- **Client Secret**: ⚠️ Create this in Azure Portal (Step 3 above)

## API Endpoints Used

- **Token Endpoint**: `https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token`
- **Send Mail Endpoint**: `https://graph.microsoft.com/v1.0/users/{user_email}/sendMail`

