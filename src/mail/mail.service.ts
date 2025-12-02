import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { ContactDto } from './dto/contact.dto';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      const smtpConfig = {
        host: this.configService.get<string>('SMTP_HOST'),
        port: parseInt(this.configService.get<string>('SMTP_PORT') || '587'),
        secure: this.configService.get<string>('SMTP_SECURE') === 'true', // true for 465, false for other ports
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
        tls: {
          rejectUnauthorized: false, // Set to true in production with valid certificates
        },
      };

      // Validate required SMTP configuration
      if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
        this.logger.warn(
          'SMTP configuration is incomplete. Email functionality will be disabled.',
        );
        return;
      }

      this.transporter = nodemailer.createTransport(smtpConfig);

      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          this.logger.error('SMTP connection failed:', error);
        } else {
          this.logger.log('SMTP server is ready to send emails');
        }
      });
    } catch (error) {
      this.logger.error('Failed to initialize SMTP transporter:', error);
    }
  }

  async sendContactEmail(contactDto: ContactDto): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.transporter) {
        throw new InternalServerErrorException(
          'SMTP is not configured. Please check your environment variables.',
        );
      }

      const fromEmail = this.configService.get<string>('SMTP_FROM') || this.configService.get<string>('SMTP_USER');
      const toEmail = this.configService.get<string>('SMTP_TO') || this.configService.get<string>('SMTP_USER');
      const appName = this.configService.get<string>('APP_NAME') || 'SpearWin';

      // Email to admin/company
      const adminMailOptions = {
        from: `"${appName}" <${fromEmail}>`,
        to: toEmail,
        subject: `New Contact Form Submission - ${contactDto.service}`,
        html: this.getAdminEmailTemplate(contactDto),
      };

      // Email confirmation to user
      const userMailOptions = {
        from: `"${appName}" <${fromEmail}>`,
        to: contactDto.email,
        subject: `Thank you for contacting ${appName}`,
        html: this.getUserConfirmationTemplate(contactDto, appName),
      };

      // Send both emails
      await Promise.all([
        this.transporter.sendMail(adminMailOptions),
        this.transporter.sendMail(userMailOptions),
      ]);

      this.logger.log(`Contact email sent successfully from ${contactDto.email}`);

      return {
        success: true,
        message: 'Your message has been sent successfully. We will get back to you soon!',
      };
    } catch (error) {
      this.logger.error('Failed to send contact email:', error);
      throw new InternalServerErrorException(
        'Failed to send email. Please try again later.',
      );
    }
  }

  private getAdminEmailTemplate(contactDto: ContactDto): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; }
          .value { margin-top: 5px; padding: 10px; background-color: white; border-left: 3px solid #4CAF50; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Contact Form Submission</h2>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${contactDto.name || 'Not provided'}</div>
            </div>
            <div class="field">
              <div class="label">Email:</div>
              <div class="value">${contactDto.email}</div>
            </div>
            <div class="field">
              <div class="label">Phone:</div>
              <div class="value">${contactDto.phone}</div>
            </div>
            <div class="field">
              <div class="label">Service:</div>
              <div class="value">${contactDto.service}</div>
            </div>
            <div class="field">
              <div class="label">Message:</div>
              <div class="value">${contactDto.message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getUserConfirmationTemplate(contactDto: ContactDto, appName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Thank You for Contacting Us!</h2>
          </div>
          <div class="content">
            <p>Dear ${contactDto.name || 'Valued Customer'},</p>
            <p>Thank you for reaching out to ${appName}. We have received your message regarding <strong>${contactDto.service}</strong>.</p>
            <p>Our team will review your inquiry and get back to you as soon as possible.</p>
            <p><strong>Your Message:</strong></p>
            <p style="background-color: white; padding: 15px; border-left: 3px solid #4CAF50;">
              ${contactDto.message.replace(/\n/g, '<br>')}
            </p>
            <p>If you have any urgent questions, please feel free to contact us directly.</p>
            <p>Best regards,<br>The ${appName} Team</p>
          </div>
          <div class="footer">
            <p>This is an automated confirmation email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

