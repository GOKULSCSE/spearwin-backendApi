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
} from '@nestjs/common';
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
@UseGuards(JwtAuthGuard)
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  // =================================================================
  // FAQ MANAGEMENT
  // =================================================================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createFaq(
    @Body(ValidationPipe) createFaqDto: CreateFaqDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<FaqResponseDto> {
    return this.faqService.createFaq(createFaqDto, user.id);
  }

  @Get()
  async getAllFaqs(
    @Query(ValidationPipe) query: FaqListQueryDto,
  ): Promise<FaqListResponseDto> {
    return this.faqService.getAllFaqs(query);
  }

  @Get(':id')
  async getFaqById(
    @Param('id') faqId: string,
  ): Promise<FaqResponseDto> {
    return this.faqService.getFaqById(faqId);
  }

  @Put(':id')
  async updateFaq(
    @Param('id') faqId: string,
    @Body(ValidationPipe) updateFaqDto: UpdateFaqDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<FaqResponseDto> {
    return this.faqService.updateFaq(faqId, updateFaqDto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteFaq(
    @Param('id') faqId: string,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<{ message: string }> {
    return this.faqService.deleteFaq(faqId, user.id);
  }
}
