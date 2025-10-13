"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyStatsResponseDto = exports.CompanyListResponseDto = exports.CompanyResponseDto = void 0;
class CompanyResponseDto {
    id;
    userId;
    name;
    slug;
    description;
    website;
    logo;
    industry;
    foundedYear;
    employeeCount;
    headquarters;
    address;
    linkedinUrl;
    twitterUrl;
    facebookUrl;
    isVerified;
    isActive;
    createdAt;
    updatedAt;
    city;
    user;
}
exports.CompanyResponseDto = CompanyResponseDto;
class CompanyListResponseDto {
    companies;
    total;
    page;
    limit;
    totalPages;
}
exports.CompanyListResponseDto = CompanyListResponseDto;
class CompanyStatsResponseDto {
    totalJobs;
    activeJobs;
    draftJobs;
    closedJobs;
    totalApplications;
    pendingApplications;
    shortlistedApplications;
    selectedApplications;
    rejectedApplications;
    averageApplicationTime;
    lastJobPosted;
    mostPopularJobType;
    mostPopularWorkMode;
}
exports.CompanyStatsResponseDto = CompanyStatsResponseDto;
//# sourceMappingURL=company-response.dto.js.map