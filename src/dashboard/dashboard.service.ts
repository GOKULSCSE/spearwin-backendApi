import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { DashboardStatsResponseDto } from './dto/dashboard-stats-response.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly db: DatabaseService) {}

  async getDashboardStats(): Promise<DashboardStatsResponseDto> {
    try {
      const currentDate = new Date();
      const startOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
      const startOfLastWeek = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get all statistics in parallel
      const [
        // Today's users (candidates registered today)
        todayUsers,
        // Yesterday's users for comparison
        yesterdayUsers,
        // Active users (logged in within last 7 days)
        activeUsers,
        // Active users from last week for comparison
        activeUsersLastWeek,
        // Verified users (email or phone verified)
        verifiedUsers,
        // Verified users from yesterday for comparison
        verifiedUsersYesterday,
        // Today's jobs
        todayJobs,
        // Yesterday's jobs for comparison
        yesterdayJobs,
        // Active jobs (published and not expired)
        activeJobs,
        // Active jobs from yesterday for comparison
        activeJobsYesterday
      ] = await Promise.all([
        // Today's users
        this.db.user.count({
          where: {
            role: 'CANDIDATE',
            createdAt: {
              gte: startOfToday
            }
          }
        }),
        // Yesterday's users
        this.db.user.count({
          where: {
            role: 'CANDIDATE',
            createdAt: {
              gte: startOfYesterday,
              lt: startOfToday
            }
          }
        }),
        // Active users (logged in within last 7 days)
        this.db.user.count({
          where: {
            role: 'CANDIDATE',
            lastLoginAt: {
              gte: startOfLastWeek
            }
          }
        }),
        // Active users from last week
        this.db.user.count({
          where: {
            role: 'CANDIDATE',
            lastLoginAt: {
              gte: new Date(startOfLastWeek.getTime() - 7 * 24 * 60 * 60 * 1000),
              lt: startOfLastWeek
            }
          }
        }),
        // Verified users
        this.db.user.count({
          where: {
            role: 'CANDIDATE',
            OR: [
              { emailVerified: true },
              { phoneVerified: true }
            ]
          }
        }),
        // Verified users from yesterday
        this.db.user.count({
          where: {
            role: 'CANDIDATE',
            OR: [
              { emailVerified: true },
              { phoneVerified: true }
            ],
            updatedAt: {
              gte: startOfYesterday,
              lt: startOfToday
            }
          }
        }),
        // Today's jobs
        this.db.job.count({
          where: {
            createdAt: {
              gte: startOfToday
            }
          }
        }),
        // Yesterday's jobs
        this.db.job.count({
          where: {
            createdAt: {
              gte: startOfYesterday,
              lt: startOfToday
            }
          }
        }),
        // Active jobs (published and not expired)
        this.db.job.count({
          where: {
            status: 'PUBLISHED',
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: currentDate } }
            ]
          }
        }),
        // Active jobs from yesterday
        this.db.job.count({
          where: {
            status: 'PUBLISHED',
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date(currentDate.getTime() - 24 * 60 * 60 * 1000) } }
            ],
            updatedAt: {
              gte: startOfYesterday,
              lt: startOfToday
            }
          }
        })
      ]);

      // Calculate percentage changes
      const todayUsersChange = yesterdayUsers > 0 
        ? ((todayUsers - yesterdayUsers) / yesterdayUsers) * 100 
        : todayUsers > 0 ? 100 : 0;

      const activeUsersChange = activeUsersLastWeek > 0 
        ? ((activeUsers - activeUsersLastWeek) / activeUsersLastWeek) * 100 
        : activeUsers > 0 ? 100 : 0;

      const verifiedUsersChange = verifiedUsersYesterday > 0 
        ? ((verifiedUsers - verifiedUsersYesterday) / verifiedUsersYesterday) * 100 
        : verifiedUsers > 0 ? 100 : 0;

      const todayJobsChange = yesterdayJobs > 0 
        ? ((todayJobs - yesterdayJobs) / yesterdayJobs) * 100 
        : todayJobs > 0 ? 100 : 0;

      const activeJobsChange = activeJobsYesterday > 0 
        ? ((activeJobs - activeJobsYesterday) / activeJobsYesterday) * 100 
        : activeJobs > 0 ? 100 : 0;

      return {
        users: {
          todayUsers,
          activeUsers,
          verifiedUsers,
          todayUsersChange: Math.round(todayUsersChange * 10) / 10,
          activeUsersChange: Math.round(activeUsersChange * 10) / 10,
          verifiedUsersChange: Math.round(verifiedUsersChange * 10) / 10
        },
        jobs: {
          todayJobs,
          activeJobs,
          todayJobsChange: Math.round(todayJobsChange * 10) / 10,
          activeJobsChange: Math.round(activeJobsChange * 10) / 10
        }
      };
    } catch (error) {
      throw new BadRequestException('Failed to get dashboard statistics');
    }
  }
}

