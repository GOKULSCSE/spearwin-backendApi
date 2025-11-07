import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { SettingModule } from './setting/setting.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { CandidateModule } from './candidate/candidate.module';
import { CompanyModule } from './company/company.module';
import { LocationModule } from './location/location.module';
import { JobModule } from './job/job.module';
import { NotificationModule } from './notification/notification.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { JobAttributeModule } from './job-attribute/job-attribute.module';
import { TestimonialModule } from './testimonial/testimonial.module';
import { FileUploadModule } from './image-upload/file-upload.module';
import { EmailModule } from './email/email.module';
import { CorsFriendlyThrottlerGuard } from './common/guards/cors-friendly-throttler.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    DatabaseModule,
    AuthModule,
    AdminModule,
    CandidateModule,
    CompanyModule,
    LocationModule,
    JobModule,
    NotificationModule,
    DashboardModule,
    JobAttributeModule,
    TestimonialModule,
    FileUploadModule,
    EmailModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        limit: 2,
        ttl: 3000,
      },
    ]),
    SettingModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: CorsFriendlyThrottlerGuard }],
})
export class AppModule {}
