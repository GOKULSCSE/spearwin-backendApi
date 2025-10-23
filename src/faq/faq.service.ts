import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import {
  FaqResponseDto,
  FaqListQueryDto,
  FaqListResponseDto,
} from './dto/faq-response.dto';

@Injectable()
export class FaqService {
  constructor(private readonly db: DatabaseService) {}

  private handleException(error: any): void {
    if (error instanceof NotFoundException || error instanceof BadRequestException) {
      throw error;
    }
    throw new InternalServerErrorException('Internal server error');
  }

  // =================================================================
  // FAQ MANAGEMENT
  // =================================================================

  async createFaq(createFaqDto: CreateFaqDto, userId: string): Promise<FaqResponseDto> {
    try {
      const faq = await this.db.fAQ.create({
        data: {
          question: createFaqDto.question,
          answer: createFaqDto.answer,
          active: createFaqDto.active ?? false,
        },
      });

      return {
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        active: faq.active,
        createdAt: faq.createdAt,
        updatedAt: faq.updatedAt,
      };
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async getAllFaqs(query: FaqListQueryDto): Promise<FaqListResponseDto> {
    try {
      const limit = query.limit || 10;
      const offset = query.offset || 0;
      const search = query.search?.trim();
      const sortBy = query.sortBy || 'createdAt';
      const sortOrder = query.sortOrder || 'desc';

      // Build where clause
      const where: any = {};

      // Add search filter
      if (search) {
        where.OR = [
          { question: { contains: search, mode: 'insensitive' } },
          { answer: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Add active filter
      if (query.active !== undefined) {
        where.active = query.active;
      }

      // Build orderBy clause
      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      // Get total count and FAQs
      const [total, faqs] = await Promise.all([
        this.db.fAQ.count({ where }),
        this.db.fAQ.findMany({
          where,
          orderBy,
          skip: offset,
          take: limit,
        }),
      ]);

      return {
        faqs: faqs.map((faq) => ({
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          active: faq.active,
          createdAt: faq.createdAt,
          updatedAt: faq.updatedAt,
        })),
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      };
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async getFaqById(faqId: string): Promise<FaqResponseDto> {
    try {
      const faq = await this.db.fAQ.findUnique({
        where: { id: parseInt(faqId) },
      });

      if (!faq) {
        throw new NotFoundException(`FAQ with ID ${faqId} not found`);
      }

      return {
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        active: faq.active,
        createdAt: faq.createdAt,
        updatedAt: faq.updatedAt,
      };
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async updateFaq(faqId: string, updateFaqDto: UpdateFaqDto, userId: string): Promise<FaqResponseDto> {
    try {
      const id = parseInt(faqId);
      if (isNaN(id)) {
        throw new BadRequestException('Invalid FAQ ID');
      }

      // Check if FAQ exists
      const existingFaq = await this.db.fAQ.findUnique({
        where: { id },
      });

      if (!existingFaq) {
        throw new NotFoundException(`FAQ with ID ${faqId} not found`);
      }

      // Prepare update data
      const updateData: any = {};
      if (updateFaqDto.question !== undefined) updateData.question = updateFaqDto.question;
      if (updateFaqDto.answer !== undefined) updateData.answer = updateFaqDto.answer;
      if (updateFaqDto.active !== undefined) updateData.active = updateFaqDto.active;

      // Update the FAQ
      const updatedFaq = await this.db.fAQ.update({
        where: { id },
        data: updateData,
      });

      return {
        id: updatedFaq.id,
        question: updatedFaq.question,
        answer: updatedFaq.answer,
        active: updatedFaq.active,
        createdAt: updatedFaq.createdAt,
        updatedAt: updatedFaq.updatedAt,
      };
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async deleteFaq(faqId: string, userId: string): Promise<{ message: string }> {
    try {
      const id = parseInt(faqId);
      if (isNaN(id)) {
        throw new BadRequestException('Invalid FAQ ID');
      }

      // Check if FAQ exists
      const existingFaq = await this.db.fAQ.findUnique({
        where: { id },
      });

      if (!existingFaq) {
        throw new NotFoundException(`FAQ with ID ${faqId} not found`);
      }

      // Delete the FAQ
      await this.db.fAQ.delete({
        where: { id },
      });

      return {
        message: `FAQ "${existingFaq.question}" has been deleted successfully`,
      };
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }
}
