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

    // ============================================================
    // SEND EMAIL TO COMPANY (info@spearwin.com)
    // ============================================================
    const companyEmail = 'info@spearwin.com'; // Company receives contact form submissions
    
    const companyEmailHtml = this.buildCompanyNotificationEmail(email, phone, service, message, remarks);
    const companyEmailText = this.buildCompanyNotificationText(email, phone, service, message, remarks);
    
    const companyResult = await this.emailService.sendMail(
      companyEmail,
      `New Contact Form Submission - ${service}`,
      companyEmailText,
      companyEmailHtml,
    );

    // ============================================================
    // SEND CONFIRMATION EMAIL TO USER
    // ============================================================
    const userEmailHtml = this.buildUserConfirmationEmail(email, service);
    const userEmailText = this.buildUserConfirmationText(email, service);
    
    // Send to user (non-blocking - don't fail if this fails)
    this.emailService.sendMail(
      email,
      'Thank You for Contacting Spearwin',
      userEmailText,
      userEmailHtml,
    ).catch((error) => {
      console.error('Failed to send confirmation email to user:', error);
    });

    // ============================================================
    // VALIDATION & RESPONSE
    // ============================================================
    if (!companyResult.success) {
      let errorMessage = companyResult.error || 'Failed to send contact email';
      
      if (errorMessage.includes('Authentication Required') || errorMessage.includes('530-5.7.0')) {
        errorMessage = 'Email service authentication is required. Please configure SMTP credentials.';
      } else if (errorMessage.includes('EAUTH') || errorMessage.includes('Invalid login')) {
        errorMessage = 'Email authentication failed. Please check SMTP credentials.';
      } else if (errorMessage.includes('Access denied') || errorMessage.includes('Mail.Send')) {
        errorMessage = 'Email service configuration error. Please contact support.';
      }
      
      throw new BadRequestException(errorMessage);
    }

    return {
      success: true,
      message: 'Contact form submitted successfully. We will get back to you soon!',
      messageId: companyResult.messageId,
    };
  }

  // ============================================================
  // PRIVATE HELPER METHODS - EMAIL TEMPLATES
  // ============================================================

  private buildCompanyNotificationEmail(
    email: string,
    phone: string,
    service: string,
    message: string,
    remarks?: string,
  ): string {
    return `
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
  }

  private buildCompanyNotificationText(
    email: string,
    phone: string,
    service: string,
    message: string,
    remarks?: string,
  ): string {
    return `
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
  }

  private buildUserConfirmationEmail(email: string, service: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #044185; color: white; padding: 30px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; margin-top: 20px; }
            .message { margin-bottom: 20px; font-size: 16px; }
            .footer { margin-top: 30px; padding: 20px; text-align: center; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #044185; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You for Contacting Spearwin!</h1>
            </div>
            <div class="content">
              <div class="message">
                <p>Dear ${email.split('@')[0]},</p>
                <p>Thank you for reaching out to us! We have received your contact form submission regarding <strong>${service}</strong>.</p>
                <p>Our team has been notified and will review your message. We typically respond within 24-48 hours during business days.</p>
                <p>If you have any urgent questions, please feel free to contact us directly at <a href="mailto:info@spearwin.com">info@spearwin.com</a>.</p>
              </div>
              <div style="text-align: center;">
                <a href="https://spearwin.com" class="button">Visit Our Website</a>
              </div>
            </div>
            <div class="footer">
              <p>Best regards,<br>The Spearwin Team</p>
              <p>This is an automated confirmation email. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private buildUserConfirmationText(email: string, service: string): string {
    return `
Thank You for Contacting Spearwin!

Dear ${email.split('@')[0]},

Thank you for reaching out to us! We have received your contact form submission regarding ${service}.

Our team has been notified and will review your message. We typically respond within 24-48 hours during business days.

If you have any urgent questions, please feel free to contact us directly at info@spearwin.com.

Best regards,
The Spearwin Team

---
This is an automated confirmation email. Please do not reply to this email.
    `.trim();
  }
}

