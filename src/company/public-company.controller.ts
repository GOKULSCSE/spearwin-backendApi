import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyQueryDto } from './dto/company-query.dto';

@Controller('public/companies')
export class PublicCompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  async searchCompanies(
    @Query(ValidationPipe) query: CompanyQueryDto,
  ): Promise<{ companies: { id: string; name: string; slug: string }[]; total: number; page: number; limit: number; totalPages: number }> {
    return this.companyService.getActiveCompaniesWithPagination(query);
  }
}
