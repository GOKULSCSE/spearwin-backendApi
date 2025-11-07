# Email Module Documentation

A complete NestJS email sending module using Nodemailer with support for multiple email providers.

## Features

- ✅ Generic `sendMail` method for sending emails
- ✅ RESTful API endpoint (`POST /mail/send`)
- ✅ Support for both plain text and HTML emails
- ✅ Environment variable configuration
- ✅ Gmail SMTP support with App Password
- ✅ Backward compatibility with existing EMAIL_* variables
- ✅ TypeScript with full type safety
- ✅ Input validation using class-validator

## Environment Variables

The module supports both `MAIL_*` and `EMAIL_*` environment variables for backward compatibility.

### Required Variables

```env
# Mail Configuration (Primary - Recommended)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=your-email@gmail.com

# Optional Variables
MAIL_FROM_NAME=Spearwin
MAIL_SECURE=false  # true for port 465, false for port 587
```

### Backward Compatibility

The module also supports the old `EMAIL_*` format:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=Spearwin
EMAIL_SECURE=false
```

## Gmail SMTP Setup

### Step 1: Enable 2-Step Verification

1. Go to your [Google Account](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification**
3. Enable 2-Step Verification if not already enabled

### Step 2: Generate App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter "NestJS App" or any name you prefer
5. Click **Generate**
6. Copy the 16-character password (no spaces)

### Step 3: Configure .env

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=xxxx xxxx xxxx xxxx  # Use the 16-character app password (remove spaces)
MAIL_FROM=your-email@gmail.com
MAIL_FROM_NAME=Your App Name
MAIL_SECURE=false
```

## API Usage

### Endpoint

```
POST /mail/send
```

### Request Body

```json
{
  "to": "recipient@example.com",
  "subject": "Test Email",
  "text": "This is a plain text email",
  "html": "<h1>This is an HTML email</h1><p>With rich formatting</p>"
}
```

**Note:** Either `text` or `html` (or both) must be provided.

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "<message-id@mail.gmail.com>"
}
```

**Error (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Either text or html content must be provided",
  "error": "Bad Request"
}
```

## Example Requests

### cURL

```bash
curl -X POST http://localhost:5000/mail/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Hello from NestJS",
    "text": "This is a test email sent from NestJS using Nodemailer.",
    "html": "<h1>Hello!</h1><p>This is a test email sent from <strong>NestJS</strong> using <em>Nodemailer</em>.</p>"
  }'
```

### JavaScript/TypeScript

```typescript
const response = await fetch('http://localhost:5000/mail/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: 'recipient@example.com',
    subject: 'Hello from NestJS',
    text: 'This is a plain text email',
    html: '<h1>Hello!</h1><p>This is an HTML email</p>',
  }),
});

const result = await response.json();
console.log(result);
```

### Using EmailService Directly

```typescript
import { EmailService } from './email/email.service';

// In your service
constructor(private readonly emailService: EmailService) {}

async sendNotification() {
  const result = await this.emailService.sendMail(
    'user@example.com',
    'Welcome!',
    'Welcome to our platform',
    '<h1>Welcome!</h1><p>Welcome to our platform</p>'
  );
  
  if (result.success) {
    console.log('Email sent:', result.messageId);
  }
}
```

## Other Email Providers

### Outlook/Hotmail

```env
MAIL_HOST=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_USER=your-email@outlook.com
MAIL_PASS=your-password
MAIL_SECURE=false
```

### Yahoo Mail

```env
MAIL_HOST=smtp.mail.yahoo.com
MAIL_PORT=587
MAIL_USER=your-email@yahoo.com
MAIL_PASS=your-app-password
MAIL_SECURE=false
```

### Custom SMTP Server

```env
MAIL_HOST=smtp.yourdomain.com
MAIL_PORT=587
MAIL_USER=your-username
MAIL_PASS=your-password
MAIL_FROM=noreply@yourdomain.com
MAIL_SECURE=false
```

## Module Structure

```
src/email/
├── email.module.ts          # Module definition
├── email.service.ts         # Email service with sendMail method
├── email.controller.ts      # REST API controller
├── dto/
│   ├── send-mail.dto.ts     # Request DTO with validation
│   └── send-mail-response.dto.ts  # Response DTO
└── README.md                # This file
```

## Error Handling

The module handles various error scenarios:

- **Missing environment variables**: Logs warning and disables email features
- **Invalid email address**: Returns 400 Bad Request
- **Missing content**: Returns 400 Bad Request if neither text nor html is provided
- **SMTP connection errors**: Logs error and returns failure response

## Production Considerations

1. **Rate Limiting**: Consider adding rate limiting to the `/mail/send` endpoint
2. **Queue System**: For high-volume applications, use a queue system (Bull, RabbitMQ)
3. **Email Templates**: Use a templating engine (Handlebars, EJS) for complex emails
4. **Monitoring**: Add logging and monitoring for email delivery
5. **Security**: Use environment variables, never hardcode credentials
6. **Validation**: Always validate email addresses and content before sending

## Testing

Test the endpoint using:

```bash
# Test with text only
curl -X POST http://localhost:5000/mail/send \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","text":"Hello World"}'

# Test with HTML
curl -X POST http://localhost:5000/mail/send \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","html":"<h1>Hello</h1>"}'
```

## License

Part of the Spearwin backend API.

