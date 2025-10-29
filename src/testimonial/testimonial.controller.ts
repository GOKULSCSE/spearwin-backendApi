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
} from '@nestjs/common';
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
    @Body(ValidationPipe) createTestimonialDto: CreateTestimonialDto,
  ): Promise<TestimonialResponseDto> {
    return this.testimonialService.create(createTestimonialDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @GetCurrentUser() user: CurrentUser,
    @Query(ValidationPipe) query: TestimonialQueryDto,
  ): Promise<TestimonialListResponseDto> {
    return this.testimonialService.findAll(query);
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
    @Body(ValidationPipe) updateTestimonialDto: UpdateTestimonialDto,
  ): Promise<TestimonialResponseDto> {
    return this.testimonialService.update(id, updateTestimonialDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updatePartial(
    @GetCurrentUser() user: CurrentUser,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateTestimonialDto: UpdateTestimonialDto,
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
