# Email Setup Quickstart

## ✅ Installation Complete

Nodemailer has been successfully installed and configured in the backend.

## 🚀 Quick Setup (5 minutes)

### Step 1: Add Environment Variables

Add these lines to your `.env` file (create one if it doesn't exist):

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=Spearwin

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Step 2: Get Gmail App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Select **Mail** and **Other (Custom name)**
5. Name it "Spearwin Backend"
6. Copy the 16-character password
7. Paste it in `EMAIL_PASSWORD` (remove spaces)

### Step 3: Restart the Server

```bash
npm run start:dev
```

Look for this log message:
```
[EmailService] Email transporter is ready to send emails
```

### Step 4: Test It

1. Go to `http://localhost:3000/login`
2. Click **"Forgot Password?"**
3. Enter your email
4. Check your inbox for the password reset email

## 📧 Email Features Now Available

✅ **Password Reset Emails** - Beautiful HTML templates with reset links  
✅ **Email Verification** - Verification codes for new users  
✅ **Welcome Emails** - Onboarding emails for new registrations  

## 🎨 Email Templates

All emails feature:
- Professional HTML design
- Mobile-responsive layout
- Spearwin branding
- Security notices
- Clear call-to-action buttons

## 📝 What Was Changed

### New Files Created:
1. `src/email/email.service.ts` - Nodemailer email service
2. `src/email/email.module.ts` - Email module
3. `EMAIL_CONFIGURATION.md` - Detailed configuration guide

### Modified Files:
1. `src/auth/auth.service.ts` - Added email sending to forgot password
2. `src/auth/auth.module.ts` - Imported EmailModule
3. `package.json` - Added nodemailer dependencies

## 🔧 Configuration Options

### Gmail (Recommended for Development)
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

### SendGrid (Recommended for Production)
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

### AWS SES (Enterprise)
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-ses-username
EMAIL_PASSWORD=your-ses-password
```

## 🐛 Troubleshooting

### "Email transporter not initialized"
- Make sure all `EMAIL_*` variables are in your `.env` file
- Restart the server

### "Invalid login"
- Use Gmail App Password, not your regular password
- Make sure 2FA is enabled on Gmail

### Emails not arriving
- Check spam folder
- Verify sender email in Gmail settings
- Check server logs for errors

## 📚 Additional Documentation

See `EMAIL_CONFIGURATION.md` for:
- Detailed provider configurations
- Security best practices
- Production deployment guide
- Advanced features

## ✨ Next Steps

The forgot password flow now sends real emails! The frontend (`LoginForm.js`) is already integrated and ready to use.

**Try it out:**
1. Visit the login page
2. Click "Forgot Password?"
3. Enter your email
4. Receive a beautiful reset email
5. Click the link to reset your password

## 🎯 API Endpoint

**POST** `/api/auth/forgot-password`

Request:
```json
{
  "email": "candidate@example.com"
}
```

Response:
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

The email will contain a reset link valid for 1 hour.

## 📞 Support

If you need help:
1. Check the logs in your terminal
2. Read `EMAIL_CONFIGURATION.md`
3. Test with a different email provider
4. Contact the development team

---

**That's it!** Your email system is ready to use. 🎉


