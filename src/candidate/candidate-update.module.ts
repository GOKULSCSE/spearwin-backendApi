import { Module } from '@nestjs/common';
import { CandidateUpdateController } from './candidate-update.controller';
import { CandidateUpdateService } from './candidate-update.service';
import { FileUploadService } from '../common/services/file-upload.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CandidateUpdateController],
  providers: [CandidateUpdateService, FileUploadService],
  exports: [CandidateUpdateService],
})
export class CandidateUpdateModule {}
