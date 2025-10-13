import { IsBoolean } from 'class-validator';

export class UpdateCompanyStatusDto {
  @IsBoolean({ message: 'Is active must be a boolean value' })
  isActive: boolean;
}
