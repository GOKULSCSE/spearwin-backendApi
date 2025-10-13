export class CompanyResponseDto {
  id: string;
  userId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  website?: string | null;
  logo?: string | null;
  industry?: string | null;
  foundedYear?: number | null;
  employeeCount?: string | null;
  headquarters?: string | null;
  address?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  facebookUrl?: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  city?: {
    id: string;
    name: string;
    state: {
      id: string;
      name: string;
      country: {
        id: string;
        name: string;
        code: string;
      };
    };
  };
  user?: {
    id: string;
    email: string;
    role: string;
    status: string;
  };
}

export class CompanyListResponseDto {
  companies: CompanyResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class CompanyStatsResponseDto {
  totalJobs: number;
  activeJobs: number;
  draftJobs: number;
  closedJobs: number;
  totalApplications: number;
  pendingApplications: number;
  shortlistedApplications: number;
  selectedApplications: number;
  rejectedApplications: number;
  averageApplicationTime: number; // in days
  lastJobPosted?: Date | null;
  mostPopularJobType?: string;
  mostPopularWorkMode?: string;
}
