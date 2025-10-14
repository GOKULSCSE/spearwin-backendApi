"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const database_service_1 = require("../database/database.service");
const bcrypt = __importStar(require("bcryptjs"));
let UserService = class UserService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(createUserDto) {
        try {
            return await this.db.user.create({ data: createUserDto });
        }
        catch (error) {
            this.handleException(error);
        }
    }
    async findAll() {
        try {
            const data = await this.db.user.findMany();
            return data;
        }
        catch (error) {
            this.handleException(error);
        }
    }
    findOne(id) {
        return `This action returns a #${id} user`;
    }
    update(id, updateUserDto) {
        return `This action updates a #${id} user`;
    }
    remove(id) {
        return `This action removes a #${id} user`;
    }
    async getCurrentUserProfile(userId) {
        try {
            const user = await this.db.user.findUnique({
                where: { id: userId },
                include: {
                    candidate: {
                        include: {
                            city: {
                                include: {
                                    state: {
                                        include: {
                                            country: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    admin: true,
                    superAdmin: true,
                    company: {
                        include: {
                            city: {
                                include: {
                                    state: {
                                        include: {
                                            country: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            return user;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async updateCurrentUserProfile(userId, updateProfileDto) {
        try {
            const user = await this.db.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            if (updateProfileDto.email && updateProfileDto.email !== user.email) {
                const existingUser = await this.db.user.findUnique({
                    where: { email: updateProfileDto.email },
                });
                if (existingUser) {
                    throw new common_1.BadRequestException('Email is already in use');
                }
            }
            if (updateProfileDto.phone && updateProfileDto.phone !== user.phone) {
                const existingUser = await this.db.user.findUnique({
                    where: { phone: updateProfileDto.phone },
                });
                if (existingUser) {
                    throw new common_1.BadRequestException('Phone number is already in use');
                }
            }
            const updatedUser = await this.db.user.update({
                where: { id: userId },
                data: {
                    ...updateProfileDto,
                    emailVerified: updateProfileDto.email && updateProfileDto.email !== user.email
                        ? false
                        : user.emailVerified,
                    phoneVerified: updateProfileDto.phone && updateProfileDto.phone !== user.phone
                        ? false
                        : user.phoneVerified,
                },
                include: {
                    candidate: {
                        include: {
                            city: {
                                include: {
                                    state: {
                                        include: {
                                            country: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    admin: true,
                    superAdmin: true,
                    company: {
                        include: {
                            city: {
                                include: {
                                    state: {
                                        include: {
                                            country: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            await this.logActivity(userId, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'User', userId, 'Profile updated');
            return updatedUser;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async deleteUserAccount(userId) {
        try {
            const user = await this.db.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            await this.db.user.delete({
                where: { id: userId },
            });
            await this.logActivity(userId, client_1.LogAction.DELETE, client_1.LogLevel.CRITICAL, 'User', userId, 'Account deleted');
            return { message: 'Account deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async changePassword(userId, changePasswordDto) {
        try {
            const user = await this.db.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const isCurrentPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new common_1.UnauthorizedException('Current password is incorrect');
            }
            const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 12);
            await this.db.user.update({
                where: { id: userId },
                data: { password: hashedNewPassword },
            });
            await this.logActivity(userId, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'User', userId, 'Password changed');
            return { message: 'Password changed successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async getUserActivityLogs(userId, query) {
        try {
            const user = await this.db.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const { action, level, entity, startDate, endDate, page = 1, limit = 10, } = query;
            const skip = (page - 1) * limit;
            const where = {
                userId,
            };
            if (action) {
                where.action = action;
            }
            if (level) {
                where.level = level;
            }
            if (entity) {
                where.entity = entity;
            }
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate) {
                    where.createdAt.gte = new Date(startDate);
                }
                if (endDate) {
                    where.createdAt.lte = new Date(endDate);
                }
            }
            const [logs, total] = await Promise.all([
                this.db.activityLog.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                this.db.activityLog.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                logs: logs.map((log) => ({
                    id: log.id,
                    action: log.action,
                    level: log.level,
                    entity: log.entity,
                    entityId: log.entityId,
                    description: log.description,
                    metadata: log.metadata,
                    ipAddress: log.ipAddress,
                    userAgent: log.userAgent,
                    createdAt: log.createdAt,
                })),
                total,
                page,
                limit,
                totalPages,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async getNotificationPreferences(userId) {
        try {
            const user = await this.db.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const settings = await this.db.userSetting.findMany({
                where: {
                    userId,
                    key: {
                        in: [
                            'notification_job_alert_email',
                            'notification_job_alert_push',
                            'notification_job_alert_sms',
                            'notification_job_alert_in_app',
                            'notification_application_update_email',
                            'notification_application_update_push',
                            'notification_application_update_sms',
                            'notification_application_update_in_app',
                            'notification_system_notification_email',
                            'notification_system_notification_push',
                            'notification_system_notification_sms',
                            'notification_system_notification_in_app',
                            'notification_security_alert_email',
                            'notification_security_alert_push',
                            'notification_security_alert_sms',
                            'notification_security_alert_in_app',
                            'notification_company_update_email',
                            'notification_company_update_push',
                            'notification_company_update_sms',
                            'notification_company_update_in_app',
                        ],
                    },
                },
            });
            const defaultPreferences = [
                {
                    type: 'JOB_ALERT',
                    email: true,
                    push: true,
                    sms: false,
                    inApp: true,
                },
                {
                    type: 'APPLICATION_UPDATE',
                    email: true,
                    push: true,
                    sms: false,
                    inApp: true,
                },
                {
                    type: 'SYSTEM_NOTIFICATION',
                    email: true,
                    push: true,
                    sms: false,
                    inApp: true,
                },
                {
                    type: 'SECURITY_ALERT',
                    email: true,
                    push: true,
                    sms: true,
                    inApp: true,
                },
                {
                    type: 'COMPANY_UPDATE',
                    email: true,
                    push: true,
                    sms: false,
                    inApp: true,
                },
            ];
            const preferences = defaultPreferences.map((pref) => {
                const settingMap = {
                    email: `notification_${pref.type.toLowerCase()}_email`,
                    push: `notification_${pref.type.toLowerCase()}_push`,
                    sms: `notification_${pref.type.toLowerCase()}_sms`,
                    inApp: `notification_${pref.type.toLowerCase()}_in_app`,
                };
                const prefSettings = settings.filter((setting) => Object.values(settingMap).includes(setting.key));
                return {
                    type: pref.type,
                    email: prefSettings.find((s) => s.key === settingMap.email)?.value ===
                        'true' || pref.email,
                    push: prefSettings.find((s) => s.key === settingMap.push)?.value ===
                        'true' || pref.push,
                    sms: prefSettings.find((s) => s.key === settingMap.sms)?.value ===
                        'true' || pref.sms,
                    inApp: prefSettings.find((s) => s.key === settingMap.inApp)?.value ===
                        'true' || pref.inApp,
                };
            });
            const latestUpdate = new Date();
            return {
                preferences,
                updatedAt: latestUpdate,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async updateNotificationPreferences(userId, updatePreferencesDto) {
        try {
            const user = await this.db.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const preferences = updatePreferencesDto.preferences || [];
            for (const pref of preferences) {
                const settingMap = {
                    email: `notification_${pref.type.toLowerCase()}_email`,
                    push: `notification_${pref.type.toLowerCase()}_push`,
                    sms: `notification_${pref.type.toLowerCase()}_sms`,
                    inApp: `notification_${pref.type.toLowerCase()}_in_app`,
                };
                for (const [channel, key] of Object.entries(settingMap)) {
                    await this.db.userSetting.upsert({
                        where: {
                            userId_key: {
                                userId,
                                key,
                            },
                        },
                        update: {
                            value: pref[channel],
                            category: 'notification_preferences',
                        },
                        create: {
                            userId,
                            key,
                            value: pref[channel],
                            category: 'notification_preferences',
                        },
                    });
                }
            }
            await this.logActivity(userId, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'User', userId, 'Notification preferences updated');
            return this.getNotificationPreferences(userId);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async testNotificationSettings(userId) {
        try {
            const user = await this.db.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const preferencesResponse = await this.getNotificationPreferences(userId);
            const enabledNotifications = [];
            for (const pref of preferencesResponse.preferences) {
                if (pref.email)
                    enabledNotifications.push(`${pref.type} - Email`);
                if (pref.push)
                    enabledNotifications.push(`${pref.type} - Push`);
                if (pref.sms)
                    enabledNotifications.push(`${pref.type} - SMS`);
                if (pref.inApp)
                    enabledNotifications.push(`${pref.type} - In-App`);
            }
            if (enabledNotifications.length === 0) {
                return { message: 'No notification channels are enabled for testing' };
            }
            for (const notificationType of [
                'JOB_ALERT',
                'APPLICATION_UPDATE',
                'SYSTEM_NOTIFICATION',
            ]) {
                await this.db.notification.create({
                    data: {
                        userId,
                        type: notificationType,
                        title: 'Test Notification',
                        message: `This is a test notification for ${notificationType.replace('_', ' ').toLowerCase()}. Your notification settings are working correctly.`,
                        data: { test: true, timestamp: new Date().toISOString() },
                    },
                });
            }
            await this.logActivity(userId, client_1.LogAction.CREATE, client_1.LogLevel.INFO, 'User', userId, 'Test notifications sent');
            return {
                message: `Test notifications sent successfully. Enabled channels: ${enabledNotifications.join(', ')}`,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async logActivity(userId, action, level, entity, entityId, description, metadata, ipAddress, userAgent) {
        try {
            await this.db.activityLog.create({
                data: {
                    userId,
                    action,
                    level,
                    entity,
                    entityId,
                    description,
                    metadata,
                    ipAddress,
                    userAgent,
                },
            });
        }
        catch (error) {
            console.error('Failed to log activity:', error);
        }
    }
    handleException(error) {
        throw new common_1.InternalServerErrorException("Can't fetch user Details");
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], UserService);
//# sourceMappingURL=user.service.js.map