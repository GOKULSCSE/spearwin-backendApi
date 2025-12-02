import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { ContactDto } from './dto/contact.dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('contact')
  @HttpCode(HttpStatus.OK)
  async sendContactEmail(
    @Body(ValidationPipe) contactDto: ContactDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.mailService.sendContactEmail(contactDto);
  }
}

