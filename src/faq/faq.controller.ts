import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import {
  FaqResponseDto,
  FaqListQueryDto,
  FaqListResponseDto,
} from './dto/faq-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/admin/faqs')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  // =================================================================
  // FAQ MANAGEMENT
  // =================================================================

  // Public: Get all FAQs (no authentication required)
  @Get()
  async getAllFaqs(
    @Req() req: Request,
    @Query(new ValidationPipe({ transform: true, transformOptions: { enableImplicitConversion: false } })) query: FaqListQueryDto,
  ): Promise<FaqListResponseDto> {
    // Fix: Get raw query parameter to handle "false" string correctly
    const rawActive = req.query.active as string | undefined;
    if (rawActive !== undefined) {
      // Override the query.active with correct boolean conversion
      if (rawActive === 'false' || rawActive === '0') {
        query.active = false;
      } else if (rawActive === 'true' || rawActive === '1') {
        query.active = true;
      }
    }
    
    console.log('[FAQ Controller] Raw query active:', rawActive);
    console.log('[FAQ Controller] Received query params:', JSON.stringify(query, null, 2));
    console.log('[FAQ Controller] active value:', query.active, 'Type:', typeof query.active);
    return this.faqService.getAllFaqs(query);
  }

  // Public: Get FAQ by ID (no authentication required)
  @Get(':id')
  async getFaqById(
    @Param('id') faqId: string,
  ): Promise<FaqResponseDto> {
    return this.faqService.getFaqById(faqId);
  }

  // Protected: Create FAQ (authentication required)
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createFaq(
    @Body(new ValidationPipe({ transform: true })) createFaqDto: CreateFaqDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<FaqResponseDto> {
    return this.faqService.createFaq(createFaqDto, user.id);
  }

  // Protected: Update FAQ (authentication required)
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateFaq(
    @Param('id') faqId: string,
    @Body(new ValidationPipe({ transform: true })) updateFaqDto: UpdateFaqDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<FaqResponseDto> {
    return this.faqService.updateFaq(faqId, updateFaqDto, user.id);
  }

  // Protected: Delete FAQ (authentication required)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteFaq(
    @Param('id') faqId: string,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<{ message: string }> {
    return this.faqService.deleteFaq(faqId, user.id);
  }
}
