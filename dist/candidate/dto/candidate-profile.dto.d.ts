export declare class UpdateCandidateProfileDto {
    firstName?: string;
    lastName?: string;
    fatherName?: string;
    dateOfBirth?: string;
    gender?: string;
    maritalStatus?: string;
    bio?: string;
    currentTitle?: string;
    currentCompany?: string;
    currentLocation?: string;
    preferredLocation?: string;
    noticePeriod?: string;
    currentSalary?: number;
    expectedSalary?: number;
    profileType?: string;
    experienceYears?: number;
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
    fatherName?: string;
    dateOfBirth?: Date;
    gender?: string;
    maritalStatus?: string;
    profilePicture?: string;
    bio?: string;
    currentTitle?: string;
    currentCompany?: string;
    currentLocation?: string;
    preferredLocation?: string;
    noticePeriod?: string;
    currentSalary?: number;
    expectedSalary?: number;
    profileType?: string;
    experienceYears?: number;
    address?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
    user?: {
        email: string;
        phone?: string | null;
    };
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
    } | null;
}
