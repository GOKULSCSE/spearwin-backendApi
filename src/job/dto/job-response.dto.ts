export class JobResponseDto {
  id: number;
  title: string;
  slug: string;
  description: string;
  requirements: string;
  responsibilities: string;
  benefits?: string | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  currency?: string | null;
  jobType: string;
  workMode: string;
  experienceLevel: string;
  status: string;
  isRemote: boolean;
  viewCount: number;
  applicationCount: number;
  applicationDeadline?: Date | null;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  company: {
    id: number;
    name: string;
    logo?: string | null;
    industry?: string | null;
    size?: string | null;
    website?: string | null;
  };
  location?: {
    city: {
      id: number;
      name: string;
      state_id?: number | null;
      state: {
        id: number;
        name?: string | null;
        country_id?: number | null;
        iso2?: string | null;
        country?: {
          id: number;
          name: string | null;
          iso2?: string | null;
        };
      };
    };
  } | null;
  skillsRequired?: string[];
  tags?: string[];
}

export class JobListResponseDto {
  jobs: JobResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class JobFiltersResponseDto {
  companies: {
    id: number;
    name: string;
    logo?: string | null;
  }[];
  locations: {
    id: number;
    name: string;
    state: string | null;
    country: string;
  }[];
  jobTypes: string[];
  experienceLevels: string[];
  workModes: string[];
  skills: string[];
  salaryRanges: {
    min: number;
    max: number;
  };
}

export class JobViewResponseDto {
  message: string;
  viewCount: number;
}
