import { DatabaseService } from '../database/database.service';
import { JobQueryDto, JobSearchDto } from './dto/job-query.dto';
import { JobResponseDto, JobListResponseDto, JobFiltersResponseDto, JobViewResponseDto } from './dto/job-response.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ApplyForJobDto, ApplicationResponseDto } from '../candidate/dto/job-application.dto';
import { CreateJobAttributeDto, UpdateJobAttributeDto, JobAttributeQueryDto, JobAttributeResponseDto, JobAttributeListResponseDto, JobAttributeCategoriesResponseDto, BulkCreateJobAttributesDto } from './dto/job-attribute.dto';
export declare class JobService {
    private readonly db;
    constructor(db: DatabaseService);
    getPublishedJobs(query: JobQueryDto): Promise<JobListResponseDto>;
    searchJobs(searchQuery: JobSearchDto): Promise<JobListResponseDto>;
    getFeaturedJobs(): Promise<JobResponseDto[]>;
    getJobBySlug(slug: string): Promise<JobResponseDto>;
    incrementJobView(jobId: string): Promise<JobViewResponseDto>;
    getJobFilters(): Promise<JobFiltersResponseDto>;
    updateJob(jobId: string, updateJobDto: UpdateJobDto): Promise<JobResponseDto>;
    private mapJobToResponse;
    applyForJob(jobId: string, userId: string, applyDto: ApplyForJobDto): Promise<ApplicationResponseDto>;
    private logActivity;
    private handleException;
    createJobAttribute(createJobAttributeDto: CreateJobAttributeDto): Promise<JobAttributeResponseDto>;
    updateJobAttribute(id: string, updateJobAttributeDto: UpdateJobAttributeDto): Promise<JobAttributeResponseDto>;
    deleteJobAttribute(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getJobAttribute(id: string): Promise<JobAttributeResponseDto>;
    getJobAttributes(query: JobAttributeQueryDto): Promise<JobAttributeListResponseDto>;
    getJobAttributesByCategory(): Promise<JobAttributeCategoriesResponseDto>;
    bulkCreateJobAttributes(bulkCreateDto: BulkCreateJobAttributesDto): Promise<{
        success: boolean;
        message: string;
        created: number;
    }>;
}
