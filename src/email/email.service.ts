import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      // Check if email environment variables are set
      if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        this.logger.warn(
          'Email environment variables not set. Email features will be disabled. ' +
          'Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD in your .env file.'
        );
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          this.logger.error('Email transporter verification failed:', error);
        } else {
          this.logger.log('Email transporter is ready to send emails');
        }
      });
    } catch (error) {
      this.logger.error('Failed to initialize email transporter:', error);
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    expiresAt: Date,
  ): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Email transporter not initialized. Cannot send email.');
      return false;
    }

    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
      
      // Calculate expiry time in minutes
      const now = new Date();
      const expiryMinutes = Math.round((expiresAt.getTime() - now.getTime()) / 60000);

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Spearwin'}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Reset Your Password - Spearwin',
        html: this.getPasswordResetTemplate(resetLink, expiryMinutes),
        text: `
Reset Your Password

Hello,

You requested to reset your password. Click the link below to reset it:

${resetLink}

This link will expire in ${expiryMinutes} minutes.

If you didn't request this, please ignore this email.

Best regards,
Spearwin Team
        `.trim(),
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent successfully to ${email}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      return false;
    }
  }

  async sendVerificationEmail(
    email: string,
    verificationCode: string,
    expiresAt: Date,
  ): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Email transporter not initialized. Cannot send email.');
      return false;
    }

    try {
      // Calculate expiry time in hours
      const now = new Date();
      const expiryHours = Math.round((expiresAt.getTime() - now.getTime()) / 3600000);

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Spearwin'}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Email - Spearwin',
        html: this.getEmailVerificationTemplate(verificationCode, expiryHours),
        text: `
Verify Your Email

Hello,

Thank you for registering with Spearwin!

Your verification code is: ${verificationCode}

This code will expire in ${expiryHours} hours.

Please enter this code to verify your email address.

Best regards,
Spearwin Team
        `.trim(),
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent successfully to ${email}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}:`, error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Email transporter not initialized. Cannot send email.');
      return false;
    }

    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Spearwin'}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to Spearwin!',
        html: this.getWelcomeEmailTemplate(firstName),
        text: `
Welcome to Spearwin!

Hi ${firstName},

Welcome to Spearwin! We're excited to have you on board.

Start exploring job opportunities and build your career with us.

Best regards,
Spearwin Team
        `.trim(),
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent successfully to ${email}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      return false;
    }
  }

  private getPasswordResetTemplate(resetLink: string, expiryMinutes: number): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0A4CA6 0%, #013C7E 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Spearwin</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">Excellence Through People</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Reset Your Password</h2>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                Hello,
              </p>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              
              <!-- Button -->
              <table cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center" style="border-radius: 4px; background-color: #0A4CA6;">
                    <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #666666; line-height: 1.6; margin: 0 0 10px 0; font-size: 14px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="color: #0A4CA6; line-height: 1.6; margin: 0 0 20px 0; font-size: 14px; word-break: break-all;">
                ${resetLink}
              </p>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  <strong>⏰ This link will expire in ${expiryMinutes} minutes.</strong>
                </p>
              </div>
              
              <p style="color: #666666; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px;">
                If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #6c757d; margin: 0 0 10px 0; font-size: 14px;">
                Best regards,<br>
                <strong>Spearwin Team</strong>
              </p>
              <p style="color: #6c757d; margin: 0; font-size: 12px;">
                This is an automated email, please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  private getEmailVerificationTemplate(verificationCode: string, expiryHours: number): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0A4CA6 0%, #013C7E 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Spearwin</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">Excellence Through People</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Verify Your Email Address</h2>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                Thank you for registering with Spearwin!
              </p>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                Your verification code is:
              </p>
              
              <!-- Verification Code -->
              <div style="background-color: #f8f9fa; border: 2px dashed #0A4CA6; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                <p style="color: #0A4CA6; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0;">
                  ${verificationCode}
                </p>
              </div>
              
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 14px;">
                Please enter this code to verify your email address and complete your registration.
              </p>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  <strong>⏰ This code will expire in ${expiryHours} hours.</strong>
                </p>
              </div>
              
              <p style="color: #666666; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px;">
                If you didn't create an account, please ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #6c757d; margin: 0 0 10px 0; font-size: 14px;">
                Best regards,<br>
                <strong>Spearwin Team</strong>
              </p>
              <p style="color: #6c757d; margin: 0; font-size: 12px;">
                This is an automated email, please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  private getWelcomeEmailTemplate(firstName: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Spearwin</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0A4CA6 0%, #013C7E 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to Spearwin!</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">Excellence Through People</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hi ${firstName}! 👋</h2>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                We're excited to have you join Spearwin! You're now part of a community dedicated to connecting talented individuals with amazing career opportunities.
              </p>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                Here's what you can do next:
              </p>
              
              <ul style="color: #666666; line-height: 1.8; margin: 0 0 20px 0; font-size: 16px; padding-left: 20px;">
                <li>Complete your profile to stand out to employers</li>
                <li>Browse and apply for job opportunities</li>
                <li>Set up job alerts for your preferred roles</li>
                <li>Connect with top companies hiring now</li>
              </ul>
              
              <table cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center" style="border-radius: 4px; background-color: #0A4CA6;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" target="_blank" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #666666; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px;">
                If you have any questions, feel free to reach out to our support team.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #6c757d; margin: 0 0 10px 0; font-size: 14px;">
                Best regards,<br>
                <strong>Spearwin Team</strong>
              </p>
              <p style="color: #6c757d; margin: 0; font-size: 12px;">
                This is an automated email, please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
}


