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
}

