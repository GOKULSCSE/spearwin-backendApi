import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyQueryDto } from './dto/company-query.dto';
import { VerifyCompanyDto } from './dto/verify-company.dto';
import { UpdateCompanyStatusDto } from './dto/update-company-status.dto';
import type { CompanyResponseDto, CompanyListResponseDto, CompanyStatsResponseDto } from './dto/company-response.dto';
import { type CurrentUser } from '../auth/decorators/current-user.decorator';
export declare class CompanyController {
    private readonly companyService;
    constructor(companyService: CompanyService);
    getAllCompanies(query: CompanyQueryDto): Promise<CompanyListResponseDto>;
    getActiveCompanies(sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        companies: any[];
    }>;
    getInactiveCompanies(sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        companies: any[];
    }>;
    getCompanyById(companyId: string): Promise<CompanyResponseDto>;
    createCompany(user: CurrentUser, createDto: CreateCompanyDto): Promise<CompanyResponseDto>;
    updateCompany(companyId: string, user: CurrentUser, updateDto: UpdateCompanyDto): Promise<CompanyResponseDto>;
    deleteCompany(companyId: string, user: CurrentUser): Promise<{
        message: string;
    }>;
    verifyCompany(companyId: string, user: CurrentUser, verifyDto: VerifyCompanyDto): Promise<{
        message: string;
    }>;
    updateCompanyStatus(companyId: string, user: CurrentUser, statusDto: UpdateCompanyStatusDto): Promise<{
        message: string;
    }>;
    getCompanyJobs(companyId: string, page?: number, limit?: number): Promise<any>;
    getCompanyStats(companyId: string): Promise<CompanyStatsResponseDto>;
}
