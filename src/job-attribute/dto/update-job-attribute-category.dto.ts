import { PartialType } from '@nestjs/mapped-types';
import { CreateJobAttributeCategoryDto } from './create-job-attribute-category.dto';

export class UpdateJobAttributeCategoryDto extends PartialType(CreateJobAttributeCategoryDto) {}

