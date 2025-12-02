import { UserRole } from '@prisma/client';
export declare class CreateAdminDto {
    email: string;
    password: string;
    phone?: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    department?: string;
    designation?: string;
    bio?: string;
    profileImage?: string;
    country?: string;
    state?: string;
    city?: string;
    streetAddress?: string;
    linkedinUrl?: string;
    facebookUrl?: string;
    twitterUrl?: string;
    instagramUrl?: string;
}
