import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe
} from '@nestjs/common';
import { JobAttributeService } from './job-attribute.service';
import { CreateJobAttributeDto } from './dto/create-job-attribute.dto';
import { UpdateJobAttributeDto } from './dto/update-job-attribute.dto';
import { CreateJobAttributeCategoryDto } from './dto/create-job-attribute-category.dto';
import { UpdateJobAttributeCategoryDto } from './dto/update-job-attribute-category.dto';
import { QueryJobAttributeDto } from './dto/query-job-attribute.dto';
import { QueryJobAttributeCategoryDto } from './dto/query-job-attribute-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { UserRole } from '@prisma/client';

@Controller('job-attributes')
// @UseGuards(JwtAuthGuard)
export class JobAttributeController {
  constructor(private readonly jobAttributeService: JobAttributeService) {}

  // Job Attribute Category Routes
  @Post('categories')
  // @UseGuards(JwtAuthGuard)
  async createCategory(@Body() createCategoryDto: CreateJobAttributeCategoryDto) {
    return {
      success: true,
      message: 'Category created successfully',
      data: await this.jobAttributeService.createCategory(createCategoryDto)
    };
  }

  @Get('categories')
  async findAllCategories(@Query() query: QueryJobAttributeCategoryDto) {
    return {
      success: true,
      message: 'Categories retrieved successfully',
      ...await this.jobAttributeService.findAllCategories(query)
    };
  }

  @Get('categories/with-attributes')
  async getCategoriesWithAttributes() {
    return {
      success: true,
      message: 'Categories with attributes retrieved successfully',
      data: await this.jobAttributeService.getCategoriesWithAttributes()
    };
  }

  @Get('categories/:id')
  async findCategoryById(@Param('id', ParseUUIDPipe) id: string) {
    return {
      success: true,
      message: 'Category retrieved successfully',
      data: await this.jobAttributeService.findCategoryById(id)
    };
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard)
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateJobAttributeCategoryDto
  ) {
    return {
      success: true,
      message: 'Category updated successfully',
      data: await this.jobAttributeService.updateCategory(id, updateCategoryDto)
    };
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    await this.jobAttributeService.deleteCategory(id);
    return {
      success: true,
      message: 'Category deleted successfully'
    };
  }

  // Job Attribute Routes
  @Post()
  @UseGuards(JwtAuthGuard)
  async createAttribute(@Body() createAttributeDto: CreateJobAttributeDto) {
    return {
      success: true,
      message: 'Attribute created successfully',
      data: await this.jobAttributeService.createAttribute(createAttributeDto)
    };
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  async bulkCreateAttributes(@Body() attributes: CreateJobAttributeDto[]) {
    return {
      success: true,
      message: 'Attributes created successfully',
      data: await this.jobAttributeService.bulkCreateAttributes(attributes)
    };
  }

  @Get()
  async findAllAttributes(@Query() query: QueryJobAttributeDto) {
    return {
      success: true,
      message: 'Attributes retrieved successfully',
      ...await this.jobAttributeService.findAllAttributes(query)
    };
  }

  @Get('by-category/:categoryId')
  async getAttributesByCategory(@Param('categoryId', ParseUUIDPipe) categoryId: string) {
    return {
      success: true,
      message: 'Attributes retrieved successfully',
      data: await this.jobAttributeService.getAttributesByCategory(categoryId)
    };
  }

  @Get(':id')
  async findAttributeById(@Param('id', ParseUUIDPipe) id: string) {
    return {
      success: true,
      message: 'Attribute retrieved successfully',
      data: await this.jobAttributeService.findAttributeById(id)
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateAttribute(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAttributeDto: UpdateJobAttributeDto
  ) {
    return {
      success: true,
      message: 'Attribute updated successfully',
      data: await this.jobAttributeService.updateAttribute(id, updateAttributeDto)
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAttribute(@Param('id', ParseUUIDPipe) id: string) {
    await this.jobAttributeService.deleteAttribute(id);
    return {
      success: true,
      message: 'Attribute deleted successfully'
    };
  }

  // Utility Routes
  @Post('initialize-categories')
  @UseGuards(JwtAuthGuard)
  async initializeDefaultCategories() {
    return {
      success: true,
      message: 'Default categories initialized successfully',
      data: await this.jobAttributeService.initializeDefaultCategories()
    };
  }
}

