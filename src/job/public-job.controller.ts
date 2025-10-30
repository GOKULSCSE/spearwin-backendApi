import { Controller, Get } from '@nestjs/common';
import { JobService } from './job.service';

@Controller('job')
export class PublicJobController {
  constructor(private readonly jobService: JobService) {}

  @Get()
  async listJobs() {
    return this.jobService.getAllJobsList();
  }
}


