"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobViewResponseDto = exports.JobFiltersResponseDto = exports.JobListResponseDto = exports.JobResponseDto = void 0;
class JobResponseDto {
    id;
    title;
    slug;
    description;
    requirements;
    responsibilities;
    benefits;
    minSalary;
    maxSalary;
    currency;
    jobType;
    workMode;
    experienceLevel;
    status;
    isRemote;
    viewCount;
    applicationCount;
    applicationDeadline;
    publishedAt;
    createdAt;
    updatedAt;
    company;
    location;
    skillsRequired;
    tags;
}
exports.JobResponseDto = JobResponseDto;
class JobListResponseDto {
    jobs;
    total;
    page;
    limit;
    totalPages;
    hasNext;
    hasPrev;
}
exports.JobListResponseDto = JobListResponseDto;
class JobFiltersResponseDto {
    companies;
    locations;
    jobTypes;
    experienceLevels;
    workModes;
    skills;
    salaryRanges;
}
exports.JobFiltersResponseDto = JobFiltersResponseDto;
class JobViewResponseDto {
    message;
    viewCount;
}
exports.JobViewResponseDto = JobViewResponseDto;
//# sourceMappingURL=job-response.dto.js.map