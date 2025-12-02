import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private transporterReady: boolean = false;
  private readonly logger = new Logger(EmailService.name);
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiresAt: Date | null = null;
  private useGraphAPI: boolean = false;

  constructor() {
    this.axiosInstance = axios.create();
    this.initializeEmailService();
  }

  private async initializeEmailService() {
    // Check if Microsoft Graph API credentials are available
    const graphTenantId = process.env.GRAPH_TENANT_ID || process.env.MS_GRAPH_TENANT_ID;
    const graphClientId = process.env.GRAPH_CLIENT_ID || process.env.MS_GRAPH_CLIENT_ID;
    const graphClientSecret = process.env.GRAPH_CLIENT_SECRET || process.env.MS_GRAPH_CLIENT_SECRET;
    const graphUserEmail = process.env.GRAPH_USER_EMAIL || process.env.MS_GRAPH_USER_EMAIL;

    if (graphTenantId && graphClientId && graphClientSecret && graphUserEmail) {
      this.useGraphAPI = true;
      this.logger.log('📧 Using Microsoft Graph API for email sending');
      this.logger.log(`  Tenant ID: ${graphTenantId}`);
      this.logger.log(`  Client ID: ${graphClientId}`);
      this.logger.log(`  User Email: ${graphUserEmail}`);
      // Get initial access token
      await this.getAccessToken();
    } else {
      this.logger.log('📧 Using SMTP for email sending');
      this.initializeTransporter();
    }
  }

  /**
   * Get access token from Microsoft Graph API using client credentials flow
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiresAt && new Date() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const tenantId = process.env.GRAPH_TENANT_ID || process.env.MS_GRAPH_TENANT_ID;
    const clientId = process.env.GRAPH_CLIENT_ID || process.env.MS_GRAPH_CLIENT_ID;
    const clientSecret = process.env.GRAPH_CLIENT_SECRET || process.env.MS_GRAPH_CLIENT_SECRET;

    if (!tenantId || !clientId || !clientSecret) {
      throw new Error('Microsoft Graph API credentials not configured');
    }

    try {
      const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
      
      const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      });

      const response = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const token = response.data.access_token;
      if (!token) {
        throw new Error('Access token not received from Microsoft Graph API');
      }
      
      this.accessToken = token;
      // Set expiration time (subtract 5 minutes for safety)
      const expiresIn = response.data.expires_in || 3600;
      this.tokenExpiresAt = new Date(Date.now() + (expiresIn - 300) * 1000);

      this.logger.log('✅ Microsoft Graph API access token obtained');
      return token;
    } catch (error: any) {
      this.logger.error('❌ Failed to get Microsoft Graph API access token');
      this.logger.error(`   Error: ${error.message || error}`);
      if (error.response) {
        this.logger.error(`   Response: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  private async initializeTransporter() {
    try {
      // Support SMTP_*, MAIL_*, and EMAIL_* environment variables for maximum compatibility
      const mailHost = process.env.SMTP_HOST || process.env.MAIL_HOST || process.env.EMAIL_HOST;
      const mailUser = process.env.SMTP_USER || process.env.MAIL_USER || process.env.EMAIL_USER;
      // Remove spaces from password (Gmail App Passwords are 16 chars without spaces)
      const mailPass = (process.env.SMTP_PASS || process.env.MAIL_PASS || process.env.EMAIL_PASSWORD)?.replace(/\s/g, '');
      const mailPort = process.env.SMTP_PORT || process.env.MAIL_PORT || process.env.EMAIL_PORT || '587';
      const mailFrom = process.env.SMTP_FROM || process.env.MAIL_FROM || process.env.EMAIL_USER || mailUser;
      const mailSecure = process.env.SMTP_SECURE || process.env.MAIL_SECURE || process.env.EMAIL_SECURE || 'false';

      // Check if email environment variables are set
      if (!mailHost || !mailUser) {
        this.logger.error(
          '⚠️ Email environment variables not set. Email features will be disabled. ' +
          'Set SMTP_HOST and SMTP_USER (or MAIL_HOST and MAIL_USER, or EMAIL_HOST and EMAIL_USER) in your .env file.'
        );
        this.logger.error('Current env values:');
        this.logger.error(`  SMTP_HOST/MAIL_HOST: ${mailHost || 'NOT SET'}`);
        this.logger.error(`  SMTP_USER/MAIL_USER: ${mailUser || 'NOT SET'}`);
        this.transporterReady = false;
        return;
      }

      // Warn if password is not set (but allow initialization to proceed)
      if (!mailPass) {
        this.logger.warn(
          '⚠️ SMTP_PASS not set. Email sending may fail due to authentication requirements. ' +
          'For Gmail, you need to set SMTP_PASS with an App Password.'
        );
      }

      // Detect email provider based on host
      const isGmail = mailHost && (mailHost.includes('gmail.com') || mailHost.includes('google'));
      const isOutlook = mailHost && (mailHost.includes('office365.com') || mailHost.includes('outlook.com'));
      
      this.logger.log('📧 Initializing email transporter...');
      this.logger.log(`  Provider: ${isGmail ? 'Gmail' : isOutlook ? 'Outlook/Office365' : 'Custom SMTP'}`);
      this.logger.log(`  Host: ${mailHost}`);
      this.logger.log(`  Port: ${mailPort}`);
      this.logger.log(`  User: ${mailUser}`);
      this.logger.log(`  Secure: ${mailSecure}`);
      
      // Check for OAuth2 credentials (optional, for Office365)
      const oauth2ClientId = process.env.SMTP_OAUTH2_CLIENT_ID || process.env.MAIL_OAUTH2_CLIENT_ID || process.env.EMAIL_OAUTH2_CLIENT_ID;
      const oauth2ClientSecret = process.env.SMTP_OAUTH2_CLIENT_SECRET || process.env.MAIL_OAUTH2_CLIENT_SECRET || process.env.EMAIL_OAUTH2_CLIENT_SECRET;
      const oauth2RefreshToken = process.env.SMTP_OAUTH2_REFRESH_TOKEN || process.env.MAIL_OAUTH2_REFRESH_TOKEN || process.env.EMAIL_OAUTH2_REFRESH_TOKEN;
      const oauth2AccessToken = process.env.SMTP_OAUTH2_ACCESS_TOKEN || process.env.MAIL_OAUTH2_ACCESS_TOKEN || process.env.EMAIL_OAUTH2_ACCESS_TOKEN;

      // Determine authentication method
      const useOAuth2 = isOutlook && oauth2ClientId && oauth2ClientSecret && (oauth2RefreshToken || oauth2AccessToken);
      
      if (useOAuth2) {
        this.logger.log(`  Auth Method: OAuth2`);
      } else {
        this.logger.log(`  Auth Method: Password-based`);
      }

      // Build base transporter configuration
      const transporterConfig: any = {
        host: mailHost,
        port: parseInt(mailPort),
        secure: mailSecure === 'true', // true for 465, false for other ports
        auth: useOAuth2 ? {
          type: "OAuth2",
          user: mailUser,
          clientId: oauth2ClientId,
          clientSecret: oauth2ClientSecret,
          ...(oauth2RefreshToken && { refreshToken: oauth2RefreshToken }),
          ...(oauth2AccessToken && { accessToken: oauth2AccessToken }),
        } : mailPass ? {
          user: mailUser,
          pass: mailPass,
        } : undefined, // Allow no auth if password not set (will fail on send, but allows initialization)
      };

      // Add service for Outlook365 if using OAuth2
      if (useOAuth2 && isOutlook) {
        transporterConfig.service = "Outlook365";
      }

      // Gmail-specific configuration
      if (isGmail) {
        this.logger.log('  🔧 Applying Gmail SMTP configuration...');
        // Gmail works best with default settings, but ensure TLS
        transporterConfig.tls = {
          rejectUnauthorized: true,
          minVersion: 'TLSv1.2',
        };
        // Gmail requires STARTTLS on port 587
        if (parseInt(mailPort) === 587) {
          transporterConfig.requireTLS = true;
        }
      }
      
      // Outlook/Office365-specific configuration
      if (isOutlook) {
        this.logger.log('  🔧 Applying Outlook/Office365 SMTP configuration...');
        transporterConfig.tls = {
          rejectUnauthorized: false, // Allow self-signed certificates if needed
          minVersion: 'TLSv1.2',
        };
        // Use requireTLS for Office 365
        transporterConfig.requireTLS = true;
        // Office 365 may need specific connection pool settings
        transporterConfig.pool = true;
        transporterConfig.maxConnections = 1;
      }

      this.transporter = nodemailer.createTransport(transporterConfig);

      // Verify connection configuration (skip if no password is provided)
      if (!mailPass && !useOAuth2) {
        this.logger.warn('⚠️ Skipping SMTP verification (no password provided). Email sending will be attempted but may fail.');
        this.logger.warn('   Note: Gmail requires authentication. Add SMTP_PASS with an App Password for successful email sending.');
        this.transporterReady = true; // Mark as ready to allow sending attempts
      } else {
        try {
          await this.transporter.verify();
          this.logger.log('✅ Email transporter is ready to send emails');
          this.transporterReady = true;
        } catch (verifyError: any) {
          this.logger.error('❌ Email transporter verification failed:');
          this.logger.error(`   Error: ${verifyError.message || verifyError}`);
          this.logger.error(`   Code: ${verifyError.code || 'N/A'}`);
          this.logger.error(`   Command: ${verifyError.command || 'N/A'}`);
          if (verifyError.response) {
            this.logger.error(`   Response: ${verifyError.response}`);
          }
          
          // Provide provider-specific error guidance
          if (isOutlook && verifyError.response && verifyError.response.includes('SmtpClientAuthentication is disabled')) {
            this.logger.error('');
            this.logger.error('   ⚠️  SMTP AUTH is disabled for your Office 365 tenant.');
            this.logger.error('   📋 To fix this, you need to enable SMTP AUTH in Office 365 Admin Center:');
            this.logger.error('      1. Go to https://admin.microsoft.com');
            this.logger.error('      2. Navigate to Settings → Org settings → Mail');
            this.logger.error('      3. Find "SMTP AUTH" and enable it for your tenant');
            this.logger.error('      4. Or use PowerShell: Set-TransportConfig -SmtpClientAuthenticationDisabled $false');
            this.logger.error('   🔗 More info: https://aka.ms/smtp_auth_disabled');
            this.logger.error('');
          } else if (isGmail && verifyError.code === 'EAUTH') {
            this.logger.error('');
            this.logger.error('   ⚠️  Gmail authentication failed.');
            this.logger.error('   📋 Common solutions:');
            this.logger.error('      1. Make sure you\'re using an App Password, not your regular Gmail password');
            this.logger.error('      2. Enable 2-Step Verification in your Google Account');
            this.logger.error('      3. Generate a new App Password at: https://myaccount.google.com/apppasswords');
            this.logger.error('      4. Remove spaces from the App Password when pasting');
            this.logger.error('');
          }
          
          this.transporterReady = false;
          // Don't set transporter to null, but mark as not ready
          // This way we can still attempt to send and get better error messages
        }
      }
    } catch (error: any) {
      this.logger.error('❌ Failed to initialize email transporter:');
      this.logger.error(`   Error: ${error.message || error}`);
      this.logger.error(`   Stack: ${error.stack || 'N/A'}`);
      this.transporterReady = false;
    }
  }

  /**
   * Check if email transporter is ready to send emails
   */
  isTransporterReady(): boolean {
    if (this.useGraphAPI) {
      return !!this.accessToken;
    }
    return this.transporterReady && !!this.transporter;
  }

  /**
   * Send email using Microsoft Graph API
   */
  private async sendEmailViaGraphAPI(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
  ): Promise<boolean> {
    try {
      // Ensure we have a valid access token
      const accessToken = await this.getAccessToken();
      const userEmail = process.env.GRAPH_USER_EMAIL || process.env.MS_GRAPH_USER_EMAIL;

      if (!userEmail) {
        throw new Error('GRAPH_USER_EMAIL not configured');
      }

      const graphUrl = `https://graph.microsoft.com/v1.0/users/${userEmail}/sendMail`;
      
      // Get from name from environment or use default
      const fromName = process.env.GRAPH_FROM_NAME || process.env.MS_GRAPH_FROM_NAME || process.env.SMTP_FROM_NAME || process.env.MAIL_FROM_NAME || 'Spearwin';

      const emailPayload = {
        message: {
          subject: subject,
          body: {
            contentType: 'HTML',
            content: htmlContent,
          },
          toRecipients: [
            {
              emailAddress: {
                address: to,
              },
            },
          ],
        },
        saveToSentItems: true, // Save a copy to sent items
      };

      const response = await this.axiosInstance.post(graphUrl, emailPayload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(`✅ Email sent successfully via Microsoft Graph API to ${to}`);
      return true;
    } catch (error: any) {
      this.logger.error(`❌ Failed to send email via Microsoft Graph API to ${to}`);
      this.logger.error(`   Error: ${error.message || error}`);
      if (error.response) {
        this.logger.error(`   Status: ${error.response.status}`);
        this.logger.error(`   Response: ${JSON.stringify(error.response.data)}`);
        
        // Provide helpful error messages for common issues
        if (error.response.status === 403) {
          const errorData = error.response.data?.error;
          if (errorData?.code === 'ErrorAccessDenied') {
            this.logger.error(`   💡 Solution: The app needs 'Mail.Send' permission with admin consent.`);
            this.logger.error(`   💡 Go to Azure Portal → App registrations → API permissions → Add 'Mail.Send' (Application permission) → Grant admin consent`);
          }
        }
      }
      return false; // Return false instead of throwing
    }
  }

  async sendPasswordResetEmail(
    email: string,
    otpCode: string,
    expiresAt: Date,
  ): Promise<boolean> {
    // Use Microsoft Graph API if configured
    if (this.useGraphAPI) {
      const expiryMinutes = Math.round((expiresAt.getTime() - new Date().getTime()) / 60000);
      const htmlTemplate = this.getPasswordResetOTPTemplate(otpCode, expiryMinutes);
      const textContent = `
Reset Your Password

Hello,

You requested to reset your password. Use the OTP code below to verify your identity:

Your OTP Code: ${otpCode}

This code will expire in ${expiryMinutes} minutes.

Please enter this code in the OTP verification form to reset your password.

If you didn't request this, please ignore this email.

Best regards,
Spearwin Team
      `.trim();
      
      return await this.sendEmailViaGraphAPI(
        email,
        'Password Reset OTP - Spearwin',
        htmlTemplate,
        textContent,
      );
    }

    // Fallback to SMTP
    // Check if transporter exists
    if (!this.transporter) {
      this.logger.error('❌ Email transporter not initialized. Cannot send email.');
      this.logger.error('Please check your email configuration in .env file.');
      this.logger.error('Required variables: SMTP_HOST (or MAIL_HOST), SMTP_USER (or MAIL_USER), SMTP_PASS (or MAIL_PASS)');
      return false;
    }

    // Check if transporter is ready (verified)
    if (!this.transporterReady) {
      this.logger.warn('⚠️ Email transporter not verified. Attempting to send anyway...');
      this.logger.warn('This may fail if SMTP credentials are incorrect.');
    }

    try {
      // Calculate expiry time in minutes
      const now = new Date();
      const expiryMinutes = Math.round((expiresAt.getTime() - now.getTime()) / 60000);

      const mailFrom = process.env.SMTP_FROM || process.env.MAIL_FROM || process.env.EMAIL_USER || process.env.MAIL_USER;
      const mailFromName = process.env.SMTP_FROM_NAME || process.env.MAIL_FROM_NAME || process.env.EMAIL_FROM_NAME || 'Spearwin';
      
      this.logger.log(`📧 Attempting to send password reset OTP to: ${email}`);
      this.logger.log(`📧 OTP Code: ${otpCode}`);
      this.logger.log(`📧 OTP Code Length: ${otpCode.length} (should be 6 for password reset)`);
      this.logger.log(`📧 From: ${mailFromName} <${mailFrom}>`);
      this.logger.log(`📧 Expires in: ${expiryMinutes} minutes`);
      
      // Generate HTML template with OTP code (not link)
      const htmlTemplate = this.getPasswordResetOTPTemplate(otpCode, expiryMinutes);
      
      const mailOptions = {
        from: `"${mailFromName}" <${mailFrom}>`,
        to: email,
        subject: 'Password Reset OTP - Spearwin',
        html: htmlTemplate,
        text: `
Reset Your Password

Hello,

You requested to reset your password. Use the OTP code below to verify your identity:

Your OTP Code: ${otpCode}

This code will expire in ${expiryMinutes} minutes.

Please enter this code in the OTP verification form to reset your password.

If you didn't request this, please ignore this email.

Best regards,
Spearwin Team
        `.trim(),
      };

      this.logger.log(`📧 Sending email via SMTP...`);
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Password reset OTP email sent successfully to ${email}`);
      this.logger.log(`   Message ID: ${info.messageId}`);
      this.logger.log(`   Response: ${info.response || 'N/A'}`);
      this.logger.log(`   Accepted: ${info.accepted?.join(', ') || 'N/A'}`);
      if (info.rejected && info.rejected.length > 0) {
        this.logger.warn(`   Rejected: ${info.rejected.join(', ')}`);
      }
      return true;
    } catch (error: any) {
      this.logger.error(`❌ Failed to send password reset OTP email to ${email}`);
      this.logger.error(`   Error Type: ${error.constructor?.name || 'Unknown'}`);
      this.logger.error(`   Error Message: ${error.message || error}`);
      this.logger.error(`   Error Code: ${error.code || 'N/A'}`);
      if (error.response) {
        this.logger.error(`   SMTP Response: ${error.response}`);
      }
      if (error.responseCode) {
        this.logger.error(`   Response Code: ${error.responseCode}`);
      }
      if (error.command) {
        this.logger.error(`   Command: ${error.command}`);
      }
      if (error.stack) {
        this.logger.error(`   Stack: ${error.stack}`);
      }
      
      // Common error messages with solutions
      if (error.code === 'EAUTH') {
        this.logger.error('   💡 Solution: Check your SMTP_USER and SMTP_PASS credentials');
      } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
        this.logger.error('   💡 Solution: Check your SMTP_HOST and SMTP_PORT settings, and network connectivity');
      } else if (error.code === 'EENVELOPE') {
        this.logger.error('   💡 Solution: Check the recipient email address format');
      }
      
      return false;
    }
  }

  async sendVerificationEmail(
    email: string,
    verificationCode: string,
    expiresAt: Date,
    userId?: string,
  ): Promise<boolean> {
    // Use Microsoft Graph API if configured
    if (this.useGraphAPI) {
      const expiryHours = Math.round((expiresAt.getTime() - new Date().getTime()) / 3600000);
      const htmlTemplate = this.getEmailVerificationTemplate(verificationCode, expiryHours, userId);
      this.logger.log(`📧 Sending verification email with button. userId: ${userId}, hasButton: ${htmlTemplate.includes('Verify Email Address')}`);
      const textContent = `
Verify Your Email

Hello,

Thank you for registering with Spearwin!

Your verification code is: ${verificationCode}

This code will expire in ${expiryHours} hours.

Please enter this code to verify your email address.

Best regards,
Spearwin Team
      `.trim();
      
      return await this.sendEmailViaGraphAPI(
        email,
        'Verify Your Email - Spearwin',
        htmlTemplate,
        textContent,
      );
    }

    // Fallback to SMTP
    if (!this.transporter) {
      this.logger.warn('Email transporter not initialized. Cannot send email.');
      return false;
    }

    try {
      // Calculate expiry time in hours
      const now = new Date();
      const expiryHours = Math.round((expiresAt.getTime() - now.getTime()) / 3600000);

      const mailFrom = process.env.SMTP_FROM || process.env.MAIL_FROM || process.env.EMAIL_USER || process.env.MAIL_USER;
      const mailFromName = process.env.SMTP_FROM_NAME || process.env.MAIL_FROM_NAME || process.env.EMAIL_FROM_NAME || 'Spearwin';
      
      const htmlTemplate = this.getEmailVerificationTemplate(verificationCode, expiryHours, userId);
      this.logger.log(`📧 Sending verification email with button. userId: ${userId}, hasButton: ${htmlTemplate.includes('Verify Email Address')}`);
      
      const mailOptions = {
        from: `"${mailFromName}" <${mailFrom}>`,
        to: email,
        subject: 'Verify Your Email - Spearwin',
        html: htmlTemplate,
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
    // Use Microsoft Graph API if configured
    if (this.useGraphAPI) {
      const htmlTemplate = this.getWelcomeEmailTemplate(firstName);
      const textContent = `
Welcome to Spearwin!

Hi ${firstName},

Welcome to Spearwin! We're excited to have you on board.

Start exploring job opportunities and build your career with us.

Best regards,
Spearwin Team
      `.trim();
      
      return await this.sendEmailViaGraphAPI(
        email,
        'Welcome to Spearwin!',
        htmlTemplate,
        textContent,
      );
    }

    // Fallback to SMTP
    if (!this.transporter) {
      this.logger.warn('Email transporter not initialized. Cannot send email.');
      return false;
    }

    try {
      const mailFrom = process.env.SMTP_FROM || process.env.MAIL_FROM || process.env.EMAIL_USER || process.env.MAIL_USER;
      const mailFromName = process.env.SMTP_FROM_NAME || process.env.MAIL_FROM_NAME || process.env.EMAIL_FROM_NAME || 'Spearwin';
      
      const mailOptions = {
        from: `"${mailFromName}" <${mailFrom}>`,
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

  private getPasswordResetOTPTemplate(otpCode: string, expiryMinutes: number): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset OTP</title>
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
                You requested to reset your password. Use the OTP code below to verify your identity:
              </p>
              
              <!-- OTP Code -->
              <div style="background-color: #f8f9fa; border: 2px dashed #0A4CA6; border-radius: 8px; padding: 30px; margin: 30px 0; text-align: center;">
                <p style="color: #666666; margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">Your OTP Code:</p>
                <p style="color: #0A4CA6; font-size: 42px; font-weight: bold; letter-spacing: 12px; margin: 0; font-family: 'Courier New', monospace;">
                  ${otpCode}
                </p>
              </div>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  <strong>⏰ This code will expire in ${expiryMinutes} minutes.</strong>
                </p>
              </div>
              
              <p style="color: #666666; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px;">
                Please enter this code in the OTP verification form to reset your password.
              </p>
              
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

  private getEmailVerificationTemplate(verificationCode: string, expiryHours: number, userId?: string): string {
    // Build verification link - use backend API endpoint that will verify and redirect
    const backendUrl = process.env.BACKEND_URL || process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
    
    // Always create verification link - userId should always be provided (either user ID or pending registration ID)
    const verificationLink = userId 
      ? `${backendUrl}/api/auth/verify-email?token=${verificationCode}&userId=${userId}`
      : `${backendUrl}/api/auth/verify-email?token=${verificationCode}`;
    const frontendVerificationLink = userId
      ? `${frontendUrl}/verify-email?token=${verificationCode}&userId=${userId}`
      : `${frontendUrl}/verify-email?token=${verificationCode}`;
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
              
              <!-- Verification Button - Primary CTA -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${verificationLink}" 
                   style="display: inline-block; padding: 20px 60px; background: linear-gradient(135deg, #0A4CA6 0%, #013C7E 100%); color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 20px; font-weight: bold; box-shadow: 0 6px 20px rgba(10, 76, 166, 0.5); transition: all 0.3s ease; letter-spacing: 1px; border: none; cursor: pointer;">
                  ✓ Verify Email & Login to Dashboard
                </a>
              </div>
              
              <p style="color: #666666; line-height: 1.6; margin: 25px 0 20px 0; font-size: 17px; text-align: center; font-weight: 600;">
                Click the button above to verify your email address. You will be automatically logged into your dashboard!
              </p>
              
              <p style="color: #666666; line-height: 1.6; margin: 25px 0 0 0; font-size: 14px; text-align: center;">
                If the button doesn't work, you can copy and paste this link into your browser:<br>
                <a href="${verificationLink}" style="color: #0A4CA6; word-break: break-all; text-decoration: underline; margin-top: 5px; display: inline-block; font-size: 12px;">${verificationLink}</a>
              </p>

              <p style="color: #666666; line-height: 1.6; margin: 15px 0 0 0; font-size: 14px; text-align: center; font-style: italic;">
                ✨ After clicking the verify button, you'll be automatically logged into your dashboard - no need to enter your password!
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

  /**
   * Generic method to send an email
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param text - Plain text content (optional)
   * @param html - HTML content (optional)
   * @returns Promise with success status and message ID
   */
  async sendMail(
    to: string,
    subject: string,
    text?: string,
    html?: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Validate that at least text or html is provided
    if (!text && !html) {
      const errorMsg = 'Either text or html content must be provided';
      this.logger.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    // Use Microsoft Graph API if configured
    if (this.useGraphAPI) {
      try {
        const htmlContent = html || (text ? `<pre>${text}</pre>` : '');
        const success = await this.sendEmailViaGraphAPI(to, subject, htmlContent, text);
        return {
          success,
          messageId: success ? 'graph-api' : undefined,
          error: success ? undefined : 'Failed to send email via Microsoft Graph API',
        };
      } catch (error: any) {
        let errorMessage = 'Failed to send email via Microsoft Graph API';
        
        if (error.response) {
          const errorData = error.response.data?.error;
          if (error.response.status === 403 && errorData?.code === 'ErrorAccessDenied') {
            errorMessage = 'Access denied. The app needs Mail.Send permission with admin consent in Azure Portal.';
          } else if (error.response.status === 401) {
            errorMessage = 'Authentication failed. Please check your Graph API credentials.';
          } else {
            errorMessage = errorData?.message || error.response.data?.error_description || errorMessage;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.logger.error(`Error sending email via Graph API: ${errorMessage}`);
        return {
          success: false,
          error: errorMessage,
        };
      }
    }

    // Fallback to SMTP
    if (!this.transporter) {
      const errorMsg = 'Email transporter not initialized. Cannot send email.';
      this.logger.warn(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const mailFrom = process.env.SMTP_FROM || process.env.MAIL_FROM || process.env.EMAIL_USER || process.env.MAIL_USER;
      const mailFromName = process.env.SMTP_FROM_NAME || process.env.MAIL_FROM_NAME || process.env.EMAIL_FROM_NAME || 'Spearwin';

      const mailOptions = {
        from: `"${mailFromName}" <${mailFrom}>`,
        to,
        subject,
        ...(text && { text }),
        ...(html && { html }),
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error: any) {
      const errorMsg = `Failed to send email to ${to}: ${error.message}`;
      this.logger.error(errorMsg, error);
      return {
        success: false,
        error: errorMsg,
      };
    }
  }
}


