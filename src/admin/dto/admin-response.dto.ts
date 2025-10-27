export interface CreateAdminResponseDto {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      role: string;
      status: string;
      emailVerified: boolean;
      phoneVerified: boolean;
      profileCompleted: boolean;
      twoFactorEnabled: boolean;
      createdAt: Date;
    };
    admin: {
      id: string;
      firstName: string;
      lastName: string;
      department?: string;
      position?: string;
      permissions?: string[]; // Made optional since it might not always be present
      createdAt: Date;
    };
  };
}

export interface CreateCompanyResponseDto {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      role: string;
      status: string;
      emailVerified: boolean;
      phoneVerified: boolean;
      profileCompleted: boolean;
      twoFactorEnabled: boolean;
      createdAt: Date;
    };
    company: {
      id: string;
      name: string;
      email?: string; // Made optional since it might not always be present
      status?: string; // Made optional since it might not always be present
      slug?: string;
      isVerified?: boolean;
      isActive?: boolean;
      createdAt: Date;
    };
  };
}

export interface UpdatePermissionsResponseDto {
  success: boolean;
  message: string;
  data: {
    admin: {
      id: string;
      permissions: string[];
      updatedAt: Date;
    };
  };
}