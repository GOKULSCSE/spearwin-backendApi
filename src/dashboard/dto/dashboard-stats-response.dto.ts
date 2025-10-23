export class DashboardStatsResponseDto {
  users: {
    todayUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    todayUsersChange: number;
    activeUsersChange: number;
    verifiedUsersChange: number;
  };
  jobs: {
    todayJobs: number;
    activeJobs: number;
    todayJobsChange: number;
    activeJobsChange: number;
  };
}

