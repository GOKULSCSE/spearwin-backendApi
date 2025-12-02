export declare class UpdateAdminProfileDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    bio?: string;
    profileImage?: string;
    department?: string;
    designation?: string;
    country?: string;
    state?: string;
    city?: string;
    streetAddress?: string;
    linkedinUrl?: string;
    facebookUrl?: string;
    twitterUrl?: string;
    instagramUrl?: string;
}
export interface AdminProfileResponseDto {
    id: string;
    userId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string | null;
    bio?: string;
    profileImage?: string;
    role?: string;
    department?: string | null;
    designation?: string | null;
    country?: string;
    state?: string;
    city?: string;
    streetAddress?: string;
    linkedinUrl?: string;
    facebookUrl?: string;
    twitterUrl?: string;
    instagramUrl?: string;
    permissions: any;
    user?: any;
    createdAt: Date;
    updatedAt: Date;
}
