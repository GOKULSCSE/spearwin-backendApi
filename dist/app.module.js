"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const user_module_1 = require("./user/user.module");
const database_module_1 = require("./database/database.module");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const setting_module_1 = require("./setting/setting.module");
const auth_module_1 = require("./auth/auth.module");
const admin_module_1 = require("./admin/admin.module");
const candidate_module_1 = require("./candidate/candidate.module");
const company_module_1 = require("./company/company.module");
const location_module_1 = require("./location/location.module");
const job_module_1 = require("./job/job.module");
const notification_module_1 = require("./notification/notification.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const job_attribute_module_1 = require("./job-attribute/job-attribute.module");
const testimonial_module_1 = require("./testimonial/testimonial.module");
const file_upload_module_1 = require("./image-upload/file-upload.module");
const email_module_1 = require("./email/email.module");
const cors_friendly_throttler_guard_1 = require("./common/guards/cors-friendly-throttler.guard");
const config_1 = require("@nestjs/config");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            user_module_1.UserModule,
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            admin_module_1.AdminModule,
            candidate_module_1.CandidateModule,
            company_module_1.CompanyModule,
            location_module_1.LocationModule,
            job_module_1.JobModule,
            notification_module_1.NotificationModule,
            dashboard_module_1.DashboardModule,
            job_attribute_module_1.JobAttributeModule,
            testimonial_module_1.TestimonialModule,
            file_upload_module_1.FileUploadModule,
            email_module_1.EmailModule,
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: 'short',
                    limit: 2,
                    ttl: 3000,
                },
            ]),
            setting_module_1.SettingModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, { provide: core_1.APP_GUARD, useClass: cors_friendly_throttler_guard_1.CorsFriendlyThrottlerGuard }],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map