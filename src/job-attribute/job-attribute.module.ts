import { Module } from '@nestjs/common';
import { JobAttributeService } from './job-attribute.service';
import { JobAttributeController } from './job-attribute.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [JobAttributeController],
  providers: [JobAttributeService],
  exports: [JobAttributeService]
})
export class JobAttributeModule {}

