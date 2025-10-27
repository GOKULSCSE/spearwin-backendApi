import { PartialType } from '@nestjs/mapped-types';
import { CreateJobAttributeDto } from './create-job-attribute.dto';

export class UpdateJobAttributeDto extends PartialType(CreateJobAttributeDto) {}

