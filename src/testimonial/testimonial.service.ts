import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { TestimonialQueryDto } from './dto/testimonial-query.dto';
import {
  TestimonialResponseDto,
  TestimonialListResponseDto,
} from './dto/testimonial-response.dto';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TestimonialService {
  constructor(private readonly db: DatabaseService) {}

  async create(createTestimonialDto: CreateTestimonialDto): Promise<TestimonialResponseDto> {
    try {
      const testimonial = await this.db.testimonial.create({
        data: createTestimonialDto,
      });

      return testimonial as TestimonialResponseDto;
    } catch (error) {
      this.handleException(error);
    }
  }

  async findAll(query: TestimonialQueryDto): Promise<TestimonialListResponseDto> {
    try {
      const {
        search,
        isActive,
        minRating,
        maxRating,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = query;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.TestimonialWhereInput = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (minRating !== undefined || maxRating !== undefined) {
        where.rating = {};
        if (minRating !== undefined) {
          where.rating.gte = minRating;
        }
        if (maxRating !== undefined) {
          where.rating.lte = maxRating;
        }
      }

      // Build order by clause
      const orderBy: Prisma.TestimonialOrderByWithRelationInput = {};
      orderBy[sortBy as keyof Prisma.TestimonialOrderByWithRelationInput] = sortOrder;

      // Get testimonials and total count
      const [testimonials, total] = await Promise.all([
        this.db.testimonial.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        this.db.testimonial.count({ where }),
      ]);

      // Get statistics
      const [
        totalTestimonials,
        activeTestimonials,
        inactiveTestimonials,
        averageRatingResult,
      ] = await Promise.all([
        this.db.testimonial.count(),
        this.db.testimonial.count({ where: { isActive: true } }),
        this.db.testimonial.count({ where: { isActive: false } }),
        this.db.testimonial.aggregate({
          _avg: {
            rating: true,
          },
          where: {
            rating: {
              not: null,
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);
      const averageRating = averageRatingResult._avg.rating || 0;

      return {
        testimonials: testimonials as TestimonialResponseDto[],
        total,
        page,
        limit,
        totalPages,
        statistics: {
          totalTestimonials,
          activeTestimonials,
          inactiveTestimonials,
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        },
      };
    } catch (error) {
      this.handleException(error);
    }
  }

  async findOne(id: number): Promise<TestimonialResponseDto> {
    try {
      const testimonial = await this.db.testimonial.findUnique({
        where: { id },
      });

      if (!testimonial) {
        throw new NotFoundException(`Testimonial with ID ${id} not found`);
      }

      return testimonial as TestimonialResponseDto;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
    }
  }

  async update(
    id: number,
    updateTestimonialDto: UpdateTestimonialDto,
  ): Promise<TestimonialResponseDto> {
    try {
      // Check if testimonial exists
      const existingTestimonial = await this.db.testimonial.findUnique({
        where: { id },
      });

      if (!existingTestimonial) {
        throw new NotFoundException(`Testimonial with ID ${id} not found`);
      }

      const testimonial = await this.db.testimonial.update({
        where: { id },
        data: updateTestimonialDto,
      });

      return testimonial as TestimonialResponseDto;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      // Check if testimonial exists
      const existingTestimonial = await this.db.testimonial.findUnique({
        where: { id },
      });

      if (!existingTestimonial) {
        throw new NotFoundException(`Testimonial with ID ${id} not found`);
      }

      await this.db.testimonial.delete({
        where: { id },
      });

      return { message: 'Testimonial deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
    }
  }

  async getActiveTestimonials(): Promise<TestimonialResponseDto[]> {
    try {
      const testimonials = await this.db.testimonial.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });

      return testimonials as TestimonialResponseDto[];
    } catch (error) {
      this.handleException(error);
    }
  }

  async toggleStatus(id: number): Promise<TestimonialResponseDto> {
    try {
      const existingTestimonial = await this.db.testimonial.findUnique({
        where: { id },
      });

      if (!existingTestimonial) {
        throw new NotFoundException(`Testimonial with ID ${id} not found`);
      }

      const testimonial = await this.db.testimonial.update({
        where: { id },
        data: { isActive: !existingTestimonial.isActive },
      });

      return testimonial as TestimonialResponseDto;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
    }
  }

  private handleException(error: any): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new BadRequestException('A testimonial with this data already exists');
        case 'P2025':
          throw new NotFoundException('Testimonial not found');
        default:
          throw new InternalServerErrorException('Database operation failed');
      }
    }
    throw new InternalServerErrorException('An unexpected error occurred');
  }
}
