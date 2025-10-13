import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Param, 
  Query, 
  Body,
  ValidationPipe,
  UseGuards 
} from '@nestjs/common';
import { JobService } from './job.service';
import { JobQueryDto, JobSearchDto } from './dto/job-query.dto';
import { JobResponseDto, JobListResponseDto, JobFiltersResponseDto, JobViewResponseDto } from './dto/job-response.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ApplyForJobDto, ApplicationResponseDto } from '../candidate/dto/job-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUser, type CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  // =================================================================
  // PUBLIC JOB LISTINGS
  // =================================================================

  @Get()
  async getPublishedJobs(
    @Query(ValidationPipe) query: JobQueryDto,
  ): Promise<JobListResponseDto> {
    return this.jobService.getPublishedJobs(query);
  }

  @Get('search')
  async searchJobs(
    @Query(ValidationPipe) searchQuery: JobSearchDto,
  ): Promise<JobListResponseDto> {
    return this.jobService.searchJobs(searchQuery);
  }

  @Get('featured')
  async getFeaturedJobs(): Promise<JobResponseDto[]> {
    return this.jobService.getFeaturedJobs();
  }

  @Get(':slug')
  async getJobBySlug(@Param('slug') slug: string): Promise<JobResponseDto> {
    return this.jobService.getJobBySlug(slug);
  }

  @Post(':id/view')
  async incrementJobView(@Param('id') jobId: string): Promise<JobViewResponseDto> {
    return this.jobService.incrementJobView(jobId);
  }

  @Get('filters')
  async getJobFilters(): Promise<JobFiltersResponseDto> {
    return this.jobService.getJobFilters();
  }

  // =================================================================
  // JOB APPLICATIONS
  // =================================================================

  @Post(':jobId/apply')
  @UseGuards(JwtAuthGuard)
  async applyForJob(
    @Param('jobId') jobId: string,
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) applyDto: ApplyForJobDto,
  ): Promise<ApplicationResponseDto> {
    return this.jobService.applyForJob(jobId, user.id, applyDto);
  }

  // =================================================================
  // JOB MANAGEMENT
  // =================================================================

  @Put(':id')
  async updateJob(
    @Param('id') jobId: string,
    @Body(ValidationPipe) updateJobDto: UpdateJobDto,
  ): Promise<JobResponseDto> {
    return this.jobService.updateJob(jobId, updateJobDto);
  }
}
