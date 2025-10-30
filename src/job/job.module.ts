import { Module } from '@nestjs/common';
import { JobController } from './job.controller';
import { PublicJobController } from './public-job.controller';
import { JobService } from './job.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [JobController, PublicJobController],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
