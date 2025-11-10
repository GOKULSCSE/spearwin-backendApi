import { Module } from '@nestjs/common';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';
import { DatabaseModule } from '../database/database.module';
import { PdfExtractorService } from '../admin/services/pdf-extractor.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CandidateController],
  providers: [CandidateService, PdfExtractorService],
  exports: [CandidateService],
})
export class CandidateModule {}
