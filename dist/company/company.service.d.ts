import { DatabaseService } from '../database/database.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyQueryDto } from './dto/company-query.dto';
import { VerifyCompanyDto } from './dto/verify-company.dto';
import { UpdateCompanyStatusDto } from './dto/update-company-status.dto';
import { CompanyResponseDto, CompanyListResponseDto, CompanyStatsResponseDto } from './dto/company-response.dto';
export declare class CompanyService {
    private readonly db;
    constructor(db: DatabaseService);
    getAllCompanies(query: CompanyQueryDto): Promise<CompanyListResponseDto>;
    getCompanyById(companyId: string): Promise<CompanyResponseDto>;
    createCompany(createDto: CreateCompanyDto, adminUserId: string): Promise<CompanyResponseDto>;
    updateCompany(companyId: string, updateDto: UpdateCompanyDto, adminUserId: string): Promise<CompanyResponseDto>;
    deleteCompany(companyId: string, adminUserId: string): Promise<{
        message: string;
    }>;
    verifyCompany(companyId: string, verifyDto: VerifyCompanyDto, adminUserId: string): Promise<{
        message: string;
    }>;
    updateCompanyStatus(companyId: string, statusDto: UpdateCompanyStatusDto, adminUserId: string): Promise<{
        message: string;
    }>;
    getCompanyJobs(companyId: string, page?: number, limit?: number): Promise<any>;
    getCompanyStats(companyId: string): Promise<CompanyStatsResponseDto>;
    private logActivity;
    private handleException;
}
