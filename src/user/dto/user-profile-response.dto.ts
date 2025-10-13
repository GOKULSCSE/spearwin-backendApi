import { UserRole, UserStatus } from '@prisma/client';

export class UserProfileResponseDto {
  id: string;
  email: string;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  phone?: string;
  phoneVerified: boolean;
  phoneVerifiedAt?: Date;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: Date;
  profileCompleted: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Role-specific profile data
  candidate?: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: Date;
    gender?: string;
    profilePicture?: string;
    bio?: string;
    currentTitle?: string;
    experienceYears?: number;
    expectedSalary?: number | null;
    address?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    isAvailable: boolean;
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
  };

  admin?: {
    id: string;
    firstName: string;
    lastName: string;
    designation?: string;
    department?: string;
    permissions?: any;
  };

  superAdmin?: {
    id: string;
    firstName: string;
    lastName: string;
    permissions?: any;
  };

  company?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    website?: string;
    logo?: string;
    industry?: string;
    foundedYear?: number;
    employeeCount?: string;
    headquarters?: string;
    address?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    facebookUrl?: string;
    isVerified: boolean;
    isActive: boolean;
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
  };
}
