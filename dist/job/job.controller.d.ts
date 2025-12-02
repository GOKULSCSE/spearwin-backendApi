import { JobService } from './job.service';
import { JobQueryDto, JobSearchDto } from './dto/job-query.dto';
import { JobResponseDto, JobListResponseDto, JobFiltersResponseDto, JobViewResponseDto } from './dto/job-response.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ApplyForJobDto, ApplicationResponseDto } from '../candidate/dto/job-application.dto';
import { CreateJobAttributeDto, UpdateJobAttributeDto, JobAttributeQueryDto, JobAttributeResponseDto, JobAttributeListResponseDto, BulkCreateJobAttributesDto } from './dto/job-attribute.dto';
import { type CurrentUser } from '../auth/decorators/current-user.decorator';
export declare class JobController {
    private readonly jobService;
    constructor(jobService: JobService);
    getPublishedJobs(query: JobQueryDto): Promise<JobListResponseDto>;
    searchJobs(searchQuery: JobSearchDto): Promise<JobListResponseDto>;
    getFeaturedJobs(): Promise<JobResponseDto[]>;
    getJobBySlug(slug: string): Promise<JobResponseDto>;
    incrementJobView(jobId: string): Promise<JobViewResponseDto>;
    getJobFilters(): Promise<JobFiltersResponseDto>;
    applyForJob(jobId: string, user: CurrentUser, applyDto: ApplyForJobDto): Promise<ApplicationResponseDto>;
    updateJob(jobId: string, updateJobDto: UpdateJobDto): Promise<JobResponseDto>;
    createJobAttribute(createJobAttributeDto: CreateJobAttributeDto): Promise<JobAttributeResponseDto>;
    getJobAttributes(query: JobAttributeQueryDto): Promise<JobAttributeListResponseDto>;
    getAllJobAttributes(): Promise<JobAttributeResponseDto[]>;
    getJobAttribute(id: string): Promise<JobAttributeResponseDto>;
    updateJobAttribute(id: string, updateJobAttributeDto: UpdateJobAttributeDto): Promise<JobAttributeResponseDto>;
    deleteJobAttribute(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    bulkCreateJobAttributes(bulkCreateDto: BulkCreateJobAttributesDto): Promise<{
        success: boolean;
        message: string;
        created: number;
    }>;
}
