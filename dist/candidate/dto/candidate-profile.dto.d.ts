export declare class UpdateCandidateProfileDto {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: string;
    bio?: string;
    currentTitle?: string;
    experienceYears?: number;
    expectedSalary?: number;
    cityId?: string;
    address?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
}
export declare class UpdateAvailabilityDto {
    isAvailable: boolean;
}
export declare class CandidateProfileResponseDto {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: Date;
    gender?: string;
    profilePicture?: string;
    bio?: string;
    currentTitle?: string;
    experienceYears?: number;
    expectedSalary?: number;
    address?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    isAvailable: boolean;
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
}
