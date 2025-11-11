# Office 365 SMTP AUTH Fix Guide

## Problem
Error: `535 5.7.139 Authentication unsuccessful, SmtpClientAuthentication is disabled for the Tenant`

This means SMTP AUTH is disabled at the tenant level in Office 365.

## Solution Options

### Option 1: Enable SMTP AUTH in Office 365 (Recommended if you have admin access)

#### Method A: Using Office 365 Admin Center

1. Go to [Microsoft 365 Admin Center](https://admin.microsoft.com)
2. Sign in as a **Global Administrator** or **Exchange Administrator**
3. Navigate to **Settings** → **Org settings** → **Mail**
4. Find **SMTP AUTH** setting
5. Enable it for your tenant
6. Click **Save**
7. Wait 5-10 minutes for changes to propagate
8. Restart your backend server

#### Method B: Using PowerShell (For Admins)

```powershell
# Connect to Exchange Online
Connect-ExchangeOnline

# Enable SMTP AUTH for the entire tenant
Set-TransportConfig -SmtpClientAuthenticationDisabled $false

# Or enable for a specific mailbox only
Set-CASMailbox -Identity noreply@spearwin.com -SmtpClientAuthenticationDisabled $false
```

#### Method C: Enable for Specific Mailbox Only

If you can't enable it for the entire tenant, you can enable it for just the `noreply@spearwin.com` mailbox:

```powershell
Connect-ExchangeOnline
Set-CASMailbox -Identity noreply@spearwin.com -SmtpClientAuthenticationDisabled $false
```

### Option 2: Switch to Gmail (Quick Fix)

If you have Gmail credentials, you can switch back to Gmail:

1. **Get Gmail App Password:**
   - Go to [Google Account](https://myaccount.google.com/)
   - Security → 2-Step Verification → App Passwords
   - Generate a new App Password for "Mail"

2. **Update .env file:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=your-email@gmail.com
```

3. **Restart the backend server**

### Option 3: Use SendGrid (Best for Production)

SendGrid is a professional email service that doesn't require SMTP AUTH configuration:

1. **Sign up at [SendGrid](https://sendgrid.com/)**
2. **Create an API Key:**
   - Go to Settings → API Keys
   - Create API Key
   - Copy the key

3. **Update .env file:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=noreply@spearwin.com
SMTP_FROM_NAME=Spearwin
```

4. **Verify your domain in SendGrid** (optional but recommended)
5. **Restart the backend server**

### Option 4: Use Mailgun (Alternative)

Similar to SendGrid:

1. **Sign up at [Mailgun](https://www.mailgun.com/)**
2. **Get SMTP credentials:**
   - Go to Sending → Domain Settings
   - Find SMTP credentials

3. **Update .env file:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-smtp-username
SMTP_PASS=your-mailgun-smtp-password
SMTP_FROM=noreply@spearwin.com
```

## Quick Decision Guide

- **Have Office 365 Admin Access?** → Use Option 1
- **Need Quick Fix?** → Use Option 2 (Gmail)
- **Production/High Volume?** → Use Option 3 (SendGrid)
- **Want Free Alternative?** → Use Option 2 (Gmail) or Option 4 (Mailgun)

## After Making Changes

1. Update your `.env` file with new credentials
2. Restart your backend server
3. Check logs for: `✅ Email transporter is ready to send emails`
4. Test sending an email

## Troubleshooting

### Still Getting Error After Enabling SMTP AUTH?

- Wait 10-15 minutes for changes to propagate
- Try restarting the backend server
- Verify the setting was saved in Office 365 Admin Center
- Check if you enabled it for the correct mailbox/tenant

### Need Help?

Check the server logs for detailed error messages. The email service now provides specific guidance based on the error type.

