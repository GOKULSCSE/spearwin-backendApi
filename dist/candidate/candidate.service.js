"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidateService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const client_1 = require("@prisma/client");
let CandidateService = class CandidateService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createCandidate(userId, createDto) {
        try {
            const candidate = await this.db.candidate.create({
                data: {
                    userId,
                    ...createDto,
                },
                include: {
                    city: {
                        include: {
                            state: {
                                include: {
                                    country: true,
                                },
                            },
                        },
                    },
                    user: {
                        select: {
                            email: true,
                            phone: true,
                        },
                    },
                },
            });
            await this.logActivity(userId, client_1.LogAction.CREATE, client_1.LogLevel.INFO, 'Candidate', candidate.id, 'Candidate profile created');
            return {
                id: candidate.id,
                userId: candidate.userId,
                firstName: candidate.firstName,
                lastName: candidate.lastName,
                dateOfBirth: candidate.dateOfBirth || undefined,
                gender: candidate.gender || undefined,
                profilePicture: candidate.profilePicture || undefined,
                bio: candidate.bio || undefined,
                currentTitle: candidate.currentTitle || undefined,
                experienceYears: candidate.experienceYears || undefined,
                expectedSalary: candidate.expectedSalary
                    ? Number(candidate.expectedSalary)
                    : undefined,
                address: candidate.address || undefined,
                linkedinUrl: candidate.linkedinUrl || undefined,
                githubUrl: candidate.githubUrl || undefined,
                portfolioUrl: candidate.portfolioUrl || undefined,
                isAvailable: candidate.isAvailable,
                createdAt: candidate.createdAt,
                updatedAt: candidate.updatedAt,
                city: candidate.city
                    ? {
                        id: candidate.city.id,
                        name: candidate.city.name,
                        state_id: candidate.city.state_id,
                        state_code: candidate.city.state_code,
                        state_name: candidate.city.state_name,
                        country_id: candidate.city.country_id,
                        country_code: candidate.city.country_code,
                        country_name: candidate.city.country_name,
                        latitude: candidate.city.latitude,
                        longitude: candidate.city.longitude,
                        wikiDataId: candidate.city.wikiDataId,
                        isActive: candidate.city.isActive,
                        createdAt: candidate.city.createdAt,
                        updatedAt: candidate.city.updatedAt,
                        state: {
                            id: candidate.city.state.id,
                            name: candidate.city.state.name,
                            country_id: candidate.city.state.country_id,
                            country_code: candidate.city.state.country_code,
                            country_name: candidate.city.state.country_name,
                            iso2: candidate.city.state.iso2,
                            fips_code: candidate.city.state.fips_code,
                            type: candidate.city.state.type,
                            level: candidate.city.state.level,
                            parent_id: candidate.city.state.parent_id,
                            latitude: candidate.city.state.latitude,
                            longitude: candidate.city.state.longitude,
                            isActive: candidate.city.state.isActive,
                            createdAt: candidate.city.state.createdAt,
                            updatedAt: candidate.city.state.updatedAt,
                            country: {
                                id: candidate.city.state.country.id,
                                name: candidate.city.state.country.name,
                                iso3: candidate.city.state.country.iso3,
                                iso2: candidate.city.state.country.iso2,
                                numeric_code: candidate.city.state.country.numeric_code,
                                phonecode: candidate.city.state.country.phonecode,
                                capital: candidate.city.state.country.capital,
                                currency: candidate.city.state.country.currency,
                                currency_name: candidate.city.state.country.currency_name,
                                currency_symbol: candidate.city.state.country.currency_symbol,
                                tld: candidate.city.state.country.tld,
                                native: candidate.city.state.country.native,
                                region: candidate.city.state.country.region,
                                region_id: candidate.city.state.country.region_id,
                                subregion: candidate.city.state.country.subregion,
                                subregion_id: candidate.city.state.country.subregion_id,
                                nationality: candidate.city.state.country.nationality,
                                latitude: candidate.city.state.country.latitude,
                                longitude: candidate.city.state.country.longitude,
                                isActive: candidate.city.state.country.isActive,
                                createdAt: candidate.city.state.country.createdAt,
                                updatedAt: candidate.city.state.country.updatedAt,
                            },
                        },
                    }
                    : undefined,
            };
        }
        catch (error) {
            this.handleException(error);
            throw error;
        }
    }
    async getCandidateProfile(userId) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
                include: {
                    city: {
                        include: {
                            state: {
                                include: {
                                    country: true,
                                },
                            },
                        },
                    },
                    user: {
                        select: {
                            email: true,
                            phone: true,
                        },
                    },
                    skills: true,
                    education: true,
                    experience: true,
                },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            return {
                id: candidate.id,
                userId: candidate.userId,
                firstName: candidate.firstName,
                lastName: candidate.lastName,
                fatherName: candidate.fatherName || undefined,
                dateOfBirth: candidate.dateOfBirth || undefined,
                gender: candidate.gender || undefined,
                maritalStatus: candidate.maritalStatus || undefined,
                profilePicture: candidate.profilePicture || undefined,
                bio: candidate.bio || undefined,
                currentTitle: candidate.currentTitle || undefined,
                currentCompany: candidate.currentCompany || undefined,
                currentLocation: candidate.currentLocation || undefined,
                preferredLocation: candidate.preferredLocation || undefined,
                noticePeriod: candidate.noticePeriod || undefined,
                currentSalary: candidate.currentSalary
                    ? Number(candidate.currentSalary)
                    : undefined,
                expectedSalary: candidate.expectedSalary
                    ? Number(candidate.expectedSalary)
                    : undefined,
                profileType: candidate.profileType || undefined,
                experienceYears: candidate.experienceYears || undefined,
                address: candidate.address || undefined,
                linkedinUrl: candidate.linkedinUrl || undefined,
                githubUrl: candidate.githubUrl || undefined,
                portfolioUrl: candidate.portfolioUrl || undefined,
                isAvailable: candidate.isAvailable,
                createdAt: candidate.createdAt,
                updatedAt: candidate.updatedAt,
                user: candidate.user,
                city: candidate.city,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async updateCandidate(userId, updateDto) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const updatedCandidate = await this.db.candidate.update({
                where: { id: candidate.id },
                data: updateDto,
                include: {
                    city: {
                        include: {
                            state: {
                                include: {
                                    country: true,
                                },
                            },
                        },
                    },
                    user: {
                        select: {
                            email: true,
                            phone: true,
                        },
                    },
                },
            });
            await this.logActivity(userId, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'Candidate', candidate.id, 'Candidate profile updated');
            return {
                id: updatedCandidate.id,
                userId: updatedCandidate.userId,
                firstName: updatedCandidate.firstName,
                lastName: updatedCandidate.lastName,
                dateOfBirth: updatedCandidate.dateOfBirth || undefined,
                gender: updatedCandidate.gender || undefined,
                profilePicture: updatedCandidate.profilePicture || undefined,
                bio: updatedCandidate.bio || undefined,
                currentTitle: updatedCandidate.currentTitle || undefined,
                experienceYears: updatedCandidate.experienceYears || undefined,
                expectedSalary: updatedCandidate.expectedSalary
                    ? Number(updatedCandidate.expectedSalary)
                    : undefined,
                address: updatedCandidate.address || undefined,
                linkedinUrl: updatedCandidate.linkedinUrl || undefined,
                githubUrl: updatedCandidate.githubUrl || undefined,
                portfolioUrl: updatedCandidate.portfolioUrl || undefined,
                isAvailable: updatedCandidate.isAvailable,
                createdAt: updatedCandidate.createdAt,
                updatedAt: updatedCandidate.updatedAt,
                city: updatedCandidate.city
                    ? {
                        id: updatedCandidate.city.id,
                        name: updatedCandidate.city.name,
                        state_id: updatedCandidate.city.state_id,
                        state_code: updatedCandidate.city.state_code,
                        state_name: updatedCandidate.city.state_name,
                        country_id: updatedCandidate.city.country_id,
                        country_code: updatedCandidate.city.country_code,
                        country_name: updatedCandidate.city.country_name,
                        latitude: updatedCandidate.city.latitude,
                        longitude: updatedCandidate.city.longitude,
                        wikiDataId: updatedCandidate.city.wikiDataId,
                        isActive: updatedCandidate.city.isActive,
                        createdAt: updatedCandidate.city.createdAt,
                        updatedAt: updatedCandidate.city.updatedAt,
                        state: {
                            id: updatedCandidate.city.state.id,
                            name: updatedCandidate.city.state.name,
                            country_id: updatedCandidate.city.state.country_id,
                            country_code: updatedCandidate.city.state.country_code,
                            country_name: updatedCandidate.city.state.country_name,
                            iso2: updatedCandidate.city.state.iso2,
                            fips_code: updatedCandidate.city.state.fips_code,
                            type: updatedCandidate.city.state.type,
                            level: updatedCandidate.city.state.level,
                            parent_id: updatedCandidate.city.state.parent_id,
                            latitude: updatedCandidate.city.state.latitude,
                            longitude: updatedCandidate.city.state.longitude,
                            isActive: updatedCandidate.city.state.isActive,
                            createdAt: updatedCandidate.city.state.createdAt,
                            updatedAt: updatedCandidate.city.state.updatedAt,
                            country: {
                                id: updatedCandidate.city.state.country.id,
                                name: updatedCandidate.city.state.country.name,
                                iso3: updatedCandidate.city.state.country.iso3,
                                iso2: updatedCandidate.city.state.country.iso2,
                                numeric_code: updatedCandidate.city.state.country.numeric_code,
                                phonecode: updatedCandidate.city.state.country.phonecode,
                                capital: updatedCandidate.city.state.country.capital,
                                currency: updatedCandidate.city.state.country.currency,
                                currency_name: updatedCandidate.city.state.country.currency_name,
                                currency_symbol: updatedCandidate.city.state.country.currency_symbol,
                                tld: updatedCandidate.city.state.country.tld,
                                native: updatedCandidate.city.state.country.native,
                                region: updatedCandidate.city.state.country.region,
                                region_id: updatedCandidate.city.state.country.region_id,
                                subregion: updatedCandidate.city.state.country.subregion,
                                subregion_id: updatedCandidate.city.state.country.subregion_id,
                                nationality: updatedCandidate.city.state.country.nationality,
                                latitude: updatedCandidate.city.state.country.latitude,
                                longitude: updatedCandidate.city.state.country.longitude,
                                isActive: updatedCandidate.city.state.country.isActive,
                                createdAt: updatedCandidate.city.state.country.createdAt,
                                updatedAt: updatedCandidate.city.state.country.updatedAt,
                            },
                        },
                    }
                    : undefined,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async parseResume(userId, parseDto) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
                include: {
                    city: {
                        include: {
                            state: {
                                include: {
                                    country: true,
                                },
                            },
                        },
                    },
                    user: {
                        select: {
                            email: true,
                            phone: true,
                        },
                    },
                    skills: true,
                    education: true,
                    experience: true,
                },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            let resume = null;
            if (parseDto.resumeId) {
                resume = await this.db.resume.findFirst({
                    where: {
                        id: parseDto.resumeId,
                        candidateId: candidate.id,
                    },
                });
                if (!resume) {
                    throw new common_1.NotFoundException('Resume not found');
                }
            }
            const extractedData = {
                personalInfo: {
                    name: `${candidate.firstName} ${candidate.lastName}`,
                    email: candidate.user.email,
                    phone: candidate.user.phone || '',
                    location: candidate.city
                        ? `${candidate.city.name}, ${candidate.city.state.name}, ${candidate.city.state.country.name}`
                        : '',
                },
                experience: candidate.experience.map((exp) => ({
                    company: exp.company,
                    position: exp.position,
                    duration: `${exp.startDate.toISOString().split('T')[0]} - ${exp.endDate ? exp.endDate.toISOString().split('T')[0] : 'Present'}`,
                    description: exp.description || '',
                })),
                education: candidate.education.map((edu) => ({
                    institution: edu.institution,
                    degree: edu.degree,
                    field: edu.fieldOfStudy || '',
                    graduationYear: edu.endDate
                        ? edu.endDate.getFullYear().toString()
                        : '',
                })),
                skills: candidate.skills.map((skill) => skill.skillName),
                summary: candidate.bio || 'Professional with relevant experience and skills',
            };
            await this.logActivity(userId, client_1.LogAction.VIEW, client_1.LogLevel.INFO, 'Resume', resume?.id || 'parse', 'Resume parsed for data extraction');
            return {
                success: true,
                extractedData,
                confidence: 90,
                message: 'Resume parsed successfully',
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async getResumeAnalysis(userId, resumeId) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
                include: {
                    city: {
                        include: {
                            state: {
                                include: {
                                    country: true,
                                },
                            },
                        },
                    },
                    user: {
                        select: {
                            email: true,
                            phone: true,
                        },
                    },
                    skills: true,
                    education: true,
                    experience: true,
                },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const resume = await this.db.resume.findFirst({
                where: {
                    id: resumeId,
                    candidateId: candidate.id,
                },
            });
            if (!resume) {
                throw new common_1.NotFoundException('Resume not found');
            }
            const personalInfoScore = this.calculatePersonalInfoScore(candidate);
            const experienceScore = this.calculateExperienceScore(candidate.experience);
            const educationScore = this.calculateEducationScore(candidate.education);
            const skillsScore = this.calculateSkillsScore(candidate.skills);
            const summaryScore = this.calculateSummaryScore(candidate.bio);
            const overallScore = Math.round((personalInfoScore +
                experienceScore +
                educationScore +
                skillsScore +
                summaryScore) /
                5);
            const analysis = {
                resumeId,
                overallScore,
                sections: {
                    personalInfo: {
                        score: personalInfoScore,
                        completeness: this.calculateCompleteness(candidate),
                        issues: this.getPersonalInfoIssues(candidate),
                    },
                    experience: {
                        score: experienceScore,
                        relevance: this.calculateExperienceRelevance(candidate.experience),
                        achievements: this.calculateAchievementsScore(candidate.experience),
                        issues: this.getExperienceIssues(candidate.experience),
                    },
                    education: {
                        score: educationScore,
                        relevance: this.calculateEducationRelevance(candidate.education),
                        issues: this.getEducationIssues(candidate.education),
                    },
                    skills: {
                        score: skillsScore,
                        relevance: this.calculateSkillsRelevance(candidate.skills),
                        diversity: this.calculateSkillsDiversity(candidate.skills),
                        issues: this.getSkillsIssues(candidate.skills),
                    },
                    summary: {
                        score: summaryScore,
                        length: candidate.bio ? candidate.bio.split(' ').length : 0,
                        impact: this.calculateSummaryImpact(candidate.bio),
                        issues: this.getSummaryIssues(candidate.bio),
                    },
                },
                recommendations: this.generateRecommendations(candidate),
                strengths: this.identifyStrengths(candidate),
                weaknesses: this.identifyWeaknesses(candidate),
                atsCompatibility: {
                    score: this.calculateATSCompatibility(candidate),
                    issues: this.getATSIssues(candidate),
                    suggestions: this.getATSSuggestions(candidate),
                },
                analyzedAt: new Date(),
            };
            await this.logActivity(userId, client_1.LogAction.VIEW, client_1.LogLevel.INFO, 'Resume', resumeId, 'Resume analysis generated');
            return analysis;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async optimizeResume(userId, resumeId) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
                include: {
                    skills: true,
                    education: true,
                    experience: true,
                },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const resume = await this.db.resume.findFirst({
                where: {
                    id: resumeId,
                    candidateId: candidate.id,
                },
            });
            if (!resume) {
                throw new common_1.NotFoundException('Resume not found');
            }
            const optimization = {
                resumeId,
                optimizationSuggestions: this.generateOptimizationSuggestions(candidate),
                keywordOptimization: this.generateKeywordOptimization(candidate),
                formattingSuggestions: this.generateFormattingSuggestions(candidate),
                lengthOptimization: this.generateLengthOptimization(candidate),
                atsOptimization: {
                    score: this.calculateATSCompatibility(candidate),
                    improvements: this.getATSSuggestions(candidate),
                },
                generatedAt: new Date(),
            };
            await this.logActivity(userId, client_1.LogAction.VIEW, client_1.LogLevel.INFO, 'Resume', resumeId, 'Resume optimization suggestions generated');
            return optimization;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    calculatePersonalInfoScore(candidate) {
        let score = 0;
        if (candidate.firstName && candidate.lastName)
            score += 20;
        if (candidate.user.email)
            score += 20;
        if (candidate.user.phone)
            score += 15;
        if (candidate.city)
            score += 15;
        if (candidate.linkedinUrl)
            score += 10;
        if (candidate.githubUrl)
            score += 10;
        if (candidate.portfolioUrl)
            score += 10;
        return Math.min(score, 100);
    }
    calculateExperienceScore(experience) {
        if (experience.length === 0)
            return 0;
        let score = 0;
        score += Math.min(experience.length * 15, 60);
        score += experience.some((exp) => exp.achievements) ? 20 : 0;
        score += experience.some((exp) => exp.description && exp.description.length > 50)
            ? 20
            : 0;
        return Math.min(score, 100);
    }
    calculateEducationScore(education) {
        if (education.length === 0)
            return 0;
        let score = 0;
        score += Math.min(education.length * 25, 75);
        score += education.some((edu) => edu.isCompleted) ? 15 : 0;
        score += education.some((edu) => edu.grade) ? 10 : 0;
        return Math.min(score, 100);
    }
    calculateSkillsScore(skills) {
        if (skills.length === 0)
            return 0;
        let score = 0;
        score += Math.min(skills.length * 8, 60);
        score += skills.some((skill) => skill.level) ? 20 : 0;
        score += skills.some((skill) => skill.yearsUsed) ? 20 : 0;
        return Math.min(score, 100);
    }
    calculateSummaryScore(bio) {
        if (!bio)
            return 0;
        let score = 0;
        if (bio.length > 50)
            score += 30;
        if (bio.length > 100)
            score += 20;
        if (bio.length > 200)
            score += 20;
        if (bio.includes('experience') || bio.includes('skills'))
            score += 15;
        if (bio.includes('achievement') || bio.includes('result'))
            score += 15;
        return Math.min(score, 100);
    }
    calculateCompleteness(candidate) {
        let fields = 0;
        let completed = 0;
        const requiredFields = ['firstName', 'lastName', 'user.email'];
        const optionalFields = [
            'user.phone',
            'city',
            'bio',
            'linkedinUrl',
            'githubUrl',
            'portfolioUrl',
        ];
        requiredFields.forEach((field) => {
            fields++;
            if (this.getNestedValue(candidate, field))
                completed++;
        });
        optionalFields.forEach((field) => {
            fields++;
            if (this.getNestedValue(candidate, field))
                completed++;
        });
        return Math.round((completed / fields) * 100);
    }
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    getPersonalInfoIssues(candidate) {
        const issues = [];
        if (!candidate.user.phone)
            issues.push('Phone number is missing');
        if (!candidate.linkedinUrl)
            issues.push('LinkedIn profile is missing');
        if (!candidate.githubUrl)
            issues.push('GitHub profile is missing');
        if (!candidate.portfolioUrl)
            issues.push('Portfolio URL is missing');
        return issues;
    }
    calculateExperienceRelevance(experience) {
        if (experience.length === 0)
            return 0;
        return Math.min(experience.length * 20, 100);
    }
    calculateAchievementsScore(experience) {
        const withAchievements = experience.filter((exp) => exp.achievements && exp.achievements.length > 0).length;
        return Math.round((withAchievements / experience.length) * 100) || 0;
    }
    getExperienceIssues(experience) {
        const issues = [];
        if (experience.length === 0)
            issues.push('No work experience listed');
        if (!experience.some((exp) => exp.achievements))
            issues.push('Missing quantifiable achievements');
        if (!experience.some((exp) => exp.description && exp.description.length > 50))
            issues.push('Job descriptions are too brief');
        return issues;
    }
    calculateEducationRelevance(education) {
        if (education.length === 0)
            return 0;
        return Math.min(education.length * 30, 100);
    }
    getEducationIssues(education) {
        const issues = [];
        if (education.length === 0)
            issues.push('No education listed');
        if (!education.some((edu) => edu.isCompleted))
            issues.push('Some education entries are incomplete');
        return issues;
    }
    calculateSkillsRelevance(skills) {
        if (skills.length === 0)
            return 0;
        return Math.min(skills.length * 15, 100);
    }
    calculateSkillsDiversity(skills) {
        if (skills.length === 0)
            return 0;
        const categories = new Set(skills.map((skill) => skill.skillName.toLowerCase().split(' ')[0]));
        return Math.min(categories.size * 20, 100);
    }
    getSkillsIssues(skills) {
        const issues = [];
        if (skills.length === 0)
            issues.push('No skills listed');
        if (skills.length < 3)
            issues.push('Too few skills listed');
        if (!skills.some((skill) => skill.level))
            issues.push('Skill levels not specified');
        return issues;
    }
    calculateSummaryImpact(bio) {
        if (!bio)
            return 0;
        let score = 0;
        if (bio.length > 100)
            score += 30;
        if (bio.includes('experience'))
            score += 20;
        if (bio.includes('skills'))
            score += 20;
        if (bio.includes('achievement') || bio.includes('result'))
            score += 30;
        return Math.min(score, 100);
    }
    getSummaryIssues(bio) {
        const issues = [];
        if (!bio)
            issues.push('Professional summary is missing');
        else {
            if (bio.length < 50)
                issues.push('Summary is too brief');
            if (bio.length > 300)
                issues.push('Summary is too long');
            if (!bio.includes('experience') && !bio.includes('skills'))
                issues.push('Summary lacks key information');
        }
        return issues;
    }
    generateRecommendations(candidate) {
        const recommendations = [];
        if (candidate.experience.length === 0) {
            recommendations.push({
                priority: 'HIGH',
                category: 'Experience',
                suggestion: 'Add work experience to your profile',
                impact: 'Essential for most job applications',
            });
        }
        if (!candidate.bio || candidate.bio.length < 50) {
            recommendations.push({
                priority: 'HIGH',
                category: 'Summary',
                suggestion: 'Write a compelling professional summary',
                impact: 'Creates strong first impression',
            });
        }
        if (candidate.skills.length < 5) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Skills',
                suggestion: 'Add more relevant skills',
                impact: 'Improves keyword matching',
            });
        }
        if (!candidate.linkedinUrl) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Profile',
                suggestion: 'Add LinkedIn profile',
                impact: 'Enhances professional credibility',
            });
        }
        return recommendations;
    }
    identifyStrengths(candidate) {
        const strengths = [];
        if (candidate.experience.length > 0)
            strengths.push('Has work experience');
        if (candidate.education.length > 0)
            strengths.push('Educational background present');
        if (candidate.skills.length > 0)
            strengths.push('Skills are listed');
        if (candidate.bio && candidate.bio.length > 50)
            strengths.push('Professional summary present');
        if (candidate.linkedinUrl)
            strengths.push('LinkedIn profile connected');
        return strengths;
    }
    identifyWeaknesses(candidate) {
        const weaknesses = [];
        if (candidate.experience.length === 0)
            weaknesses.push('No work experience');
        if (!candidate.bio || candidate.bio.length < 50)
            weaknesses.push('Weak professional summary');
        if (candidate.skills.length < 3)
            weaknesses.push('Limited skills listed');
        if (!candidate.linkedinUrl)
            weaknesses.push('Missing LinkedIn profile');
        return weaknesses;
    }
    calculateATSCompatibility(candidate) {
        let score = 0;
        if (candidate.firstName && candidate.lastName)
            score += 20;
        if (candidate.user.email)
            score += 20;
        if (candidate.user.phone)
            score += 15;
        if (candidate.experience.length > 0)
            score += 20;
        if (candidate.education.length > 0)
            score += 15;
        if (candidate.skills.length > 0)
            score += 10;
        return Math.min(score, 100);
    }
    getATSIssues(candidate) {
        const issues = [];
        if (!candidate.user.phone)
            issues.push('Phone number missing');
        if (candidate.experience.length === 0)
            issues.push('No work experience');
        if (candidate.skills.length === 0)
            issues.push('No skills listed');
        return issues;
    }
    getATSSuggestions(candidate) {
        const suggestions = [];
        suggestions.push('Use standard section headers (Experience, Education, Skills)');
        suggestions.push('Include relevant keywords from job descriptions');
        suggestions.push('Avoid graphics and complex formatting');
        suggestions.push('Use simple, clean layout');
        return suggestions;
    }
    generateOptimizationSuggestions(candidate) {
        const suggestions = [];
        if (candidate.experience.length > 0) {
            const exp = candidate.experience[0];
            if (!exp.achievements) {
                suggestions.push({
                    category: 'Experience',
                    priority: 'HIGH',
                    current: exp.description || 'Job description',
                    suggested: 'Add quantifiable achievements and results',
                    reason: 'Quantifiable achievements are more impactful',
                    impact: 'High - Increases chances of getting interviews',
                });
            }
        }
        if (candidate.skills.length > 0) {
            suggestions.push({
                category: 'Skills',
                priority: 'MEDIUM',
                current: 'Basic skill listing',
                suggested: 'Add skill levels and years of experience',
                reason: 'More detailed skills information',
                impact: 'Medium - Better keyword matching',
            });
        }
        if (!candidate.bio || candidate.bio.length < 100) {
            suggestions.push({
                category: 'Summary',
                priority: 'HIGH',
                current: candidate.bio || 'No summary',
                suggested: 'Write a compelling professional summary highlighting key achievements',
                reason: 'Professional summary is crucial for first impression',
                impact: 'High - Creates stronger first impression',
            });
        }
        return suggestions;
    }
    generateKeywordOptimization(candidate) {
        const missing = ['Agile', 'Scrum', 'Git', 'Docker', 'AWS', 'CI/CD'];
        const overused = ['Experienced', 'Skilled', 'Proficient'];
        const suggested = ['Expert', 'Advanced', 'Specialized', 'Certified'];
        return {
            missing: missing.filter((keyword) => !candidate.skills.some((skill) => skill.skillName.toLowerCase().includes(keyword.toLowerCase()))),
            overused: overused.filter((keyword) => candidate.bio?.toLowerCase().includes(keyword.toLowerCase())),
            suggested,
        };
    }
    generateFormattingSuggestions(candidate) {
        const suggestions = [];
        if (candidate.experience.length > 0) {
            suggestions.push({
                issue: 'Inconsistent date formatting',
                suggestion: 'Use MM/YYYY format consistently throughout',
                impact: 'Improves readability and professionalism',
            });
        }
        suggestions.push({
            issue: 'Missing section headers',
            suggestion: 'Use clear section headers (Experience, Education, Skills)',
            impact: 'Enhances ATS compatibility',
        });
        return suggestions;
    }
    generateLengthOptimization(candidate) {
        const currentLength = this.estimateResumeLength(candidate);
        const recommendedLength = 1.5;
        return {
            currentLength,
            recommendedLength,
            suggestions: [
                'Remove outdated experience (older than 10 years)',
                'Consolidate similar skills',
                'Shorten job descriptions to focus on key achievements',
            ],
        };
    }
    estimateResumeLength(candidate) {
        let length = 0;
        if (candidate.bio)
            length += 0.2;
        if (candidate.experience.length > 0)
            length += candidate.experience.length * 0.3;
        if (candidate.education.length > 0)
            length += candidate.education.length * 0.2;
        if (candidate.skills.length > 0)
            length += 0.3;
        return Math.round(length * 10) / 10;
    }
    async logActivity(userId, action, level, entity, entityId, description, metadata, ipAddress, userAgent) {
        try {
            await this.db.activityLog.create({
                data: {
                    userId,
                    action,
                    level,
                    entity,
                    entityId,
                    description,
                    metadata,
                    ipAddress,
                    userAgent,
                },
            });
        }
        catch (error) {
            console.error('Failed to log activity:', error);
        }
    }
    async updateCandidateProfile(userId, updateDto) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const updateData = { ...updateDto };
            if (updateDto.dateOfBirth) {
                updateData.dateOfBirth = new Date(updateDto.dateOfBirth);
            }
            const updatedCandidate = await this.db.candidate.update({
                where: { id: candidate.id },
                data: updateData,
                include: {
                    city: {
                        include: {
                            state: {
                                include: {
                                    country: true,
                                },
                            },
                        },
                    },
                    user: {
                        select: {
                            email: true,
                            phone: true,
                        },
                    },
                    skills: true,
                    education: true,
                    experience: true,
                },
            });
            await this.logActivity(userId, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'Candidate', candidate.id, 'Profile updated');
            return {
                id: updatedCandidate.id,
                userId: updatedCandidate.userId,
                firstName: updatedCandidate.firstName,
                lastName: updatedCandidate.lastName,
                fatherName: updatedCandidate.fatherName || undefined,
                dateOfBirth: updatedCandidate.dateOfBirth || undefined,
                gender: updatedCandidate.gender || undefined,
                maritalStatus: updatedCandidate.maritalStatus || undefined,
                profilePicture: updatedCandidate.profilePicture || undefined,
                bio: updatedCandidate.bio || undefined,
                currentTitle: updatedCandidate.currentTitle || undefined,
                currentCompany: updatedCandidate.currentCompany || undefined,
                currentLocation: updatedCandidate.currentLocation || undefined,
                preferredLocation: updatedCandidate.preferredLocation || undefined,
                noticePeriod: updatedCandidate.noticePeriod || undefined,
                currentSalary: updatedCandidate.currentSalary
                    ? Number(updatedCandidate.currentSalary)
                    : undefined,
                expectedSalary: updatedCandidate.expectedSalary
                    ? Number(updatedCandidate.expectedSalary)
                    : undefined,
                profileType: updatedCandidate.profileType || undefined,
                experienceYears: updatedCandidate.experienceYears || undefined,
                address: updatedCandidate.address || undefined,
                linkedinUrl: updatedCandidate.linkedinUrl || undefined,
                githubUrl: updatedCandidate.githubUrl || undefined,
                portfolioUrl: updatedCandidate.portfolioUrl || undefined,
                isAvailable: updatedCandidate.isAvailable,
                email: updatedCandidate.email || undefined,
                mobileNumber: updatedCandidate.mobileNumber || undefined,
                jobExperience: updatedCandidate.jobExperience || undefined,
                country: updatedCandidate.country || undefined,
                state: updatedCandidate.state || undefined,
                cityName: updatedCandidate.cityName || undefined,
                streetAddress: updatedCandidate.streetAddress || undefined,
                profileSummary: updatedCandidate.profileSummary || undefined,
                createdAt: updatedCandidate.createdAt,
                updatedAt: updatedCandidate.updatedAt,
                user: updatedCandidate.user,
                city: updatedCandidate.city,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async uploadProfilePicture(userId, file) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const profilePicture = `/uploads/profile-pictures/${file.filename}`;
            await this.db.candidate.update({
                where: { id: candidate.id },
                data: { profilePicture },
            });
            await this.logActivity(userId, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'Candidate', candidate.id, 'Profile picture uploaded');
            return {
                message: 'Profile picture uploaded successfully',
                profilePicture,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async deleteProfilePicture(userId) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            await this.db.candidate.update({
                where: { id: candidate.id },
                data: { profilePicture: null },
            });
            await this.logActivity(userId, client_1.LogAction.DELETE, client_1.LogLevel.INFO, 'Candidate', candidate.id, 'Profile picture deleted');
            return { message: 'Profile picture deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async updateAvailability(userId, updateDto) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            await this.db.candidate.update({
                where: { id: candidate.id },
                data: { isAvailable: updateDto.isAvailable },
            });
            await this.logActivity(userId, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'Candidate', candidate.id, `Availability updated to ${updateDto.isAvailable ? 'available' : 'unavailable'}`);
            return { message: 'Availability updated successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async getCandidateSkills(userId) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const skills = await this.db.candidateSkill.findMany({
                where: { candidateId: candidate.id },
                orderBy: { skillName: 'asc' },
            });
            return skills.map((skill) => ({
                id: skill.id,
                candidateId: skill.candidateId,
                skillName: skill.skillName,
                level: skill.level,
                yearsUsed: skill.yearsUsed,
            }));
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async addCandidateSkill(userId, createDto) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const existingSkill = await this.db.candidateSkill.findFirst({
                where: {
                    candidateId: candidate.id,
                    skillName: createDto.skillName,
                },
            });
            if (existingSkill) {
                throw new common_1.BadRequestException('Skill already exists');
            }
            const skill = await this.db.candidateSkill.create({
                data: {
                    candidateId: candidate.id,
                    skillName: createDto.skillName,
                    level: createDto.level,
                    yearsUsed: createDto.yearsUsed,
                },
            });
            await this.logActivity(userId, client_1.LogAction.CREATE, client_1.LogLevel.INFO, 'CandidateSkill', skill.id, `Skill added: ${createDto.skillName}`);
            return {
                id: skill.id,
                candidateId: skill.candidateId,
                skillName: skill.skillName,
                level: skill.level,
                yearsUsed: skill.yearsUsed,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async updateCandidateSkill(userId, skillId, updateDto) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const skill = await this.db.candidateSkill.findFirst({
                where: {
                    id: skillId,
                    candidateId: candidate.id,
                },
            });
            if (!skill) {
                throw new common_1.NotFoundException('Skill not found');
            }
            if (updateDto.skillName && updateDto.skillName !== skill.skillName) {
                const existingSkill = await this.db.candidateSkill.findFirst({
                    where: {
                        candidateId: candidate.id,
                        skillName: updateDto.skillName,
                        id: { not: skillId },
                    },
                });
                if (existingSkill) {
                    throw new common_1.BadRequestException('Skill name already exists');
                }
            }
            const updatedSkill = await this.db.candidateSkill.update({
                where: { id: skillId },
                data: updateDto,
            });
            await this.logActivity(userId, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'CandidateSkill', skillId, `Skill updated: ${updatedSkill.skillName}`);
            return {
                id: updatedSkill.id,
                candidateId: updatedSkill.candidateId,
                skillName: updatedSkill.skillName,
                level: updatedSkill.level,
                yearsUsed: updatedSkill.yearsUsed,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async deleteCandidateSkill(userId, skillId) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const skill = await this.db.candidateSkill.findFirst({
                where: {
                    id: skillId,
                    candidateId: candidate.id,
                },
            });
            if (!skill) {
                throw new common_1.NotFoundException('Skill not found');
            }
            await this.db.candidateSkill.delete({
                where: { id: skillId },
            });
            await this.logActivity(userId, client_1.LogAction.DELETE, client_1.LogLevel.INFO, 'CandidateSkill', skillId, `Skill deleted: ${skill.skillName}`);
            return { message: 'Skill deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async getCandidateEducation(userId) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const education = await this.db.candidateEducation.findMany({
                where: { candidateId: candidate.id },
                orderBy: { startDate: 'desc' },
            });
            return education.map((edu) => ({
                id: edu.id,
                candidateId: edu.candidateId,
                institution: edu.institution,
                degree: edu.degree,
                fieldOfStudy: edu.fieldOfStudy,
                level: edu.level,
                startDate: edu.startDate,
                endDate: edu.endDate,
                isCompleted: edu.isCompleted,
                grade: edu.grade,
                description: edu.description,
                createdAt: edu.createdAt,
            }));
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async addCandidateEducation(userId, createDto) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const education = await this.db.candidateEducation.create({
                data: {
                    candidateId: candidate.id,
                    institution: createDto.institution,
                    degree: createDto.degree,
                    fieldOfStudy: createDto.fieldOfStudy,
                    level: createDto.level,
                    startDate: new Date(createDto.startDate),
                    endDate: createDto.endDate ? new Date(createDto.endDate) : null,
                    isCompleted: createDto.isCompleted ?? false,
                    grade: createDto.grade,
                    description: createDto.description,
                },
            });
            await this.logActivity(userId, client_1.LogAction.CREATE, client_1.LogLevel.INFO, 'CandidateEducation', education.id, `Education added: ${createDto.degree} at ${createDto.institution}`);
            return {
                id: education.id,
                candidateId: education.candidateId,
                institution: education.institution,
                degree: education.degree,
                fieldOfStudy: education.fieldOfStudy,
                level: education.level,
                startDate: education.startDate,
                endDate: education.endDate,
                isCompleted: education.isCompleted,
                grade: education.grade,
                description: education.description,
                createdAt: education.createdAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async updateCandidateEducation(userId, educationId, updateDto) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const education = await this.db.candidateEducation.findFirst({
                where: {
                    id: educationId,
                    candidateId: candidate.id,
                },
            });
            if (!education) {
                throw new common_1.NotFoundException('Education record not found');
            }
            const updateData = { ...updateDto };
            if (updateDto.startDate) {
                updateData.startDate = new Date(updateDto.startDate);
            }
            if (updateDto.endDate) {
                updateData.endDate = new Date(updateDto.endDate);
            }
            const updatedEducation = await this.db.candidateEducation.update({
                where: { id: educationId },
                data: updateData,
            });
            await this.logActivity(userId, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'CandidateEducation', educationId, `Education updated: ${updatedEducation.degree} at ${updatedEducation.institution}`);
            return {
                id: updatedEducation.id,
                candidateId: updatedEducation.candidateId,
                institution: updatedEducation.institution,
                degree: updatedEducation.degree,
                fieldOfStudy: updatedEducation.fieldOfStudy,
                level: updatedEducation.level,
                startDate: updatedEducation.startDate,
                endDate: updatedEducation.endDate,
                isCompleted: updatedEducation.isCompleted,
                grade: updatedEducation.grade,
                description: updatedEducation.description,
                createdAt: updatedEducation.createdAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async deleteCandidateEducation(userId, educationId) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const education = await this.db.candidateEducation.findFirst({
                where: {
                    id: educationId,
                    candidateId: candidate.id,
                },
            });
            if (!education) {
                throw new common_1.NotFoundException('Education record not found');
            }
            await this.db.candidateEducation.delete({
                where: { id: educationId },
            });
            await this.logActivity(userId, client_1.LogAction.DELETE, client_1.LogLevel.INFO, 'CandidateEducation', educationId, `Education deleted: ${education.degree} at ${education.institution}`);
            return { message: 'Education record deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async getCandidateExperience(userId) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const experience = await this.db.candidateExperience.findMany({
                where: { candidateId: candidate.id },
                orderBy: { startDate: 'desc' },
            });
            return experience.map((exp) => ({
                id: exp.id,
                candidateId: exp.candidateId,
                company: exp.company,
                position: exp.position,
                description: exp.description,
                startDate: exp.startDate,
                endDate: exp.endDate,
                isCurrent: exp.isCurrent,
                location: exp.location,
                achievements: exp.achievements,
                createdAt: exp.createdAt,
            }));
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async addCandidateExperience(userId, createDto) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const experience = await this.db.candidateExperience.create({
                data: {
                    candidateId: candidate.id,
                    company: createDto.company,
                    position: createDto.position,
                    description: createDto.description,
                    startDate: new Date(createDto.startDate),
                    endDate: createDto.endDate ? new Date(createDto.endDate) : null,
                    isCurrent: createDto.isCurrent ?? false,
                    location: createDto.location,
                    achievements: createDto.achievements,
                },
            });
            await this.logActivity(userId, client_1.LogAction.CREATE, client_1.LogLevel.INFO, 'CandidateExperience', experience.id, `Experience added: ${createDto.position} at ${createDto.company}`);
            return {
                id: experience.id,
                candidateId: experience.candidateId,
                company: experience.company,
                position: experience.position,
                description: experience.description,
                startDate: experience.startDate,
                endDate: experience.endDate,
                isCurrent: experience.isCurrent,
                location: experience.location,
                achievements: experience.achievements,
                createdAt: experience.createdAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async updateCandidateExperience(userId, experienceId, updateDto) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const experience = await this.db.candidateExperience.findFirst({
                where: {
                    id: experienceId,
                    candidateId: candidate.id,
                },
            });
            if (!experience) {
                throw new common_1.NotFoundException('Experience record not found');
            }
            const updateData = { ...updateDto };
            if (updateDto.startDate) {
                updateData.startDate = new Date(updateDto.startDate);
            }
            if (updateDto.endDate) {
                updateData.endDate = new Date(updateDto.endDate);
            }
            const updatedExperience = await this.db.candidateExperience.update({
                where: { id: experienceId },
                data: updateData,
            });
            await this.logActivity(userId, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'CandidateExperience', experienceId, `Experience updated: ${updatedExperience.position} at ${updatedExperience.company}`);
            return {
                id: updatedExperience.id,
                candidateId: updatedExperience.candidateId,
                company: updatedExperience.company,
                position: updatedExperience.position,
                description: updatedExperience.description,
                startDate: updatedExperience.startDate,
                endDate: updatedExperience.endDate,
                isCurrent: updatedExperience.isCurrent,
                location: updatedExperience.location,
                achievements: updatedExperience.achievements,
                createdAt: updatedExperience.createdAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async deleteCandidateExperience(userId, experienceId) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const experience = await this.db.candidateExperience.findFirst({
                where: {
                    id: experienceId,
                    candidateId: candidate.id,
                },
            });
            if (!experience) {
                throw new common_1.NotFoundException('Experience record not found');
            }
            await this.db.candidateExperience.delete({
                where: { id: experienceId },
            });
            await this.logActivity(userId, client_1.LogAction.DELETE, client_1.LogLevel.INFO, 'CandidateExperience', experienceId, `Experience deleted: ${experience.position} at ${experience.company}`);
            return { message: 'Experience record deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async getRecommendedJobs(userId, query) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
                include: {
                    skills: true,
                    education: true,
                    experience: true,
                },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            const skip = (page - 1) * limit;
            const whereClause = {
                status: 'PUBLISHED',
            };
            if (candidate.skills && candidate.skills.length > 0) {
                const candidateSkills = candidate.skills.map((skill) => skill.skillName);
                whereClause.skillsRequired = {
                    hasSome: candidateSkills,
                };
            }
            if (candidate.experience && candidate.experience.length > 0) {
                const totalExperience = candidate.experience.reduce((total, exp) => {
                    const startDate = new Date(exp.startDate);
                    const endDate = exp.isCurrent
                        ? new Date()
                        : exp.endDate
                            ? new Date(exp.endDate)
                            : new Date();
                    const years = (endDate.getTime() - startDate.getTime()) /
                        (1000 * 60 * 60 * 24 * 365);
                    return total + years;
                }, 0);
                if (totalExperience >= 5) {
                    whereClause.experienceLevel = { in: ['SENIOR_LEVEL', 'EXECUTIVE'] };
                }
                else if (totalExperience >= 2) {
                    whereClause.experienceLevel = { in: ['MID_LEVEL', 'SENIOR_LEVEL'] };
                }
                else {
                    whereClause.experienceLevel = { in: ['ENTRY_LEVEL', 'MID_LEVEL'] };
                }
            }
            if (candidate.cityId) {
                whereClause.cityId = candidate.cityId;
            }
            const [jobs, total] = await Promise.all([
                this.db.job.findMany({
                    where: whereClause,
                    include: {
                        company: {
                            select: {
                                id: true,
                                name: true,
                                logo: true,
                                industry: true,
                                employeeCount: true,
                                website: true,
                            },
                        },
                        city: {
                            include: {
                                state: {
                                    include: {
                                        country: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                this.db.job.count({ where: whereClause }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                jobs: jobs.map((job) => ({
                    id: job.id,
                    title: job.title,
                    slug: job.slug,
                    description: job.description,
                    requirements: job.requirements,
                    responsibilities: job.responsibilities,
                    benefits: job.benefits,
                    companyId: job.companyId,
                    cityId: job.cityId,
                    address: job.address,
                    jobType: job.jobType,
                    workMode: job.workMode,
                    experienceLevel: job.experienceLevel,
                    minExperience: job.minExperience,
                    maxExperience: job.maxExperience,
                    minSalary: job.minSalary,
                    maxSalary: job.maxSalary,
                    salaryNegotiable: job.salaryNegotiable,
                    skillsRequired: job.skillsRequired,
                    educationLevel: job.educationLevel,
                    applicationCount: job.applicationCount,
                    viewCount: job.viewCount,
                    status: job.status,
                    expiresAt: job.expiresAt,
                    publishedAt: job.publishedAt,
                    createdAt: job.createdAt,
                    company: job.company,
                    location: job.city
                        ? {
                            city: {
                                id: job.city.id,
                                name: job.city.name,
                                state: {
                                    id: job.city.state.id,
                                    name: job.city.state.name,
                                    iso2: job.city.state.iso2,
                                    country: {
                                        id: job.city.state.country.id,
                                        name: job.city.state.country.name,
                                        iso2: job.city.state.country.iso2,
                                    },
                                },
                            },
                        }
                        : null,
                })),
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async getJobAlerts(userId, query) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            const skip = (page - 1) * limit;
            const [alerts, total] = await Promise.all([
                this.db.jobAlert.findMany({
                    where: { candidateId: candidate.id },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                this.db.jobAlert.count({ where: { candidateId: candidate.id } }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                alerts: alerts.map((alert) => ({
                    id: alert.id,
                    candidateId: alert.candidateId,
                    title: alert.title,
                    keywords: alert.keywords || undefined,
                    location: alert.location || undefined,
                    skills: alert.skills,
                    jobType: alert.jobType || undefined,
                    experienceLevel: alert.experienceLevel || undefined,
                    company: alert.company || undefined,
                    isActive: alert.isActive,
                    frequency: alert.frequency,
                    lastSentAt: alert.lastSentAt || undefined,
                    createdAt: alert.createdAt,
                    updatedAt: alert.updatedAt,
                })),
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async createJobAlert(userId, createDto) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const alert = await this.db.jobAlert.create({
                data: {
                    candidateId: candidate.id,
                    title: createDto.title,
                    keywords: createDto.keywords,
                    location: createDto.location,
                    skills: createDto.skills || [],
                    jobType: createDto.jobType,
                    experienceLevel: createDto.experienceLevel,
                    company: createDto.company,
                    isActive: createDto.isActive ?? true,
                    frequency: createDto.frequency || 'WEEKLY',
                },
            });
            await this.logActivity(userId, client_1.LogAction.CREATE, client_1.LogLevel.INFO, 'JobAlert', alert.id, `Job alert created: ${createDto.title}`);
            return {
                id: alert.id,
                candidateId: alert.candidateId,
                title: alert.title,
                keywords: alert.keywords || undefined,
                location: alert.location || undefined,
                skills: alert.skills,
                jobType: alert.jobType || undefined,
                experienceLevel: alert.experienceLevel || undefined,
                company: alert.company || undefined,
                isActive: alert.isActive,
                frequency: alert.frequency,
                lastSentAt: alert.lastSentAt || undefined,
                createdAt: alert.createdAt,
                updatedAt: alert.updatedAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async updateJobAlert(userId, alertId, updateDto) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const alert = await this.db.jobAlert.findFirst({
                where: {
                    id: alertId,
                    candidateId: candidate.id,
                },
            });
            if (!alert) {
                throw new common_1.NotFoundException('Job alert not found');
            }
            const updatedAlert = await this.db.jobAlert.update({
                where: { id: alertId },
                data: updateDto,
            });
            await this.logActivity(userId, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'JobAlert', alertId, `Job alert updated: ${updatedAlert.title}`);
            return {
                id: updatedAlert.id,
                candidateId: updatedAlert.candidateId,
                title: updatedAlert.title,
                keywords: updatedAlert.keywords || undefined,
                location: updatedAlert.location || undefined,
                skills: updatedAlert.skills,
                jobType: updatedAlert.jobType || undefined,
                experienceLevel: updatedAlert.experienceLevel || undefined,
                company: updatedAlert.company || undefined,
                isActive: updatedAlert.isActive,
                frequency: updatedAlert.frequency,
                lastSentAt: updatedAlert.lastSentAt || undefined,
                createdAt: updatedAlert.createdAt,
                updatedAt: updatedAlert.updatedAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async getCandidateApplications(userId, query) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            const skip = (page - 1) * limit;
            const [applications, total] = await Promise.all([
                this.db.jobApplication.findMany({
                    where: { candidateId: candidate.id },
                    include: {
                        job: {
                            include: {
                                company: {
                                    select: {
                                        id: true,
                                        name: true,
                                        logo: true,
                                    },
                                },
                                city: {
                                    include: {
                                        state: {
                                            include: {
                                                country: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        resume: {
                            select: {
                                id: true,
                                title: true,
                                fileName: true,
                                uploadedAt: true,
                            },
                        },
                    },
                    orderBy: { appliedAt: 'desc' },
                    skip,
                    take: limit,
                }),
                this.db.jobApplication.count({ where: { candidateId: candidate.id } }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                applications: applications.map((app) => ({
                    id: app.id,
                    jobId: app.jobId,
                    candidateId: app.candidateId,
                    resumeId: app.resumeId || undefined,
                    coverLetter: app.coverLetter || undefined,
                    status: app.status,
                    appliedAt: app.appliedAt,
                    reviewedAt: app.reviewedAt || undefined,
                    reviewedBy: app.reviewedBy || undefined,
                    feedback: app.feedback || undefined,
                    updatedAt: app.updatedAt,
                    job: {
                        id: app.job.id,
                        title: app.job.title,
                        slug: app.job.slug,
                        description: app.job.description,
                        company: {
                            id: app.job.company.id,
                            name: app.job.company.name,
                            logo: app.job.company.logo || undefined,
                        },
                        location: app.job.city
                            ? {
                                city: {
                                    id: app.job.city.id,
                                    name: app.job.city.name,
                                    state_id: app.job.city.state_id,
                                    state_code: app.job.city.state_code,
                                    state_name: app.job.city.state_name,
                                    country_id: app.job.city.country_id,
                                    country_code: app.job.city.country_code,
                                    country_name: app.job.city.country_name,
                                    latitude: app.job.city.latitude,
                                    longitude: app.job.city.longitude,
                                    wikiDataId: app.job.city.wikiDataId,
                                    isActive: app.job.city.isActive,
                                    createdAt: app.job.city.createdAt,
                                    updatedAt: app.job.city.updatedAt,
                                    state: {
                                        id: app.job.city.state.id,
                                        name: app.job.city.state.name,
                                        country_id: app.job.city.state.country_id,
                                        country_code: app.job.city.state.country_code,
                                        country_name: app.job.city.state.country_name,
                                        iso2: app.job.city.state.iso2,
                                        fips_code: app.job.city.state.fips_code,
                                        type: app.job.city.state.type,
                                        level: app.job.city.state.level,
                                        parent_id: app.job.city.state.parent_id,
                                        latitude: app.job.city.state.latitude,
                                        longitude: app.job.city.state.longitude,
                                        isActive: app.job.city.state.isActive,
                                        createdAt: app.job.city.state.createdAt,
                                        updatedAt: app.job.city.state.updatedAt,
                                        country: {
                                            id: app.job.city.state.country.id,
                                            name: app.job.city.state.country.name,
                                            iso3: app.job.city.state.country.iso3,
                                            iso2: app.job.city.state.country.iso2,
                                            numeric_code: app.job.city.state.country.numeric_code,
                                            phonecode: app.job.city.state.country.phonecode,
                                            capital: app.job.city.state.country.capital,
                                            currency: app.job.city.state.country.currency,
                                            currency_name: app.job.city.state.country.currency_name,
                                            currency_symbol: app.job.city.state.country.currency_symbol,
                                            tld: app.job.city.state.country.tld,
                                            native: app.job.city.state.country.native,
                                            region: app.job.city.state.country.region,
                                            region_id: app.job.city.state.country.region_id,
                                            subregion: app.job.city.state.country.subregion,
                                            subregion_id: app.job.city.state.country.subregion_id,
                                            nationality: app.job.city.state.country.nationality,
                                            latitude: app.job.city.state.country.latitude,
                                            longitude: app.job.city.state.country.longitude,
                                            isActive: app.job.city.state.country.isActive,
                                            createdAt: app.job.city.state.country.createdAt,
                                            updatedAt: app.job.city.state.country.updatedAt,
                                        },
                                    },
                                },
                            }
                            : undefined,
                    },
                    resume: app.resume
                        ? {
                            id: app.resume.id,
                            title: app.resume.title,
                            fileName: app.resume.fileName,
                            uploadedAt: app.resume.uploadedAt,
                        }
                        : undefined,
                })),
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async getApplicationHistory(userId, query) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const page = parseInt(query.page || '1');
            const limit = parseInt(query.limit || '10');
            const skip = (page - 1) * limit;
            const whereClause = { candidateId: candidate.id };
            if (query.status) {
                whereClause.status = query.status;
            }
            if (query.jobTitle || query.companyName) {
                whereClause.job = {};
                if (query.jobTitle) {
                    whereClause.job.title = {
                        contains: query.jobTitle,
                        mode: 'insensitive',
                    };
                }
                if (query.companyName) {
                    whereClause.job.company = {
                        name: { contains: query.companyName, mode: 'insensitive' },
                    };
                }
            }
            if (query.appliedFrom || query.appliedTo) {
                whereClause.appliedAt = {};
                if (query.appliedFrom) {
                    whereClause.appliedAt.gte = new Date(query.appliedFrom);
                }
                if (query.appliedTo) {
                    whereClause.appliedAt.lte = new Date(query.appliedTo);
                }
            }
            const [applications, total] = await Promise.all([
                this.db.jobApplication.findMany({
                    where: whereClause,
                    include: {
                        job: {
                            include: {
                                company: {
                                    select: {
                                        id: true,
                                        name: true,
                                        logo: true,
                                    },
                                },
                                city: {
                                    include: {
                                        state: {
                                            include: {
                                                country: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        resume: {
                            select: {
                                id: true,
                                title: true,
                                fileName: true,
                                uploadedAt: true,
                            },
                        },
                    },
                    orderBy: { appliedAt: 'desc' },
                    skip,
                    take: limit,
                }),
                this.db.jobApplication.count({ where: whereClause }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                applications: applications.map((app) => ({
                    id: app.id,
                    jobId: app.jobId,
                    candidateId: app.candidateId,
                    resumeId: app.resumeId || undefined,
                    coverLetter: app.coverLetter || undefined,
                    status: app.status,
                    appliedAt: app.appliedAt,
                    reviewedAt: app.reviewedAt || undefined,
                    reviewedBy: app.reviewedBy || undefined,
                    feedback: app.feedback || undefined,
                    updatedAt: app.updatedAt,
                    job: {
                        id: app.job.id,
                        title: app.job.title,
                        slug: app.job.slug,
                        description: app.job.description,
                        company: {
                            id: app.job.company.id,
                            name: app.job.company.name,
                            logo: app.job.company.logo || undefined,
                        },
                        location: app.job.city
                            ? {
                                city: {
                                    id: app.job.city.id,
                                    name: app.job.city.name,
                                    state_id: app.job.city.state_id,
                                    state_code: app.job.city.state_code,
                                    state_name: app.job.city.state_name,
                                    country_id: app.job.city.country_id,
                                    country_code: app.job.city.country_code,
                                    country_name: app.job.city.country_name,
                                    latitude: app.job.city.latitude,
                                    longitude: app.job.city.longitude,
                                    wikiDataId: app.job.city.wikiDataId,
                                    isActive: app.job.city.isActive,
                                    createdAt: app.job.city.createdAt,
                                    updatedAt: app.job.city.updatedAt,
                                    state: {
                                        id: app.job.city.state.id,
                                        name: app.job.city.state.name,
                                        country_id: app.job.city.state.country_id,
                                        country_code: app.job.city.state.country_code,
                                        country_name: app.job.city.state.country_name,
                                        iso2: app.job.city.state.iso2,
                                        fips_code: app.job.city.state.fips_code,
                                        type: app.job.city.state.type,
                                        level: app.job.city.state.level,
                                        parent_id: app.job.city.state.parent_id,
                                        latitude: app.job.city.state.latitude,
                                        longitude: app.job.city.state.longitude,
                                        isActive: app.job.city.state.isActive,
                                        createdAt: app.job.city.state.createdAt,
                                        updatedAt: app.job.city.state.updatedAt,
                                        country: {
                                            id: app.job.city.state.country.id,
                                            name: app.job.city.state.country.name,
                                            iso3: app.job.city.state.country.iso3,
                                            iso2: app.job.city.state.country.iso2,
                                            numeric_code: app.job.city.state.country.numeric_code,
                                            phonecode: app.job.city.state.country.phonecode,
                                            capital: app.job.city.state.country.capital,
                                            currency: app.job.city.state.country.currency,
                                            currency_name: app.job.city.state.country.currency_name,
                                            currency_symbol: app.job.city.state.country.currency_symbol,
                                            tld: app.job.city.state.country.tld,
                                            native: app.job.city.state.country.native,
                                            region: app.job.city.state.country.region,
                                            region_id: app.job.city.state.country.region_id,
                                            subregion: app.job.city.state.country.subregion,
                                            subregion_id: app.job.city.state.country.subregion_id,
                                            nationality: app.job.city.state.country.nationality,
                                            latitude: app.job.city.state.country.latitude,
                                            longitude: app.job.city.state.country.longitude,
                                            isActive: app.job.city.state.country.isActive,
                                            createdAt: app.job.city.state.country.createdAt,
                                            updatedAt: app.job.city.state.country.updatedAt,
                                        },
                                    },
                                },
                            }
                            : undefined,
                    },
                    resume: app.resume
                        ? {
                            id: app.resume.id,
                            title: app.resume.title,
                            fileName: app.resume.fileName,
                            uploadedAt: app.resume.uploadedAt,
                        }
                        : undefined,
                })),
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async getApplicationDetails(userId, applicationId) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const application = await this.db.jobApplication.findFirst({
                where: {
                    id: applicationId,
                    candidateId: candidate.id,
                },
                include: {
                    job: {
                        include: {
                            company: {
                                select: {
                                    id: true,
                                    name: true,
                                    logo: true,
                                },
                            },
                            city: {
                                include: {
                                    state: {
                                        include: {
                                            country: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    resume: {
                        select: {
                            id: true,
                            title: true,
                            fileName: true,
                            uploadedAt: true,
                        },
                    },
                },
            });
            if (!application) {
                throw new common_1.NotFoundException('Application not found');
            }
            return {
                id: application.id,
                jobId: application.jobId,
                candidateId: application.candidateId,
                resumeId: application.resumeId || undefined,
                coverLetter: application.coverLetter || undefined,
                status: application.status,
                appliedAt: application.appliedAt,
                reviewedAt: application.reviewedAt || undefined,
                reviewedBy: application.reviewedBy || undefined,
                feedback: application.feedback || undefined,
                updatedAt: application.updatedAt,
                job: {
                    id: application.job.id,
                    title: application.job.title,
                    slug: application.job.slug,
                    description: application.job.description,
                    company: {
                        id: application.job.company.id,
                        name: application.job.company.name,
                        logo: application.job.company.logo || undefined,
                    },
                    location: application.job.city
                        ? {
                            city: {
                                id: application.job.city.id,
                                name: application.job.city.name,
                                state_id: application.job.city.state_id,
                                state_code: application.job.city.state_code,
                                state_name: application.job.city.state_name,
                                country_id: application.job.city.country_id,
                                country_code: application.job.city.country_code,
                                country_name: application.job.city.country_name,
                                latitude: application.job.city.latitude,
                                longitude: application.job.city.longitude,
                                wikiDataId: application.job.city.wikiDataId,
                                isActive: application.job.city.isActive,
                                createdAt: application.job.city.createdAt,
                                updatedAt: application.job.city.updatedAt,
                                state: {
                                    id: application.job.city.state.id,
                                    name: application.job.city.state.name,
                                    country_id: application.job.city.state.country_id,
                                    country_code: application.job.city.state.country_code,
                                    country_name: application.job.city.state.country_name,
                                    iso2: application.job.city.state.iso2,
                                    fips_code: application.job.city.state.fips_code,
                                    type: application.job.city.state.type,
                                    level: application.job.city.state.level,
                                    parent_id: application.job.city.state.parent_id,
                                    latitude: application.job.city.state.latitude,
                                    longitude: application.job.city.state.longitude,
                                    isActive: application.job.city.state.isActive,
                                    createdAt: application.job.city.state.createdAt,
                                    updatedAt: application.job.city.state.updatedAt,
                                    country: {
                                        id: application.job.city.state.country.id,
                                        name: application.job.city.state.country.name,
                                        iso3: application.job.city.state.country.iso3,
                                        iso2: application.job.city.state.country.iso2,
                                        numeric_code: application.job.city.state.country.numeric_code,
                                        phonecode: application.job.city.state.country.phonecode,
                                        capital: application.job.city.state.country.capital,
                                        currency: application.job.city.state.country.currency,
                                        currency_name: application.job.city.state.country.currency_name,
                                        currency_symbol: application.job.city.state.country.currency_symbol,
                                        tld: application.job.city.state.country.tld,
                                        native: application.job.city.state.country.native,
                                        region: application.job.city.state.country.region,
                                        region_id: application.job.city.state.country.region_id,
                                        subregion: application.job.city.state.country.subregion,
                                        subregion_id: application.job.city.state.country.subregion_id,
                                        nationality: application.job.city.state.country.nationality,
                                        latitude: application.job.city.state.country.latitude,
                                        longitude: application.job.city.state.country.longitude,
                                        isActive: application.job.city.state.country.isActive,
                                        createdAt: application.job.city.state.country.createdAt,
                                        updatedAt: application.job.city.state.country.updatedAt,
                                    },
                                },
                            },
                        }
                        : undefined,
                },
                resume: application.resume
                    ? {
                        id: application.resume.id,
                        title: application.resume.title,
                        fileName: application.resume.fileName,
                        uploadedAt: application.resume.uploadedAt,
                    }
                    : undefined,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async updateApplication(userId, applicationId, updateDto) {
        try {
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const application = await this.db.jobApplication.findFirst({
                where: {
                    id: applicationId,
                    candidateId: candidate.id,
                },
            });
            if (!application) {
                throw new common_1.NotFoundException('Application not found');
            }
            const updateData = {};
            if (updateDto.coverLetter !== undefined) {
                updateData.coverLetter = updateDto.coverLetter;
            }
            if (updateDto.status === 'WITHDRAWN') {
                updateData.status = updateDto.status;
            }
            const updatedApplication = await this.db.jobApplication.update({
                where: { id: applicationId },
                data: updateData,
                include: {
                    job: {
                        include: {
                            company: {
                                select: {
                                    id: true,
                                    name: true,
                                    logo: true,
                                },
                            },
                            city: {
                                include: {
                                    state: {
                                        include: {
                                            country: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    resume: {
                        select: {
                            id: true,
                            title: true,
                            fileName: true,
                            uploadedAt: true,
                        },
                    },
                },
            });
            await this.logActivity(userId, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'JobApplication', applicationId, 'Application updated');
            return {
                id: updatedApplication.id,
                jobId: updatedApplication.jobId,
                candidateId: updatedApplication.candidateId,
                resumeId: updatedApplication.resumeId || undefined,
                coverLetter: updatedApplication.coverLetter || undefined,
                status: updatedApplication.status,
                appliedAt: updatedApplication.appliedAt,
                reviewedAt: updatedApplication.reviewedAt || undefined,
                reviewedBy: updatedApplication.reviewedBy || undefined,
                feedback: updatedApplication.feedback || undefined,
                updatedAt: updatedApplication.updatedAt,
                job: {
                    id: updatedApplication.job.id,
                    title: updatedApplication.job.title,
                    slug: updatedApplication.job.slug,
                    description: updatedApplication.job.description,
                    company: {
                        id: updatedApplication.job.company.id,
                        name: updatedApplication.job.company.name,
                        logo: updatedApplication.job.company.logo || undefined,
                    },
                    location: updatedApplication.job.city
                        ? {
                            city: {
                                id: updatedApplication.job.city.id,
                                name: updatedApplication.job.city.name,
                                state_id: updatedApplication.job.city.state_id,
                                state_code: updatedApplication.job.city.state_code,
                                state_name: updatedApplication.job.city.state_name,
                                country_id: updatedApplication.job.city.country_id,
                                country_code: updatedApplication.job.city.country_code,
                                country_name: updatedApplication.job.city.country_name,
                                latitude: updatedApplication.job.city.latitude,
                                longitude: updatedApplication.job.city.longitude,
                                wikiDataId: updatedApplication.job.city.wikiDataId,
                                isActive: updatedApplication.job.city.isActive,
                                createdAt: updatedApplication.job.city.createdAt,
                                updatedAt: updatedApplication.job.city.updatedAt,
                                state: {
                                    id: updatedApplication.job.city.state.id,
                                    name: updatedApplication.job.city.state.name,
                                    country_id: updatedApplication.job.city.state.country_id,
                                    country_code: updatedApplication.job.city.state.country_code,
                                    country_name: updatedApplication.job.city.state.country_name,
                                    iso2: updatedApplication.job.city.state.iso2,
                                    fips_code: updatedApplication.job.city.state.fips_code,
                                    type: updatedApplication.job.city.state.type,
                                    level: updatedApplication.job.city.state.level,
                                    parent_id: updatedApplication.job.city.state.parent_id,
                                    latitude: updatedApplication.job.city.state.latitude,
                                    longitude: updatedApplication.job.city.state.longitude,
                                    isActive: updatedApplication.job.city.state.isActive,
                                    createdAt: updatedApplication.job.city.state.createdAt,
                                    updatedAt: updatedApplication.job.city.state.updatedAt,
                                    country: {
                                        id: updatedApplication.job.city.state.country.id,
                                        name: updatedApplication.job.city.state.country.name,
                                        iso3: updatedApplication.job.city.state.country.iso3,
                                        iso2: updatedApplication.job.city.state.country.iso2,
                                        numeric_code: updatedApplication.job.city.state.country.numeric_code,
                                        phonecode: updatedApplication.job.city.state.country.phonecode,
                                        capital: updatedApplication.job.city.state.country.capital,
                                        currency: updatedApplication.job.city.state.country.currency,
                                        currency_name: updatedApplication.job.city.state.country.currency_name,
                                        currency_symbol: updatedApplication.job.city.state.country.currency_symbol,
                                        tld: updatedApplication.job.city.state.country.tld,
                                        native: updatedApplication.job.city.state.country.native,
                                        region: updatedApplication.job.city.state.country.region,
                                        region_id: updatedApplication.job.city.state.country.region_id,
                                        subregion: updatedApplication.job.city.state.country.subregion,
                                        subregion_id: updatedApplication.job.city.state.country.subregion_id,
                                        nationality: updatedApplication.job.city.state.country.nationality,
                                        latitude: updatedApplication.job.city.state.country.latitude,
                                        longitude: updatedApplication.job.city.state.country.longitude,
                                        isActive: updatedApplication.job.city.state.country.isActive,
                                        createdAt: updatedApplication.job.city.state.country.createdAt,
                                        updatedAt: updatedApplication.job.city.state.country.updatedAt,
                                    },
                                },
                            },
                        }
                        : undefined,
                },
                resume: updatedApplication.resume
                    ? {
                        id: updatedApplication.resume.id,
                        title: updatedApplication.resume.title,
                        fileName: updatedApplication.resume.fileName,
                        uploadedAt: updatedApplication.resume.uploadedAt,
                    }
                    : undefined,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    handleException(error) {
        throw new common_1.InternalServerErrorException("Can't process candidate request");
    }
};
exports.CandidateService = CandidateService;
exports.CandidateService = CandidateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], CandidateService);
//# sourceMappingURL=candidate.service.js.map