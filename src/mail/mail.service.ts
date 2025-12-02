import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ContactDto } from './dto/contact.dto';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private configService: ConfigService) {
    this.initializeGraphAPI();
  }

  private async initializeGraphAPI() {
    try {
      const tenantId = this.configService.get<string>('GRAPH_TENANT_ID');
      const clientId = this.configService.get<string>('GRAPH_CLIENT_ID');
      const clientSecret = this.configService.get<string>('GRAPH_CLIENT_SECRET');

      if (!tenantId || !clientId || !clientSecret) {
        this.logger.warn(
          'Microsoft Graph API configuration is incomplete. Email functionality will be disabled.',
        );
        return;
      }

      this.logger.log('Microsoft Graph API configuration loaded successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Microsoft Graph API:', error);
    }
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken as string;
    }

    try {
      const tenantId = this.configService.get<string>('GRAPH_TENANT_ID');
      const clientId = this.configService.get<string>('GRAPH_CLIENT_ID');
      const clientSecret = this.configService.get<string>('GRAPH_CLIENT_SECRET');

      if (!tenantId || !clientId || !clientSecret) {
        throw new Error('Microsoft Graph API credentials are not configured');
      }

      const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

      const params = new URLSearchParams();
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('scope', 'https://graph.microsoft.com/.default');
      params.append('grant_type', 'client_credentials');

      const response = await axios.post(tokenUrl, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      this.accessToken = response.data.access_token;
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

      this.logger.log('Successfully obtained Microsoft Graph API access token');
      return this.accessToken as string;
    } catch (error) {
      this.logger.error('Failed to obtain access token:', error);
      throw new InternalServerErrorException(
        'Failed to authenticate with Microsoft Graph API',
      );
    }
  }

  async sendContactEmail(contactDto: ContactDto): Promise<{ success: boolean; message: string }> {
    const fromEmail =
      this.configService.get<string>('GRAPH_USER_EMAIL') ||
      this.configService.get<string>('SMTP_FROM');
    const fromName =
      this.configService.get<string>('GRAPH_FROM_NAME') ||
      this.configService.get<string>('APP_NAME') ||
      'SpearWin';
    const toEmail = this.configService.get<string>('SMTP_TO') || fromEmail;
    const appName = this.configService.get<string>('APP_NAME') || 'SpearWin';

    try {
      const accessToken = await this.getAccessToken();

      if (!fromEmail) {
        throw new InternalServerErrorException(
          'Email sender is not configured. Please check your environment variables.',
        );
      }

      // Email to admin/company
      const adminMessageBody = {
        contentType: 'HTML' as const,
        content: this.getAdminEmailTemplate(contactDto),
      };

      const adminMessageRecipients = [
        {
          emailAddress: {
            address: toEmail,
          },
        },
      ];

      const adminMessage = {
        message: {
          subject: `New Contact Form Submission - ${contactDto.service}`,
          body: adminMessageBody,
          toRecipients: adminMessageRecipients,
        },
        saveToSentItems: true,
      };

      // Email confirmation to user
      const userMessageBody = {
        contentType: 'HTML' as const,
        content: this.getUserConfirmationTemplate(contactDto, appName),
      };

      const userMessageRecipients = [
        {
          emailAddress: {
            address: contactDto.email,
          },
        },
      ];

      const userMessage = {
        message: {
          subject: `Thank you for contacting ${appName}`,
          body: userMessageBody,
          toRecipients: userMessageRecipients,
        },
        saveToSentItems: true,
      };

      // Send both emails using Microsoft Graph API
      const graphApiUrl = `https://graph.microsoft.com/v1.0/users/${fromEmail}/sendMail`;

      await Promise.all([
        axios.post(
          graphApiUrl,
          adminMessage,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
        axios.post(
          graphApiUrl,
          userMessage,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      ]);

      this.logger.log(`Contact email sent successfully from ${contactDto.email}`);

      return {
        success: true,
        message: 'Your message has been sent successfully. We will get back to you soon!',
      };
    } catch (error: any) {
      this.logger.error('Failed to send contact email:', error);
      if (error.response) {
        this.logger.error('Graph API error response:', JSON.stringify(error.response.data, null, 2));
        this.logger.error('Graph API error status:', error.response.status);
        this.logger.error('Graph API error headers:', error.response.headers);
        
        // Provide more specific error messages
        const errorData = error.response.data;
        if (errorData?.error?.code === 'ErrorMailSendDisabled') {
          throw new InternalServerErrorException(
            'Mail sending is disabled for this user. Please enable it in Microsoft 365 admin center.',
          );
        } else if (errorData?.error?.code === 'ErrorAccessDenied' || errorData?.error?.message?.includes('Insufficient privileges')) {
          throw new InternalServerErrorException(
            'Insufficient privileges. Please ensure Mail.Send permission is granted and admin consent is provided in Azure AD.',
          );
        } else if (errorData?.error?.code === 'Request_ResourceNotFound' || errorData?.error?.message?.includes('User not found')) {
          throw new InternalServerErrorException(
            `User ${fromEmail} not found in Azure AD. Please verify the email address exists.`,
          );
        } else if (errorData?.error) {
          throw new InternalServerErrorException(
            `Graph API Error: ${errorData.error.code || 'Unknown'} - ${errorData.error.message || 'Please check the logs for details.'}`,
          );
        }
      }
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
