import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { TestimonialService } from './testimonial.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { TestimonialQueryDto } from './dto/testimonial-query.dto';
import {
  TestimonialResponseDto,
  TestimonialListResponseDto,
} from './dto/testimonial-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  GetCurrentUser,
  type CurrentUser,
} from '../auth/decorators/current-user.decorator';

@Controller('testimonials')
export class TestimonialController {
  constructor(private readonly testimonialService: TestimonialService) {}

  // =================================================================
  // PUBLIC ENDPOINTS (No authentication required)
  // =================================================================

  @Get('active')
  async getActiveTestimonials(): Promise<TestimonialResponseDto[]> {
    return this.testimonialService.getActiveTestimonials();
  }

  // =================================================================
  // PROTECTED ENDPOINTS (Authentication required)
  // =================================================================

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @GetCurrentUser() user: CurrentUser,
    @Body(new ValidationPipe({ transform: true })) createTestimonialDto: CreateTestimonialDto,
  ): Promise<TestimonialResponseDto> {
    return this.testimonialService.create(createTestimonialDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @GetCurrentUser() user: CurrentUser,
    @Req() req: Request,
    @Query(new ValidationPipe({ transform: true, transformOptions: { enableImplicitConversion: false } })) query: TestimonialQueryDto,
  ): Promise<TestimonialListResponseDto> {
    // Fix: Get raw query parameter to handle "false" string correctly
    const rawIsActive = req.query.isActive as string | undefined;
    if (rawIsActive !== undefined) {
      // Override the query.isActive with correct boolean conversion
      if (rawIsActive === 'false' || rawIsActive === '0') {
        query.isActive = false;
      } else if (rawIsActive === 'true' || rawIsActive === '1') {
        query.isActive = true;
      }
    }
    
    console.log('[Backend Controller] Raw query isActive:', rawIsActive);
    console.log('[Backend Controller] Received query params:', JSON.stringify(query, null, 2));
    console.log('[Backend Controller] isActive value:', query.isActive, 'Type:', typeof query.isActive);
    const result = await this.testimonialService.findAll(query);
    console.log('[Backend Controller] Returning testimonials count:', result.testimonials.length);
    console.log('[Backend Controller] Returning testimonials isActive values:', result.testimonials.map(t => ({ id: t.id, isActive: t.isActive })));
    return result;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @GetCurrentUser() user: CurrentUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TestimonialResponseDto> {
    return this.testimonialService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @GetCurrentUser() user: CurrentUser,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true })) updateTestimonialDto: UpdateTestimonialDto,
  ): Promise<TestimonialResponseDto> {
    return this.testimonialService.update(id, updateTestimonialDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updatePartial(
    @GetCurrentUser() user: CurrentUser,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true })) updateTestimonialDto: UpdateTestimonialDto,
  ): Promise<TestimonialResponseDto> {
    return this.testimonialService.update(id, updateTestimonialDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @GetCurrentUser() user: CurrentUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.testimonialService.remove(id);
  }

  @Put(':id/toggle-status')
  @UseGuards(JwtAuthGuard)
  async toggleStatus(
    @GetCurrentUser() user: CurrentUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TestimonialResponseDto> {
    return this.testimonialService.toggleStatus(id);
  }
}
