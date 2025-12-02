# Mail Service Setup Guide

This guide explains how to configure the SMTP mail service for the contact form API.

## Environment Variables

Add the following environment variables to your `.env` file:

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com                    # SMTP server hostname
SMTP_PORT=587                                # SMTP port (587 for TLS, 465 for SSL, 25 for unencrypted)
SMTP_SECURE=false                            # true for SSL (port 465), false for TLS (port 587)
SMTP_USER=your-email@gmail.com               # SMTP username (usually your email)
SMTP_PASS=your-app-password                  # SMTP password or app-specific password
SMTP_FROM=noreply@spearwin.com               # Email address to send from (optional, defaults to SMTP_USER)
SMTP_TO=contact@spearwin.com                # Email address to receive contact form submissions (optional, defaults to SMTP_USER)

# Application Configuration
APP_NAME=SpearWin                             # Application name for email templates
```

## Common SMTP Providers

### Gmail
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Use App Password, not regular password
```

**Note:** For Gmail, you need to:
1. Enable 2-Step Verification
2. Generate an App Password: https://myaccount.google.com/apppasswords

### Outlook/Office 365
```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Mailgun
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

## API Endpoint

### POST /mail/contact

Send a contact form submission via email.

**Request Body:**
```json
{
  "email": "user@example.com",
  "phone": "1234567890",
  "service": "Core Banking",
  "message": "Your message here",
  "name": "John Doe"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Your message has been sent successfully. We will get back to you soon!"
}
```

## Features

- ✅ Validates contact form data
- ✅ Sends email to admin/company
- ✅ Sends confirmation email to user
- ✅ HTML email templates
- ✅ Error handling and logging
- ✅ SMTP connection verification

## Testing

You can test the endpoint using curl:

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

