import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PdfExtractorService } from './services/pdf-extractor.service';
import { DatabaseModule } from '../database/database.module';
import { FaqModule } from '../faq/faq.module';

@Module({
  imports: [
    DatabaseModule,
    FaqModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, PdfExtractorService],
  exports: [AdminService, PdfExtractorService],
})
export class AdminModule {}
