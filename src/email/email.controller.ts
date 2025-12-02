import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { SendMailDto } from './dto/send-mail.dto';
import { SendMailResponseDto } from './dto/send-mail-response.dto';
import { ContactDto } from './dto/contact.dto';


@Controller('mail')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendMail(@Body() sendMailDto: SendMailDto): Promise<SendMailResponseDto> {
    const { to, subject, text, html } = sendMailDto;

    // Validate that at least text or html is provided
    if (!text && !html) {
      throw new BadRequestException(
        'Either text or html content must be provided',
      );
    }

    const result = await this.emailService.sendMail(to, subject, text, html);

    if (!result.success) {
      throw new BadRequestException(
        result.error || 'Failed to send email',
      );
    }

    return {
      success: true,
      message: 'Email sent successfully',
      messageId: result.messageId,
    };
  }

  @Post('contact')
  @HttpCode(HttpStatus.OK)
  async sendContactEmail(@Body() contactDto: ContactDto) {
    const { email, phone, service, message, remarks } = contactDto;

    // Company email address
    const companyEmail = process.env.CONTACT_EMAIL || 'gokul03903@gmail.com';

    // Create email subject
    const subject = `New Contact Form Submission - ${service}`;

    // Create HTML email content
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #044185; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #044185; }
            .value { margin-top: 5px; padding: 10px; background-color: white; border-left: 3px solid #044185; }
            .footer { margin-top: 20px; padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Form Submission</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${email}</div>
              </div>
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value">${phone}</div>
              </div>
              <div class="field">
                <div class="label">Service:</div>
                <div class="value">${service}</div>
              </div>
              ${remarks ? `
              <div class="field">
                <div class="label">Additional Details:</div>
                <div class="value">${remarks}</div>
              </div>
              ` : ''}
              <div class="field">
                <div class="label">Message:</div>
                <div class="value">${message.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
            <div class="footer">
              <p>This email was sent from the Spearwin contact form.</p>
              <p>Please respond directly to: ${email}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Create plain text version
    const text = `
New Contact Form Submission

Email: ${email}
Phone: ${phone}
Service: ${service}
${remarks ? `Additional Details: ${remarks}\n` : ''}
Message:
${message}

---
This email was sent from the Spearwin contact form.
Please respond directly to: ${email}
    `.trim();

    // Send email
    const result = await this.emailService.sendMail(
      companyEmail,
      subject,
      text,
      html,
    );

    if (!result.success) {
      // Provide more user-friendly error messages
      let errorMessage = result.error || 'Failed to send contact email';
      
      // Check for Gmail authentication errors
      if (errorMessage.includes('Authentication Required') || errorMessage.includes('530-5.7.0')) {
        errorMessage = 'Email service authentication is required. Please configure SMTP credentials in the backend.';
      } else if (errorMessage.includes('EAUTH') || errorMessage.includes('Invalid login')) {
        errorMessage = 'Email authentication failed. Please check SMTP credentials.';
      } else if (errorMessage.includes('Access denied') || errorMessage.includes('Mail.Send')) {
        errorMessage = 'Email service configuration error. Please contact the administrator.';
      }
      
      throw new BadRequestException(errorMessage);
    }

    return {
      success: true,
      message: 'Contact form submitted successfully. We will get back to you soon!',
      messageId: result.messageId,
    };
  }
}

