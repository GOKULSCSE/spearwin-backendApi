import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyQueryDto } from './dto/company-query.dto';
import { VerifyCompanyDto } from './dto/verify-company.dto';
import { UpdateCompanyStatusDto } from './dto/update-company-status.dto';
import type {
  CompanyResponseDto,
  CompanyListResponseDto,
  CompanyStatsResponseDto,
} from './dto/company-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from './guards/admin-role.guard';
import { SuperAdminRoleGuard } from './guards/super-admin-role.guard';
import {
  GetCurrentUser,
  type CurrentUser,
} from '../auth/decorators/current-user.decorator';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  // =================================================================
  // COMPANY MANAGEMENT ENDPOINTS
  // =================================================================

  @Get()
  async getAllCompanies(
    @Query(ValidationPipe) query: CompanyQueryDto,
  ): Promise<CompanyListResponseDto> {
    return this.companyService.getAllCompanies(query);
  }

  @Get(':id')
  async getCompanyById(
    @Param('id') companyId: string,
  ): Promise<CompanyResponseDto> {
    return this.companyService.getCompanyById(companyId);
  }

  @Post()
  @UseGuards(AdminRoleGuard)
  async createCompany(
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) createDto: CreateCompanyDto,
  ): Promise<CompanyResponseDto> {
    return this.companyService.createCompany(createDto, user.id);
  }

  @Put(':id')
  @UseGuards(AdminRoleGuard)
  async updateCompany(
    @Param('id') companyId: string,
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) updateDto: UpdateCompanyDto,
  ): Promise<CompanyResponseDto> {
    return this.companyService.updateCompany(companyId, updateDto, user.id);
  }

  @Delete(':id')
  @UseGuards(SuperAdminRoleGuard)
  async deleteCompany(
    @Param('id') companyId: string,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<{ message: string }> {
    return this.companyService.deleteCompany(companyId, user.id);
  }

  @Put(':id/verify')
  @UseGuards(AdminRoleGuard)
  async verifyCompany(
    @Param('id') companyId: string,
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) verifyDto: VerifyCompanyDto,
  ): Promise<{ message: string }> {
    return this.companyService.verifyCompany(companyId, verifyDto, user.id);
  }

  @Put(':id/status')
  @UseGuards(AdminRoleGuard)
  async updateCompanyStatus(
    @Param('id') companyId: string,
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) statusDto: UpdateCompanyStatusDto,
  ): Promise<{ message: string }> {
    return this.companyService.updateCompanyStatus(
      companyId,
      statusDto,
      user.id,
    );
  }

  @Get(':id/jobs')
  async getCompanyJobs(
    @Param('id') companyId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<any> {
    return this.companyService.getCompanyJobs(companyId, page, limit);
  }

  @Get(':id/stats')
  async getCompanyStats(
    @Param('id') companyId: string,
  ): Promise<CompanyStatsResponseDto> {
    return this.companyService.getCompanyStats(companyId);
  }
}
