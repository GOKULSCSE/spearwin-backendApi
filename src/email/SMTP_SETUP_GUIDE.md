# SMTP Configuration Guide

Complete guide on how to obtain SMTP settings for various email providers.

## Gmail SMTP Setup

### Step 1: Enable 2-Step Verification

1. Go to your [Google Account](https://myaccount.google.com/)
2. Click on **Security** in the left sidebar
3. Under "How you sign in to Google", find **2-Step Verification**
4. Click **Get Started** and follow the prompts to enable it
   - You'll need to verify your phone number
   - Google will send a verification code

### Step 2: Generate App Password

1. After enabling 2-Step Verification, go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Or navigate: Google Account → Security → 2-Step Verification → App passwords
2. You may be asked to sign in again
3. Under "Select app", choose **Mail**
4. Under "Select device", choose **Other (Custom name)**
5. Type a name like "NestJS App" or "Spearwin Backend"
6. Click **Generate**
7. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)
   - ⚠️ **Important**: You can only see this password once! Copy it immediately.

### Step 3: Configure Your .env File

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=abcdefghijklmnop    # Use the 16-character app password (remove spaces)
MAIL_FROM=your-email@gmail.com
MAIL_FROM_NAME=Spearwin
MAIL_SECURE=false
```

**Important Notes:**
- Use your **full Gmail address** (e.g., `john.doe@gmail.com`)
- Use the **App Password**, NOT your regular Gmail password
- Remove spaces from the App Password when pasting
- `MAIL_FROM` should be the same as `MAIL_USER` for Gmail

---

## Outlook/Hotmail SMTP Setup

### Step 1: Enable App Password

1. Go to [Microsoft Account Security](https://account.microsoft.com/security)
2. Sign in with your Outlook/Hotmail account
3. Click on **Security** → **Advanced security options**
4. Under "App passwords", click **Create a new app password**
5. Give it a name (e.g., "NestJS App")
6. Click **Generate**
7. Copy the generated password

### Step 2: Configure Your .env File

```env
MAIL_HOST=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_USER=your-email@outlook.com
MAIL_PASS=your-app-password
MAIL_FROM=your-email@outlook.com
MAIL_FROM_NAME=Spearwin
MAIL_SECURE=false
```

---

## Yahoo Mail SMTP Setup

### Step 1: Generate App Password

1. Go to [Yahoo Account Security](https://login.yahoo.com/account/security)
2. Sign in to your Yahoo account
3. Click on **Generate app password**
4. Select **Mail** as the app
5. Click **Generate**
6. Copy the generated password

### Step 2: Configure Your .env File

```env
MAIL_HOST=smtp.mail.yahoo.com
MAIL_PORT=587
MAIL_USER=your-email@yahoo.com
MAIL_PASS=your-app-password
MAIL_FROM=your-email@yahoo.com
MAIL_FROM_NAME=Spearwin
MAIL_SECURE=false
```

---

## Custom Domain Email (cPanel, Plesk, etc.)

If you have a custom domain email (e.g., `noreply@yourdomain.com`):

### Step 1: Find Your SMTP Settings

Contact your hosting provider or check your email hosting control panel. Common settings:

**For cPanel:**
- SMTP Host: Usually `mail.yourdomain.com` or `smtp.yourdomain.com`
- Port: 587 (TLS) or 465 (SSL)
- Username: Your full email address
- Password: Your email account password

**For Google Workspace (formerly G Suite):**
- Use the same settings as Gmail
- SMTP Host: `smtp.gmail.com`
- Port: 587
- Username: Your workspace email (e.g., `admin@yourdomain.com`)
- App Password: Generate from Google Account

### Step 2: Configure Your .env File

```env
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=587
MAIL_USER=noreply@yourdomain.com
MAIL_PASS=your-email-password
MAIL_FROM=noreply@yourdomain.com
MAIL_FROM_NAME=Your Company Name
MAIL_SECURE=false
```

---

## Common SMTP Providers Quick Reference

### SendGrid

```env
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASS=your-sendgrid-api-key
MAIL_FROM=noreply@yourdomain.com
MAIL_FROM_NAME=Spearwin
MAIL_SECURE=false
```

**How to get:**
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Go to Settings → API Keys
3. Create an API key
4. Use `apikey` as the username and your API key as the password

### Mailgun

```env
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USER=your-mailgun-smtp-username
MAIL_PASS=your-mailgun-smtp-password
MAIL_FROM=noreply@yourdomain.com
MAIL_FROM_NAME=Spearwin
MAIL_SECURE=false
```

**How to get:**
1. Sign up at [Mailgun](https://www.mailgun.com/)
2. Go to Sending → Domain Settings
3. Find your SMTP credentials under "SMTP credentials"

### Amazon SES

```env
MAIL_HOST=email-smtp.us-east-1.amazonaws.com  # Use your region
MAIL_PORT=587
MAIL_USER=your-ses-smtp-username
MAIL_PASS=your-ses-smtp-password
MAIL_FROM=verified-email@yourdomain.com
MAIL_FROM_NAME=Spearwin
MAIL_SECURE=false
```

**How to get:**
1. Sign up for [AWS SES](https://aws.amazon.com/ses/)
2. Go to SES → SMTP Settings
3. Create SMTP credentials
4. Verify your email address or domain

### Zoho Mail

```env
MAIL_HOST=smtp.zoho.com
MAIL_PORT=587
MAIL_USER=your-email@zoho.com
MAIL_PASS=your-zoho-password
MAIL_FROM=your-email@zoho.com
MAIL_FROM_NAME=Spearwin
MAIL_SECURE=false
```

**Note:** For Zoho, you may need to enable "Less secure app access" or use an App Password.

---

## Testing Your SMTP Configuration

### Method 1: Test via API

```bash
curl -X POST http://localhost:5000/mail/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-test-email@gmail.com",
    "subject": "Test Email",
    "text": "This is a test email to verify SMTP configuration."
  }'
