# Email Configuration Guide

This guide explains how to configure email functionality for the Spearwin backend using Nodemailer.

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=Spearwin

# Frontend URL (for reset password links)
FRONTEND_URL=http://localhost:3000
```

## Gmail Configuration

If you're using Gmail, follow these steps:

### 1. Enable 2-Factor Authentication
1. Go to your [Google Account](https://myaccount.google.com/)
2. Navigate to **Security**
3. Enable **2-Step Verification**

### 2. Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** as the app
3. Select **Other** as the device and name it "Spearwin Backend"
4. Click **Generate**
5. Copy the 16-character password
6. Use this password in `EMAIL_PASSWORD` environment variable

### Example Gmail Configuration
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=noreply@yourcompany.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM_NAME=Spearwin
```

## Other Email Providers

### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM_NAME=Spearwin
```

### Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@yourdomain.mailgun.org
EMAIL_PASSWORD=your-mailgun-password
EMAIL_FROM_NAME=Spearwin
```

### AWS SES
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-ses-smtp-username
EMAIL_PASSWORD=your-ses-smtp-password
EMAIL_FROM_NAME=Spearwin
```

### Outlook/Office 365
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
EMAIL_FROM_NAME=Spearwin
```

## Email Features

The email service provides the following features:

### 1. Password Reset Email
Sent when a user requests to reset their password via the forgot password flow.

**Template includes:**
- Reset password link (valid for 1 hour)
- Expiry warning
- Security notice
- Professional HTML design

### 2. Email Verification
Sent when a new user registers to verify their email address.

**Template includes:**
- Verification code
- Expiry time (24 hours)
- Simple verification instructions

### 3. Welcome Email
Sent after successful registration and email verification.

**Template includes:**
- Personalized greeting
- Quick start guide
- Dashboard link

## Testing Email Configuration

After adding the environment variables, restart your backend server:

```bash
npm run start:dev
```

Check the logs for:
```
[EmailService] Email transporter is ready to send emails
```

If you see an error, verify your credentials and configuration.

## Testing Forgot Password Flow

1. Go to the login page
2. Click "Forgot Password?"
3. Enter your email address
4. Check your inbox for the password reset email
5. Click the reset link or use the provided token

## Troubleshooting

### "Email transporter not initialized"
- Check that all `EMAIL_*` environment variables are set
- Restart the server after adding variables

### "Authentication failed"
- For Gmail: Make sure you're using an App Password, not your regular password
- For other providers: Verify your SMTP credentials

### "Connection timeout"
- Check your `EMAIL_HOST` and `EMAIL_PORT`
- Verify your firewall allows outbound SMTP connections
- Try `EMAIL_PORT=465` with `EMAIL_SECURE=true` for SSL

### Emails not arriving
- Check spam/junk folder
- Verify the sender email is properly configured
- Check server logs for sending errors

## Security Best Practices

1. **Never commit `.env` file** - Add it to `.gitignore`
2. **Use app-specific passwords** - Don't use your main email password
3. **Rotate credentials regularly** - Change passwords periodically
4. **Use environment-specific configs** - Different credentials for dev/staging/prod
5. **Monitor email usage** - Watch for unusual sending patterns

## API Endpoints Using Email

### POST `/api/auth/forgot-password`
Sends a password reset email with a unique token.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

## Email Templates

Email templates are designed to be:
- **Responsive** - Works on mobile and desktop
- **Professional** - Clean, modern design
- **Accessible** - Good contrast and readable fonts
- **Secure** - No tracking pixels or external resources

## Production Considerations

For production environments:

1. **Use a dedicated email service** (SendGrid, AWS SES, Mailgun)
2. **Set up SPF, DKIM, and DMARC** records for your domain
3. **Monitor bounce and complaint rates**
4. **Implement rate limiting** for email sending
5. **Use a dedicated sending domain** (e.g., `noreply@spearwin.com`)
6. **Set up email delivery monitoring**

## Future Enhancements

Planned features:
- Email queue for bulk sending
- Email templates management in database
- Unsubscribe functionality
- Email delivery tracking
- Scheduled email campaigns
- Email analytics

## Support

If you encounter issues with email configuration, check:
1. Server logs for detailed error messages
2. Email provider documentation
3. Network/firewall settings
4. SMTP test tools online

For additional help, contact the development team.


