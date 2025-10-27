import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { PublicCompanyController } from './public-company.controller';
import { CompanyService } from './company.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CompanyController, PublicCompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
