export declare class UpdateAdminProfileDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    department?: string;
    designation?: string;
}
export interface AdminProfileResponseDto {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string | null;
    role?: string;
    department?: string | null;
    designation?: string | null;
    permissions: any;
    user?: any;
    createdAt: Date;
    updatedAt: Date;
}
