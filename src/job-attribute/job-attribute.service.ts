import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateJobAttributeDto } from './dto/create-job-attribute.dto';
import { UpdateJobAttributeDto } from './dto/update-job-attribute.dto';
import { CreateJobAttributeCategoryDto } from './dto/create-job-attribute-category.dto';
import { UpdateJobAttributeCategoryDto } from './dto/update-job-attribute-category.dto';
import { QueryJobAttributeDto } from './dto/query-job-attribute.dto';
import { QueryJobAttributeCategoryDto } from './dto/query-job-attribute-category.dto';
@Injectable()
export class JobAttributeService {
  constructor(private prisma: DatabaseService) {}

  // Job Attribute Category Methods
  async createCategory(createCategoryDto: CreateJobAttributeCategoryDto) {
    try {
      // Check if category with same name already exists
      const existingCategory = await this.prisma.jobAttributeCategory.findUnique({
        where: { name: createCategoryDto.name }
      });

      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }

      return await this.prisma.jobAttributeCategory.create({
        data: createCategoryDto,
        include: {
          attributes: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
          }
        }
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create category');
    }
  }

  async findAllCategories(query: QueryJobAttributeCategoryDto) {
    const { page = 1, limit = 10, search, isActive, sortBy = 'sortOrder', sortOrder = 'asc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [categories, total] = await Promise.all([
      this.prisma.jobAttributeCategory.findMany({
        where,
        include: {
          attributes: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
          },
          _count: {
            select: { attributes: true }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      this.prisma.jobAttributeCategory.count({ where })
    ]);

    return {
      data: categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findCategoryById(id: string) {
    const category = await this.prisma.jobAttributeCategory.findUnique({
      where: { id },
      include: {
        attributes: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async updateCategory(id: string, updateCategoryDto: UpdateJobAttributeCategoryDto) {
    const category = await this.findCategoryById(id);

    // Check if name is being updated and if it conflicts
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.prisma.jobAttributeCategory.findUnique({
        where: { name: updateCategoryDto.name }
      });

      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    return await this.prisma.jobAttributeCategory.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        attributes: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
  }

  async deleteCategory(id: string) {
    const category = await this.findCategoryById(id);

    // Check if category has attributes
    const attributeCount = await this.prisma.jobAttribute.count({
      where: { categoryId: id }
    });

    if (attributeCount > 0) {
      throw new BadRequestException('Cannot delete category with existing attributes');
    }

    return await this.prisma.jobAttributeCategory.delete({
      where: { id }
    });
  }

  // Job Attribute Methods
  async createAttribute(createAttributeDto: CreateJobAttributeDto) {
    try {
      // Verify category exists
      const category = await this.prisma.jobAttributeCategory.findUnique({
        where: { id: createAttributeDto.categoryId }
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      // Check if attribute with same name already exists in this category
      const existingAttribute = await this.prisma.jobAttribute.findFirst({
        where: {
          name: createAttributeDto.name,
          categoryId: createAttributeDto.categoryId
        }
      });

      if (existingAttribute) {
        throw new ConflictException('Attribute with this name already exists in this category');
      }

      return await this.prisma.jobAttribute.create({
        data: createAttributeDto,
        include: {
          category: true
        }
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create attribute');
    }
  }

  async findAllAttributes(query: QueryJobAttributeDto) {
    const { page = 1, limit = 10, categoryId, search, isActive, sortBy = 'sortOrder', sortOrder = 'asc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [attributes, total] = await Promise.all([
      this.prisma.jobAttribute.findMany({
        where,
        include: {
          category: true
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      this.prisma.jobAttribute.count({ where })
    ]);

    return {
      data: attributes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findAttributeById(id: string) {
    const attribute = await this.prisma.jobAttribute.findUnique({
      where: { id },
      include: {
        category: true
      }
    });

    if (!attribute) {
      throw new NotFoundException('Attribute not found');
    }

    return attribute;
  }

  async updateAttribute(id: string, updateAttributeDto: UpdateJobAttributeDto) {
    const attribute = await this.findAttributeById(id);

    // Check if name is being updated and if it conflicts
    if (updateAttributeDto.name && updateAttributeDto.name !== attribute.name) {
      const existingAttribute = await this.prisma.jobAttribute.findFirst({
        where: {
          name: updateAttributeDto.name,
          categoryId: updateAttributeDto.categoryId || attribute.categoryId
        }
      });

      if (existingAttribute) {
        throw new ConflictException('Attribute with this name already exists in this category');
      }
    }

    // If categoryId is being updated, verify the new category exists
    if (updateAttributeDto.categoryId && updateAttributeDto.categoryId !== attribute.categoryId) {
      const category = await this.prisma.jobAttributeCategory.findUnique({
        where: { id: updateAttributeDto.categoryId }
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    return await this.prisma.jobAttribute.update({
      where: { id },
      data: updateAttributeDto,
      include: {
        category: true
      }
    });
  }

  async deleteAttribute(id: string) {
    const attribute = await this.findAttributeById(id);

    return await this.prisma.jobAttribute.delete({
      where: { id }
    });
  }

  // Utility Methods
  async getCategoriesWithAttributes() {
    return await this.prisma.jobAttributeCategory.findMany({
      where: { isActive: true },
      include: {
        attributes: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async getAttributesByCategory(categoryId: string) {
    const category = await this.prisma.jobAttributeCategory.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return await this.prisma.jobAttribute.findMany({
      where: {
        categoryId,
        isActive: true
      },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async bulkCreateAttributes(attributes: CreateJobAttributeDto[]) {
    try {
      // Validate all categories exist
      const categoryIds = [...new Set(attributes.map(attr => attr.categoryId))];
      const categories = await this.prisma.jobAttributeCategory.findMany({
        where: { id: { in: categoryIds } }
      });

      if (categories.length !== categoryIds.length) {
        throw new BadRequestException('One or more categories not found');
      }

      // Check for duplicate names within the same category
      const duplicates = attributes.filter((attr, index) => 
        attributes.findIndex(a => a.name === attr.name && a.categoryId === attr.categoryId) !== index
      );

      if (duplicates.length > 0) {
        throw new ConflictException('Duplicate attribute names found in the same category');
      }

      // Check for existing attributes
      for (const attr of attributes) {
        const existing = await this.prisma.jobAttribute.findFirst({
          where: {
            name: attr.name,
            categoryId: attr.categoryId
          }
        });

        if (existing) {
          throw new ConflictException(`Attribute '${attr.name}' already exists in this category`);
        }
      }

      return await this.prisma.jobAttribute.createMany({
        data: attributes
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create attributes');
    }
  }

  async initializeDefaultCategories() {
    const defaultCategories = [
      { name: 'LANGUAGE_LEVEL', displayName: 'Language Level', sortOrder: 1 },
      { name: 'CAREER_LEVEL', displayName: 'Career Level', sortOrder: 2 },
      { name: 'FUNCTIONAL_AREA', displayName: 'Functional Areas', sortOrder: 3 },
      { name: 'GENDER', displayName: 'Genders', sortOrder: 4 },
      { name: 'INDUSTRY', displayName: 'Industries', sortOrder: 5 },
      { name: 'JOB_EXPERIENCE', displayName: 'Job Experience', sortOrder: 6 },
      { name: 'JOB_SKILL', displayName: 'Job Skills', sortOrder: 7 },
      { name: 'JOB_TYPE', displayName: 'Job Types', sortOrder: 8 },
      { name: 'JOB_SHIFT', displayName: 'Job Shifts', sortOrder: 9 },
      { name: 'DEGREE_LEVEL', displayName: 'Degree Levels', sortOrder: 10 },
      { name: 'DEGREE_TYPE', displayName: 'Degree Types', sortOrder: 11 },
      { name: 'MAJOR_SUBJECT', displayName: 'Major Subjects', sortOrder: 12 }
    ];

    const results: any[] = [];
    for (const category of defaultCategories) {
      try {
        const existing = await this.prisma.jobAttributeCategory.findUnique({
          where: { name: category.name }
        });

        if (!existing) {
          const created = await this.prisma.jobAttributeCategory.create({
            data: category
          });
          results.push(created);
        }
      } catch (error) {
        console.error(`Failed to create category ${category.name}:`, error);
      }
    }

    return results;
  }
}
