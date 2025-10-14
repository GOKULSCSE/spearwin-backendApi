export interface AdminResponseDto {
  success: boolean;
  message: string;
  data?: any;
}

export interface CreateAdminResponseDto extends AdminResponseDto {
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
      createdAt: Date;
    };
  };
}

export interface CreateCompanyResponseDto extends AdminResponseDto {
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
      slug: string;
      isVerified: boolean;
      isActive: boolean;
      createdAt: Date;
    };
  };
}

export interface UpdatePermissionsResponseDto extends AdminResponseDto {
  data: {
    admin: {
      id: string;
      permissions: string[];
      updatedAt: Date;
    };
  };
}
