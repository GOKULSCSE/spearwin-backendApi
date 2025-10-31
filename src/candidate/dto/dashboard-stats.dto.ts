export class DashboardStatsDto {
  profileViews: number;
  totalApplications: number;
  savedJobs?: number;
  jobAlerts?: number;
  messages?: number;
  profileViewsChange?: {
    value: number;
    percentage: number;
    period: string; // 'day' | 'week' | 'month'
  };
}