```

### Method 2: Check Application Logs

After starting your NestJS application, check the logs:

**Success:**
```
[EmailService] Email transporter is ready to send emails
```

**Error:**
```
[EmailService] Email transporter verification failed: [error details]
```

### Method 3: Common Error Messages

| Error | Solution |
|-------|----------|
| `Invalid login` | Check username and password |
| `Connection timeout` | Check firewall/network settings |
| `Authentication failed` | Use App Password for Gmail, not regular password |
| `535-5.7.8 Username and Password not accepted` | Enable "Less secure app access" or use App Password |
| `Connection refused` | Check if port 587/465 is blocked |

---

## Security Best Practices

1. **Never commit .env files** to version control
2. **Use App Passwords** instead of your main account password
3. **Restrict App Passwords** to specific applications
4. **Rotate passwords** regularly
5. **Use environment-specific** configurations (dev, staging, prod)
6. **Monitor email sending** for suspicious activity

---

## Troubleshooting

### Gmail: "Less secure app access" error

**Solution:** Gmail no longer supports "Less secure app access". You **must** use an App Password.

### Port 587 vs 465

- **Port 587**: Uses STARTTLS (recommended)
  - `MAIL_SECURE=false`
- **Port 465**: Uses SSL/TLS
  - `MAIL_SECURE=true`

### Firewall Issues

If emails aren't sending:
1. Check if your server/hosting allows outbound connections on port 587/465
2. Some corporate networks block SMTP ports
3. Contact your hosting provider if needed

### Rate Limits

- **Gmail**: 500 emails per day (free account), 2000 per day (Workspace)
- **Outlook**: 300 emails per day
- **Yahoo**: 500 emails per day

For production, consider using dedicated email services like SendGrid, Mailgun, or AWS SES.

---

## Quick Checklist

- [ ] 2-Step Verification enabled (for Gmail/Google)
- [ ] App Password generated
- [ ] SMTP host correct for your provider
- [ ] Port number correct (587 or 465)
- [ ] Username is full email address
- [ ] Password is App Password (not regular password)
- [ ] MAIL_FROM matches MAIL_USER
- [ ] MAIL_SECURE matches port (false for 587, true for 465)
- [ ] Test email sent successfully

---

## Need Help?

If you're still having issues:

1. Check your application logs for detailed error messages
2. Verify your SMTP settings with your email provider's documentation
3. Test with a simple email client (like Thunderbird) using the same settings
4. Contact your email provider's support

