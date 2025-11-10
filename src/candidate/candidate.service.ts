import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../database/database.service';
import type { Express } from 'express';
import {
  UpdateCandidateProfileDto,
  UpdateAvailabilityDto,
  CandidateProfileResponseDto,
} from './dto/candidate-profile.dto';
import {
  CreateCandidateSkillDto,
  UpdateCandidateSkillDto,
  CandidateSkillResponseDto,
} from './dto/candidate-skill.dto';
import {
  CreateCandidateEducationDto,
  UpdateCandidateEducationDto,
  CandidateEducationResponseDto,
} from './dto/candidate-education.dto';
import {
  CreateCandidateExperienceDto,
  UpdateCandidateExperienceDto,
  CandidateExperienceResponseDto,
} from './dto/candidate-experience.dto';
import {
  CreateJobAlertDto,
  UpdateJobAlertDto,
  JobAlertResponseDto,
  RecommendedJobsResponseDto,
  JobAlertsResponseDto,
} from './dto/job-alert.dto';
import {
  ApplyForJobDto,
  UpdateApplicationDto,
  ApplicationResponseDto,
  ApplicationsResponseDto,
  ApplicationHistoryQueryDto,
} from './dto/job-application.dto';
import {
  ResumeParseRequestDto,
  ResumeParseResponseDto,
  ResumeAnalysisResponseDto,
  ResumeOptimizationResponseDto,
} from './dto/resume-analysis.dto';
import { UpsertFullProfileDto } from './dto/upsert-full-profile.dto';
import { CandidateCompleteProfileResponseDto } from './dto/candidate-complete-profile.dto';
import { LogAction, LogLevel } from '@prisma/client';
import { PdfExtractorService } from '../admin/services/pdf-extractor.service';

@Injectable()
export class CandidateService {
  private readonly logger = new Logger(CandidateService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly pdfExtractor: PdfExtractorService,
  ) {}

  // =================================================================
  // CANDIDATE PROFILE MANAGEMENT
  // =================================================================

  async createCandidate(
    userId: string,
    createDto: any,
  ): Promise<CandidateProfileResponseDto> {
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

      await this.logActivity(
        userId,
        LogAction.CREATE,
        LogLevel.INFO,
        'Candidate',
        candidate.id,
        'Candidate profile created',
      );

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
              state_name: candidate.city.state?.name,
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
                latitude: candidate.city.state.latitude,
                longitude: candidate.city.state.longitude,
                isActive: candidate.city.state.isActive,
                createdAt: candidate.city.state.createdAt,
                updatedAt: candidate.city.state.updatedAt,
                country: candidate.city.state.country ? {
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
                } : undefined,
              },
            }
          : undefined,
      };
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async getCandidateProfile(
    userId: string,
  ): Promise<CandidateProfileResponseDto> {
    try {
      // Get or create candidate record
      const candidate = await this.getOrCreateCandidate(userId);

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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async updateCandidate(
    userId: string,
    updateDto: any,
  ): Promise<CandidateProfileResponseDto> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
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

      await this.logActivity(
        userId,
        LogAction.UPDATE,
        LogLevel.INFO,
        'Candidate',
        candidate.id,
        'Candidate profile updated',
      );

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
              state_name: updatedCandidate.city.state?.name,
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
                latitude: updatedCandidate.city.state.latitude,
                longitude: updatedCandidate.city.state.longitude,
                isActive: updatedCandidate.city.state.isActive,
                createdAt: updatedCandidate.city.state.createdAt,
                updatedAt: updatedCandidate.city.state.updatedAt,
                country: updatedCandidate.city.state.country ? {
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
                } : undefined,
              },
            }
          : undefined,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  // =================================================================
  // RESUME PARSING & ANALYSIS
  // =================================================================

  async parseResume(
    userId: string,
    parseDto: ResumeParseRequestDto,
  ): Promise<ResumeParseResponseDto> {
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
        throw new NotFoundException('Candidate profile not found');
      }

      // If resumeId is provided, get the resume
      let resume: any = null;
      if (parseDto.resumeId) {
        resume = await this.db.resume.findFirst({
          where: {
            id: parseDto.resumeId,
            candidateId: candidate.id,
          },
        });

        if (!resume) {
          throw new NotFoundException('Resume not found');
        }
      }

      // Extract data from existing candidate profile
      const extractedData = {
        personalInfo: {
          name: `${candidate.firstName} ${candidate.lastName}`,
          email: candidate.user.email,
          phone: candidate.user.phone || '',
          location: candidate.city
            ? `${candidate.city.name}, ${candidate.city.state.name}, ${candidate.city.state.country?.name || 'Unknown'}`
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
        summary:
          candidate.bio || 'Professional with relevant experience and skills',
      };

      // Log the resume parsing activity
      await this.logActivity(
        userId,
        LogAction.VIEW,
        LogLevel.INFO,
        'Resume',
        resume?.id || 'parse',
        'Resume parsed for data extraction',
      );

      return {
        success: true,
        extractedData,
        confidence: 90,
        message: 'Resume parsed successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async getResumeAnalysis(
    userId: string,
    resumeId: string,
  ): Promise<ResumeAnalysisResponseDto> {
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
        throw new NotFoundException('Candidate profile not found');
      }

      const resume = await this.db.resume.findFirst({
        where: {
          id: resumeId,
          candidateId: candidate.id,
        },
      });

      if (!resume) {
        throw new NotFoundException('Resume not found');
      }

      // Calculate scores based on actual data
      const personalInfoScore = this.calculatePersonalInfoScore(candidate);
      const experienceScore = this.calculateExperienceScore(
        candidate.experience,
      );
      const educationScore = this.calculateEducationScore(candidate.education);
      const skillsScore = this.calculateSkillsScore(candidate.skills);
      const summaryScore = this.calculateSummaryScore(candidate.bio);

      const overallScore = Math.round(
        (personalInfoScore +
          experienceScore +
          educationScore +
          skillsScore +
          summaryScore) /
          5,
      );

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

      // Log the resume analysis activity
      await this.logActivity(
        userId,
        LogAction.VIEW,
        LogLevel.INFO,
        'Resume',
        resumeId,
        'Resume analysis generated',
      );

      return analysis;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async optimizeResume(
    userId: string,
    resumeId: string,
  ): Promise<ResumeOptimizationResponseDto> {
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
        throw new NotFoundException('Candidate profile not found');
      }

      const resume = await this.db.resume.findFirst({
        where: {
          id: resumeId,
          candidateId: candidate.id,
        },
      });

      if (!resume) {
        throw new NotFoundException('Resume not found');
      }

      // Generate optimization suggestions based on actual candidate data
      const optimization = {
        resumeId,
        optimizationSuggestions:
          this.generateOptimizationSuggestions(candidate),
        keywordOptimization: this.generateKeywordOptimization(candidate),
        formattingSuggestions: this.generateFormattingSuggestions(candidate),
        lengthOptimization: this.generateLengthOptimization(candidate),
        atsOptimization: {
          score: this.calculateATSCompatibility(candidate),
          improvements: this.getATSSuggestions(candidate),
        },
        generatedAt: new Date(),
      };

      // Log the resume optimization activity
      await this.logActivity(
        userId,
        LogAction.VIEW,
        LogLevel.INFO,
        'Resume',
        resumeId,
        'Resume optimization suggestions generated',
      );

      return optimization;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  // =================================================================
  // HELPER METHODS FOR RESUME ANALYSIS
  // =================================================================

  private calculatePersonalInfoScore(candidate: any): number {
    let score = 0;
    if (candidate.firstName && candidate.lastName) score += 20;
    if (candidate.user.email) score += 20;
    if (candidate.user.phone) score += 15;
    if (candidate.city) score += 15;
    if (candidate.linkedinUrl) score += 10;
    if (candidate.githubUrl) score += 10;
    if (candidate.portfolioUrl) score += 10;
    return Math.min(score, 100);
  }

  private calculateExperienceScore(experience: any[]): number {
    if (experience.length === 0) return 0;
    let score = 0;
    score += Math.min(experience.length * 15, 60);
    score += experience.some((exp) => exp.achievements) ? 20 : 0;
    score += experience.some(
      (exp) => exp.description && exp.description.length > 50,
    )
      ? 20
      : 0;
    return Math.min(score, 100);
  }

  private calculateEducationScore(education: any[]): number {
    if (education.length === 0) return 0;
    let score = 0;
    score += Math.min(education.length * 25, 75);
    score += education.some((edu) => edu.isCompleted) ? 15 : 0;
    score += education.some((edu) => edu.grade) ? 10 : 0;
    return Math.min(score, 100);
  }

  private calculateSkillsScore(skills: any[]): number {
    if (skills.length === 0) return 0;
    let score = 0;
    score += Math.min(skills.length * 8, 60);
    score += skills.some((skill) => skill.level) ? 20 : 0;
    score += skills.some((skill) => skill.yearsUsed) ? 20 : 0;
    return Math.min(score, 100);
  }

  private calculateSummaryScore(bio: string | null): number {
    if (!bio) return 0;
    let score = 0;
    if (bio.length > 50) score += 30;
    if (bio.length > 100) score += 20;
    if (bio.length > 200) score += 20;
    if (bio.includes('experience') || bio.includes('skills')) score += 15;
    if (bio.includes('achievement') || bio.includes('result')) score += 15;
    return Math.min(score, 100);
  }

  private calculateCompleteness(candidate: any): number {
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
      if (this.getNestedValue(candidate, field)) completed++;
    });

    optionalFields.forEach((field) => {
      fields++;
      if (this.getNestedValue(candidate, field)) completed++;
    });

    return Math.round((completed / fields) * 100);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private getPersonalInfoIssues(candidate: any): string[] {
    const issues: string[] = [];
    if (!candidate.user.phone) issues.push('Phone number is missing');
    if (!candidate.linkedinUrl) issues.push('LinkedIn profile is missing');
    if (!candidate.githubUrl) issues.push('GitHub profile is missing');
    if (!candidate.portfolioUrl) issues.push('Portfolio URL is missing');
    return issues;
  }

  private calculateExperienceRelevance(experience: any[]): number {
    if (experience.length === 0) return 0;
    return Math.min(experience.length * 20, 100);
  }

  private calculateAchievementsScore(experience: any[]): number {
    const withAchievements = experience.filter(
      (exp) => exp.achievements && exp.achievements.length > 0,
    ).length;
    return Math.round((withAchievements / experience.length) * 100) || 0;
  }

  private getExperienceIssues(experience: any[]): string[] {
    const issues: string[] = [];
    if (experience.length === 0) issues.push('No work experience listed');
    if (!experience.some((exp) => exp.achievements))
      issues.push('Missing quantifiable achievements');
    if (
      !experience.some((exp) => exp.description && exp.description.length > 50)
    )
      issues.push('Job descriptions are too brief');
    return issues;
  }

  private calculateEducationRelevance(education: any[]): number {
    if (education.length === 0) return 0;
    return Math.min(education.length * 30, 100);
  }

  private getEducationIssues(education: any[]): string[] {
    const issues: string[] = [];
    if (education.length === 0) issues.push('No education listed');
    if (!education.some((edu) => edu.isCompleted))
      issues.push('Some education entries are incomplete');
    return issues;
  }

  private calculateSkillsRelevance(skills: any[]): number {
    if (skills.length === 0) return 0;
    return Math.min(skills.length * 15, 100);
  }

  private calculateSkillsDiversity(skills: any[]): number {
    if (skills.length === 0) return 0;
    const categories = new Set(
      skills.map((skill) => skill.skillName.toLowerCase().split(' ')[0]),
    );
    return Math.min(categories.size * 20, 100);
  }

  private getSkillsIssues(skills: any[]): string[] {
    const issues: string[] = [];
    if (skills.length === 0) issues.push('No skills listed');
    if (skills.length < 3) issues.push('Too few skills listed');
    if (!skills.some((skill) => skill.level))
      issues.push('Skill levels not specified');
    return issues;
  }

  private calculateSummaryImpact(bio: string | null): number {
    if (!bio) return 0;
    let score = 0;
    if (bio.length > 100) score += 30;
    if (bio.includes('experience')) score += 20;
    if (bio.includes('skills')) score += 20;
    if (bio.includes('achievement') || bio.includes('result')) score += 30;
    return Math.min(score, 100);
  }

  private getSummaryIssues(bio: string | null): string[] {
    const issues: string[] = [];
    if (!bio) issues.push('Professional summary is missing');
    else {
      if (bio.length < 50) issues.push('Summary is too brief');
      if (bio.length > 300) issues.push('Summary is too long');
      if (!bio.includes('experience') && !bio.includes('skills'))
        issues.push('Summary lacks key information');
    }
    return issues;
  }

  private generateRecommendations(candidate: any): any[] {
    const recommendations: any[] = [];

    if (candidate.experience.length === 0) {
      recommendations.push({
        priority: 'HIGH' as const,
        category: 'Experience',
        suggestion: 'Add work experience to your profile',
        impact: 'Essential for most job applications',
      });
    }

    if (!candidate.bio || candidate.bio.length < 50) {
      recommendations.push({
        priority: 'HIGH' as const,
        category: 'Summary',
        suggestion: 'Write a compelling professional summary',
        impact: 'Creates strong first impression',
      });
    }

    if (candidate.skills.length < 5) {
      recommendations.push({
        priority: 'MEDIUM' as const,
        category: 'Skills',
        suggestion: 'Add more relevant skills',
        impact: 'Improves keyword matching',
      });
    }

    if (!candidate.linkedinUrl) {
      recommendations.push({
        priority: 'MEDIUM' as const,
        category: 'Profile',
        suggestion: 'Add LinkedIn profile',
        impact: 'Enhances professional credibility',
      });
    }

    return recommendations;
  }

  private identifyStrengths(candidate: any): string[] {
    const strengths: string[] = [];
    if (candidate.experience.length > 0) strengths.push('Has work experience');
    if (candidate.education.length > 0)
      strengths.push('Educational background present');
    if (candidate.skills.length > 0) strengths.push('Skills are listed');
    if (candidate.bio && candidate.bio.length > 50)
      strengths.push('Professional summary present');
    if (candidate.linkedinUrl) strengths.push('LinkedIn profile connected');
    return strengths;
  }

  private identifyWeaknesses(candidate: any): string[] {
    const weaknesses: string[] = [];
    if (candidate.experience.length === 0)
      weaknesses.push('No work experience');
    if (!candidate.bio || candidate.bio.length < 50)
      weaknesses.push('Weak professional summary');
    if (candidate.skills.length < 3) weaknesses.push('Limited skills listed');
    if (!candidate.linkedinUrl) weaknesses.push('Missing LinkedIn profile');
    return weaknesses;
  }

  private calculateATSCompatibility(candidate: any): number {
    let score = 0;
    if (candidate.firstName && candidate.lastName) score += 20;
    if (candidate.user.email) score += 20;
    if (candidate.user.phone) score += 15;
    if (candidate.experience.length > 0) score += 20;
    if (candidate.education.length > 0) score += 15;
    if (candidate.skills.length > 0) score += 10;
    return Math.min(score, 100);
  }

  private getATSIssues(candidate: any): string[] {
    const issues: string[] = [];
    if (!candidate.user.phone) issues.push('Phone number missing');
    if (candidate.experience.length === 0) issues.push('No work experience');
    if (candidate.skills.length === 0) issues.push('No skills listed');
    return issues;
  }

  private getATSSuggestions(candidate: any): string[] {
    const suggestions: string[] = [];
    suggestions.push(
      'Use standard section headers (Experience, Education, Skills)',
    );
    suggestions.push('Include relevant keywords from job descriptions');
    suggestions.push('Avoid graphics and complex formatting');
    suggestions.push('Use simple, clean layout');
    return suggestions;
  }

  private generateOptimizationSuggestions(candidate: any): any[] {
    const suggestions: any[] = [];

    if (candidate.experience.length > 0) {
      const exp = candidate.experience[0];
      if (!exp.achievements) {
        suggestions.push({
          category: 'Experience',
          priority: 'HIGH' as const,
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
        priority: 'MEDIUM' as const,
        current: 'Basic skill listing',
        suggested: 'Add skill levels and years of experience',
        reason: 'More detailed skills information',
        impact: 'Medium - Better keyword matching',
      });
    }

    if (!candidate.bio || candidate.bio.length < 100) {
      suggestions.push({
        category: 'Summary',
        priority: 'HIGH' as const,
        current: candidate.bio || 'No summary',
        suggested:
          'Write a compelling professional summary highlighting key achievements',
        reason: 'Professional summary is crucial for first impression',
        impact: 'High - Creates stronger first impression',
      });
    }

    return suggestions;
  }

  private generateKeywordOptimization(candidate: any): any {
    const missing = ['Agile', 'Scrum', 'Git', 'Docker', 'AWS', 'CI/CD'];
    const overused = ['Experienced', 'Skilled', 'Proficient'];
    const suggested = ['Expert', 'Advanced', 'Specialized', 'Certified'];

    return {
      missing: missing.filter(
        (keyword) =>
          !candidate.skills.some((skill: any) =>
            skill.skillName.toLowerCase().includes(keyword.toLowerCase()),
          ),
      ),
      overused: overused.filter((keyword) =>
        candidate.bio?.toLowerCase().includes(keyword.toLowerCase()),
      ),
      suggested,
    };
  }

  private generateFormattingSuggestions(candidate: any): any[] {
    const suggestions: any[] = [];

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

  private generateLengthOptimization(candidate: any): any {
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

  private estimateResumeLength(candidate: any): number {
    let length = 0;
    if (candidate.bio) length += 0.2;
    if (candidate.experience.length > 0)
      length += candidate.experience.length * 0.3;
    if (candidate.education.length > 0)
      length += candidate.education.length * 0.2;
    if (candidate.skills.length > 0) length += 0.3;
    return Math.round(length * 10) / 10;
  }

  private async logActivity(
    userId: string,
    action: LogAction,
    level: LogLevel,
    entity: string,
    entityId: string,
    description: string,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
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
    } catch (error) {
      // Don't throw error for logging failures
      console.error('Failed to log activity:', error);
    }
  }

  // =================================================================
  // CANDIDATE PROFILE MANAGEMENT
  // =================================================================

  /**
   * Helper method to get or create a candidate record
   * This ensures that any registered user can access candidate features
   */
  private async getOrCreateCandidate(userId: string): Promise<any> {
    let candidate = await this.db.candidate.findFirst({
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

    // If no candidate record exists, create one with minimal data
    if (!candidate) {
      candidate = await this.db.candidate.create({
        data: {
          userId,
          firstName: '',
          lastName: '',
          email: '',
          mobileNumber: '',
          jobExperience: '',
          country: '',
          state: '',
          cityName: '',
          streetAddress: '',
          profileSummary: '',
          isAvailable: true,
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
          skills: true,
          education: true,
          experience: true,
        },
      });

      // Log the candidate creation
      await this.logActivity(
        userId,
        LogAction.CREATE,
        LogLevel.INFO,
        'Candidate',
        candidate.id,
        'Candidate profile auto-created',
      );
    }

    return candidate;
  }

  async updateCandidateProfile(
    userId: string,
    updateDto: UpdateCandidateProfileDto,
  ): Promise<CandidateProfileResponseDto> {
    try {
      // Get or create candidate record
      const candidate = await this.getOrCreateCandidate(userId);

      const updateData: any = { ...updateDto };

      // Convert date strings to Date objects
      if (updateDto.dateOfBirth) {
        updateData.dateOfBirth = new Date(updateDto.dateOfBirth);
      }

      // Handle cityId if provided
      if (updateDto.cityId) {
        updateData.cityId = parseInt(updateDto.cityId);
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

      // Log the profile update
      await this.logActivity(
        userId,
        LogAction.UPDATE,
        LogLevel.INFO,
        'Candidate',
        candidate.id,
        'Profile updated',
      );

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
        // Additional fields
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
        city: updatedCandidate.city ? {
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
            country: updatedCandidate.city.state.country ? {
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
            } : undefined,
          },
        } : undefined,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async upsertFullProfile(
    userId: string,
    body: UpsertFullProfileDto,
  ): Promise<CandidateProfileResponseDto> {
    try {
      // Track resume IDs for PDF text extraction
      let resumeIdsToExtract: string[] = [];
      
      const resultCandidate = await this.db.$transaction(
        async (tx) => {
        console.log('Transaction started for user:', userId);
        // Find or create candidate within transaction
        let ensured = await tx.candidate.findFirst({ where: { userId } });
        if (!ensured) {
          console.log('Creating new candidate for user:', userId);
          ensured = await tx.candidate.create({
            data: {
              userId,
              firstName: '',
              lastName: '',
              isAvailable: true,
            },
          });
        }
        console.log('Candidate found/created:', ensured.id);

        // Update candidate profile
        const p = body.profile || {} as any;
        const cityIdParsed = p.cityId && p.cityId.trim() ? parseInt(p.cityId.trim(), 10) : undefined;
        const updateData: any = {
          firstName: p.firstName,
          lastName: p.lastName,
          fatherName: p.fatherName || undefined,
          dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : undefined,
          gender: p.gender || undefined,
          maritalStatus: p.maritalStatus || undefined,
          bio: (p.bio ?? p.profileSummary) || undefined,
          currentTitle: p.currentTitle || undefined,
          currentCompany: p.currentCompany || undefined,
          currentLocation: p.currentLocation || undefined,
          preferredLocation: p.preferredLocation || undefined,
          noticePeriod: p.noticePeriod || undefined,
          currentSalary: p.currentSalary != null ? p.currentSalary : undefined,
          expectedSalary: p.expectedSalary != null ? p.expectedSalary : undefined,
          profileType: p.profileType || undefined,
          experienceYears: p.experienceYears != null ? parseInt(String(p.experienceYears), 10) : undefined,
          cityId: typeof cityIdParsed === 'number' && !Number.isNaN(cityIdParsed) ? cityIdParsed : undefined,
          address: (p.address ?? p.streetAddress) || undefined,
          linkedinUrl: p.linkedinUrl || undefined,
          githubUrl: p.githubUrl || undefined,
          portfolioUrl: p.portfolioUrl || undefined,
          email: p.email || undefined,
          mobileNumber: p.mobileNumber || undefined,
          jobExperience: p.jobExperience || undefined,
          country: p.country || undefined,
          state: p.state || undefined,
          cityName: p.cityName || undefined,
          streetAddress: p.streetAddress || undefined,
          profileSummary: (p.profileSummary ?? p.bio) || undefined,
          // if provided, set profile picture from uploaded key
          profilePicture: body.profilePictureKey || undefined,
        };

        // Remove undefined and empty string values
        const cleanedData = Object.fromEntries(
          Object.entries(updateData).filter(([k, v]) => {
            if (v === undefined || v === null) return false;
            if (typeof v === 'string' && v.trim() === '') return false;
            return true;
          }),
        );

        await tx.candidate.update({
          where: { id: ensured.id },
          data: cleanedData,
        });

        // Skills upsert/delete
        if (body.skills) {
          const { upsert, delete: del } = body.skills;
          if (Array.isArray(upsert)) {
            // Batch verify all existing skill records first
            const skillIdsToUpdate = upsert.filter(s => s.id).map(s => s.id!).filter((id): id is string => id !== undefined);
            
            if (skillIdsToUpdate.length > 0) {
              const existingSkills = await tx.candidateSkill.findMany({
                where: {
                  id: { in: skillIdsToUpdate },
                  candidateId: ensured.id,
                },
              });
              
              // Check if all IDs exist and belong to candidate
              const existingIds = new Set(existingSkills.map(r => r.id));
              for (const id of skillIdsToUpdate) {
                if (!existingIds.has(id)) {
                  throw new BadRequestException(`Skill with id ${id} not found or does not belong to candidate`);
                }
              }
            }
            
            // Now perform updates and creates
            for (const s of upsert) {
              if (s.id) {
                await tx.candidateSkill.update({
                  where: { id: s.id },
                  data: Object.fromEntries(
                    Object.entries({
                      skillName: s.skillName,
                      level: s.level,
                      yearsUsed: s.yearsUsed,
                    }).filter(([, v]) => v !== undefined),
                  ),
                });
              } else {
                await tx.candidateSkill.upsert({
                  where: {
                    candidateId_skillName: {
                      candidateId: ensured.id,
                      skillName: s.skillName,
                    },
                  },
                  create: {
                    candidateId: ensured.id,
                    skillName: s.skillName,
                    level: s.level,
                    yearsUsed: s.yearsUsed,
                  },
                  update: {
                    level: s.level,
                    yearsUsed: s.yearsUsed,
                  },
                });
              }
            }
          }
          if (Array.isArray(del) && del.length) {
            await tx.candidateSkill.deleteMany({
              where: { id: { in: del }, candidateId: ensured.id },
            });
          }
        }

        // Education upsert/delete
        if (body.education) {
          console.log('Processing education section');
          const { upsert, delete: del } = body.education;
          if (Array.isArray(upsert) && upsert.length > 0) {
            console.log(`Education upsert array length: ${upsert.length}`);
            // Separate updates and creates
            const updates = upsert.filter(e => e.id);
            const creates = upsert.filter(e => !e.id);
            
            console.log(`Education updates: ${updates.length}, creates: ${creates.length}`);
            
            // Batch verify all existing education records first
            if (updates.length > 0) {
              const educationIdsToUpdate = updates.map(e => e.id!).filter((id): id is string => id !== undefined);
              
              console.log(`Verifying ${educationIdsToUpdate.length} education records...`);
              const existingEducationRecords = await tx.candidateEducation.findMany({
                where: {
                  id: { in: educationIdsToUpdate },
                  candidateId: ensured.id,
                },
              });
              
              console.log(`Found ${existingEducationRecords.length} existing education records`);
              
              // Check if all IDs exist and belong to candidate
              const existingIds = new Set(existingEducationRecords.map(r => r.id));
              for (const id of educationIdsToUpdate) {
                if (!existingIds.has(id)) {
                  console.error(`Education ${id} not found for candidate ${ensured.id}`);
                  throw new BadRequestException(`Education with id ${id} not found or does not belong to candidate`);
                }
              }
              
              console.log('All education IDs verified. Starting updates...');
              // Perform updates one by one with error handling
              for (let i = 0; i < updates.length; i++) {
                const e = updates[i];
                console.log(`[${i + 1}/${updates.length}] Updating education ${e.id}...`);
                if (!e.id) continue;
                try {
                  const data = Object.fromEntries(
                    Object.entries({
                      institution: e.institution,
                      degree: e.degree,
                      fieldOfStudy: e.fieldOfStudy,
                      level: e.level as any,
                      startDate: e.startDate ? new Date(e.startDate) : undefined,
                      endDate: e.endDate ? new Date(e.endDate) : undefined,
                      isCompleted: e.isCompleted,
                      grade: e.grade,
                      description: e.description,
                    }).filter(([, v]) => v !== undefined),
                  );
                  
                if (Object.keys(data).length > 0) {
                  // Verify the record still exists and belongs to candidate before update
                  const record = await tx.candidateEducation.findUnique({
                    where: { id: e.id },
                  });
                  
                  if (!record || record.candidateId !== ensured.id) {
                    throw new BadRequestException(
                      `Education record ${e.id} not found or does not belong to candidate`
                    );
                  }
                  
                  await tx.candidateEducation.update({
                    where: { id: e.id },
                    data,
                  });
                  console.log(`[${i + 1}/${updates.length}] Education ${e.id} updated successfully`);
                } else {
                  console.log(`[${i + 1}/${updates.length}] Education ${e.id} - no data to update`);
                }
                } catch (updateError: any) {
                  console.error(`[${i + 1}/${updates.length}] Error updating education ${e.id}:`, updateError);
                  // Re-throw BadRequestException as-is
                  if (updateError instanceof BadRequestException) {
                    throw updateError;
                  }
                  throw new BadRequestException(
                    `Failed to update education record ${e.id}: ${updateError.message || 'Unknown error'}`
                  );
                }
              }
              console.log(`All ${updates.length} education updates completed`);
            }
            
            // Perform creates
            if (creates.length > 0) {
              for (const e of creates) {
                await tx.candidateEducation.create({
                  data: {
                    candidateId: ensured.id,
                    institution: e.institution,
                    degree: e.degree,
                    fieldOfStudy: e.fieldOfStudy,
                    level: e.level as any,
                    startDate: new Date(e.startDate),
                    endDate: e.endDate ? new Date(e.endDate) : undefined,
                    isCompleted: !!e.isCompleted,
                    grade: e.grade,
                    description: e.description,
                  },
                });
              }
            }
          }
          if (Array.isArray(del) && del.length) {
            await tx.candidateEducation.deleteMany({
              where: { id: { in: del }, candidateId: ensured.id },
            });
          }
        }

        // Experience upsert/delete
        if (body.experience) {
          const { upsert, delete: del } = body.experience;
          if (Array.isArray(upsert)) {
            // Batch verify all existing experience records first
            const experienceIdsToUpdate = upsert.filter(ex => ex.id).map(ex => ex.id!).filter((id): id is string => id !== undefined);
            
            if (experienceIdsToUpdate.length > 0) {
              const existingExperiences = await tx.candidateExperience.findMany({
                where: {
                  id: { in: experienceIdsToUpdate },
                  candidateId: ensured.id,
                },
              });
              
              // Check if all IDs exist and belong to candidate
              const existingIds = new Set(existingExperiences.map(r => r.id));
              for (const id of experienceIdsToUpdate) {
                if (!existingIds.has(id)) {
                  throw new BadRequestException(`Experience with id ${id} not found or does not belong to candidate`);
                }
              }
            }
            
            // Now perform updates and creates
            for (const ex of upsert) {
              if (ex.id) {
                const data = Object.fromEntries(
                  Object.entries({
                    company: ex.company,
                    position: ex.position,
                    description: ex.description,
                    startDate: ex.startDate ? new Date(ex.startDate) : undefined,
                    endDate: ex.endDate ? new Date(ex.endDate) : undefined,
                    isCurrent: ex.isCurrent,
                    location: ex.location,
                    achievements: ex.achievements,
                  }).filter(([, v]) => v !== undefined),
                );
                await tx.candidateExperience.update({
                  where: { id: ex.id },
                  data,
                });
              } else {
                await tx.candidateExperience.create({
                  data: {
                    candidateId: ensured.id,
                    company: ex.company,
                    position: ex.position,
                    description: ex.description,
                    startDate: new Date(ex.startDate),
                    endDate: ex.endDate ? new Date(ex.endDate) : undefined,
                    isCurrent: !!ex.isCurrent,
                    location: ex.location,
                    achievements: ex.achievements,
                  },
                });
              }
            }
          }
          if (Array.isArray(del) && del.length) {
            await tx.candidateExperience.deleteMany({
              where: { id: { in: del }, candidateId: ensured.id },
            });
          }
        }

        // Resumes upsert/delete
        if (body.resumes) {
          const { upsert, delete: del } = body.resumes as any;
          if (Array.isArray(upsert)) {
            // Batch verify all existing resume records first
            const resumeIdsToUpdate = upsert.filter(r => r.id).map(r => r.id!).filter((id): id is string => id !== undefined);
            let existingResumeMap = new Map<string, any>();
            
            if (resumeIdsToUpdate.length > 0) {
              const existingResumes = await tx.resume.findMany({
                where: {
                  id: { in: resumeIdsToUpdate },
                  candidateId: ensured.id,
                },
              });
              
              // Check if all IDs exist and belong to candidate
              for (const resume of existingResumes) {
                existingResumeMap.set(resume.id, resume);
              }
              
              for (const id of resumeIdsToUpdate) {
                if (!existingResumeMap.has(id)) {
                  throw new BadRequestException(`Resume with id ${id} not found or does not belong to candidate`);
                }
              }
            }
            
            // Now perform updates and creates
            for (const r of upsert) {
              let resumeId: string;

              if (r.id) {
                // Update existing resume
                const existingResume = existingResumeMap.get(r.id);
                resumeId = r.id;

                const updateData: any = Object.fromEntries(
                  Object.entries({
                    title: r.title,
                    fileName: r.fileName,
                    fileSize: r.fileSize,
                    mimeType: r.mimeType,
                    isDefault: r.isDefault,
                    filePath: r.documentKey, // Update filePath if new documentKey provided
                  }).filter(([, v]) => v !== undefined),
                );

                await tx.resume.update({
                  where: { id: r.id },
                  data: updateData,
                });
              } else {
                // Create new resume - require documentKey
                if (!r.documentKey) {
                  throw new BadRequestException('documentKey is required for new resumes');
                }

                const newResume = await tx.resume.create({
                  data: {
                    candidateId: ensured.id,
                    title: r.title || 'Resume',
                    fileName: r.fileName || 'document',
                    filePath: r.documentKey,
                    fileSize: r.fileSize || 0,
                    mimeType: r.mimeType || 'application/octet-stream',
                    isDefault: !!r.isDefault,
                  },
                });

                resumeId = newResume.id;
                
                // Store resume ID for PDF extraction (after transaction)
                if (!resumeIdsToExtract) {
                  resumeIdsToExtract = [];
                }
                resumeIdsToExtract.push(resumeId);
              }

              // If set as default, unset all other resumes for this candidate
              if (r.isDefault) {
                await tx.resume.updateMany({
                  where: {
                    candidateId: ensured.id,
                    id: { not: resumeId },
                  },
                  data: { isDefault: false },
                });
              }
            }
          }

          if (Array.isArray(del) && del.length) {
            await tx.resume.deleteMany({
              where: { id: { in: del }, candidateId: ensured.id },
            });
          }
        }

        console.log('Transaction completed successfully');
        return ensured;
      },
      {
        maxWait: 10000, // Maximum time to wait for a transaction slot
        timeout: 60000, // Maximum time the transaction can run (60 seconds)
      }
      );

      // Fetch updated profile directly (skip getOrCreateCandidate since we just updated)
      console.log('Transaction successful, fetching updated profile...');
      const updatedCandidate = await this.db.candidate.findFirst({
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
        },
      });

      if (!updatedCandidate) {
        console.error('Candidate not found after transaction');
        throw new NotFoundException('Candidate profile not found');
      }

      console.log('Profile fetched, building response...');
      const response: CandidateProfileResponseDto = {
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
        createdAt: updatedCandidate.createdAt,
        updatedAt: updatedCandidate.updatedAt,
        user: updatedCandidate.user,
        city: updatedCandidate.city as any,
      };
      console.log('Response ready');
      
      // Extract PDF text from newly created resumes (async, don't wait)
      if (resumeIdsToExtract.length > 0) {
        this.logger.log(`Extracting PDF text from ${resumeIdsToExtract.length} resume(s)`);
        // Run extraction in background
        this.extractResumeTextInBackground(resumeIdsToExtract).catch((error) => {
          this.logger.error('Failed to extract PDF text:', error);
        });
      }
      
      return response;
    } catch (error) {
      console.error('Error in upsertFullProfile:', error);
      console.error('Error stack:', error.stack);
      console.error('Error message:', error.message);
      
      // Re-throw BadRequestException as-is
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Log and handle other errors
      this.handleException(error);
      throw new InternalServerErrorException(
        `Failed to update candidate profile: ${error.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Extract PDF text from resumes in the background
   * @param resumeIds Array of resume IDs to extract text from
   */
  private async extractResumeTextInBackground(resumeIds: string[]): Promise<void> {
    for (const resumeId of resumeIds) {
      try {
        // Get resume details
        const resume = await this.db.resume.findUnique({
          where: { id: resumeId },
          select: {
            id: true,
            filePath: true,
            fileName: true,
            mimeType: true,
          },
        });

        if (!resume) {
          this.logger.warn(`Resume ${resumeId} not found for text extraction`);
          continue;
        }

        // Only extract from PDF files
        if (!resume.mimeType || !resume.mimeType.includes('pdf')) {
          this.logger.log(`Skipping non-PDF file: ${resume.fileName} (${resume.mimeType})`);
          continue;
        }

        this.logger.log(`Extracting text from PDF: ${resume.fileName}`);

        // Build full URL for the PDF file
        // Assuming DigitalOcean Spaces or similar
        const fileUrl = resume.filePath.startsWith('http')
          ? resume.filePath
          : `https://spearwin.sfo3.digitaloceanspaces.com/${resume.filePath}`;

        // Extract text from PDF
        const extractedText = await this.pdfExtractor.extractTextFromPDF(fileUrl);

        if (extractedText && extractedText.length > 0) {
          // Clean the extracted text
          const cleanedText = this.pdfExtractor.cleanExtractedText(extractedText);

          // Update the resume with extracted text
          await this.db.resume.update({
            where: { id: resume.id },
            data: { extractedText: cleanedText },
          });

          this.logger.log(
            `Successfully extracted ${cleanedText.length} characters from ${resume.fileName}`,
          );
        } else {
          this.logger.warn(`No text extracted from ${resume.fileName}`);
        }
      } catch (error) {
        this.logger.error(`Failed to extract text from resume ${resumeId}:`, error);
        // Continue with other resumes even if one fails
      }
    }
  }

  async getCompleteProfile(userId: string): Promise<CandidateCompleteProfileResponseDto> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
        include: {
          city: {
            include: {
              state: { include: { country: true } },
            },
          },
          user: { select: { email: true, phone: true } },
          skills: true,
          education: true,
          experience: true,
          resumes: true,
        },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
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
        currentSalary: candidate.currentSalary ? Number(candidate.currentSalary) : undefined,
        expectedSalary: candidate.expectedSalary ? Number(candidate.expectedSalary) : undefined,
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
        city: candidate.city as any,
        skills: candidate.skills?.map(s => ({
          id: s.id,
          skillName: s.skillName,
          level: s.level || undefined,
          yearsUsed: s.yearsUsed || undefined,
        })),
        education: candidate.education?.map(e => ({
          id: e.id,
          institution: e.institution,
          degree: e.degree,
          fieldOfStudy: e.fieldOfStudy || undefined,
          level: e.level,
          startDate: e.startDate,
          endDate: e.endDate || undefined,
          isCompleted: e.isCompleted,
          grade: e.grade || undefined,
          description: e.description || undefined,
        })),
        experience: candidate.experience?.map(ex => ({
          id: ex.id,
          company: ex.company,
          position: ex.position,
          description: ex.description || undefined,
          startDate: ex.startDate,
          endDate: ex.endDate || undefined,
          isCurrent: ex.isCurrent,
          location: ex.location || undefined,
          achievements: ex.achievements || undefined,
        })),
        resumes: candidate.resumes?.map(r => ({
          id: r.id,
          title: r.title,
          fileName: r.fileName,
          filePath: r.filePath,
          fileSize: r.fileSize,
          mimeType: r.mimeType,
          isDefault: r.isDefault,
          uploadedAt: r.uploadedAt,
        })),
      } as CandidateCompleteProfileResponseDto;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleException(error);
      throw error;
    }
  }

  async uploadProfilePicture(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ message: string; profilePicture: string }> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
      }

      // In a real application, you would upload the file to a cloud storage service
      // For now, we'll just store the filename
      const profilePicture = `/uploads/profile-pictures/${file.filename}`;

      await this.db.candidate.update({
        where: { id: candidate.id },
        data: { profilePicture },
      });

      // Log the profile picture upload
      await this.logActivity(
        userId,
        LogAction.UPDATE,
        LogLevel.INFO,
        'Candidate',
        candidate.id,
        'Profile picture uploaded',
      );

      return {
        message: 'Profile picture uploaded successfully',
        profilePicture,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async deleteProfilePicture(userId: string): Promise<{ message: string }> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
      }

      await this.db.candidate.update({
        where: { id: candidate.id },
        data: { profilePicture: null },
      });

      // Log the profile picture deletion
      await this.logActivity(
        userId,
        LogAction.DELETE,
        LogLevel.INFO,
        'Candidate',
        candidate.id,
        'Profile picture deleted',
      );

      return { message: 'Profile picture deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async updateAvailability(
    userId: string,
    updateDto: UpdateAvailabilityDto,
  ): Promise<{ message: string }> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
      }

      await this.db.candidate.update({
        where: { id: candidate.id },
        data: { isAvailable: updateDto.isAvailable },
      });

      // Log the availability update
      await this.logActivity(
        userId,
        LogAction.UPDATE,
        LogLevel.INFO,
        'Candidate',
        candidate.id,
        `Availability updated to ${updateDto.isAvailable ? 'available' : 'unavailable'}`,
      );

      return { message: 'Availability updated successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async changePassword(
    userId: string,
    changePasswordDto: { currentPassword: string; newPassword: string },
  ): Promise<{ message: string }> {
    try {
      // Get user to verify current password
      const user = await this.db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        changePasswordDto.currentPassword,
        user.password,
      );

      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(
        changePasswordDto.newPassword,
        12,
      );

      // Update password
      await this.db.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      // Log the password change
      await this.logActivity(
        userId,
        LogAction.UPDATE,
        LogLevel.INFO,
        'User',
        userId,
        'Password changed',
      );

      return { message: 'Password changed successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  // =================================================================
  // CANDIDATE SKILLS MANAGEMENT
  // =================================================================

  async getCandidateSkills(
    userId: string,
  ): Promise<CandidateSkillResponseDto[]> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async addCandidateSkill(
    userId: string,
    createDto: CreateCandidateSkillDto,
  ): Promise<CandidateSkillResponseDto> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
      }

      // Check if skill already exists
      const existingSkill = await this.db.candidateSkill.findFirst({
        where: {
          candidateId: candidate.id,
          skillName: createDto.skillName,
        },
      });

      if (existingSkill) {
        throw new BadRequestException('Skill already exists');
      }

      const skill = await this.db.candidateSkill.create({
        data: {
          candidateId: candidate.id,
          skillName: createDto.skillName,
          level: createDto.level,
          yearsUsed: createDto.yearsUsed,
        },
      });

      // Log the skill addition
      await this.logActivity(
        userId,
        LogAction.CREATE,
        LogLevel.INFO,
        'CandidateSkill',
        skill.id,
        `Skill added: ${createDto.skillName}`,
      );

      return {
        id: skill.id,
        candidateId: skill.candidateId,
        skillName: skill.skillName,
        level: skill.level,
        yearsUsed: skill.yearsUsed,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async updateCandidateSkill(
    userId: string,
    skillId: string,
    updateDto: UpdateCandidateSkillDto,
  ): Promise<CandidateSkillResponseDto> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
      }

      const skill = await this.db.candidateSkill.findFirst({
        where: {
          id: skillId,
          candidateId: candidate.id,
        },
      });

      if (!skill) {
        throw new NotFoundException('Skill not found');
      }

      // Check if skill name is being changed and if it already exists
      if (updateDto.skillName && updateDto.skillName !== skill.skillName) {
        const existingSkill = await this.db.candidateSkill.findFirst({
          where: {
            candidateId: candidate.id,
            skillName: updateDto.skillName,
            id: { not: skillId },
          },
        });

        if (existingSkill) {
          throw new BadRequestException('Skill name already exists');
        }
      }

      const updatedSkill = await this.db.candidateSkill.update({
        where: { id: skillId },
        data: updateDto,
      });

      // Log the skill update
      await this.logActivity(
        userId,
        LogAction.UPDATE,
        LogLevel.INFO,
        'CandidateSkill',
        skillId,
        `Skill updated: ${updatedSkill.skillName}`,
      );

      return {
        id: updatedSkill.id,
        candidateId: updatedSkill.candidateId,
        skillName: updatedSkill.skillName,
        level: updatedSkill.level,
        yearsUsed: updatedSkill.yearsUsed,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async deleteCandidateSkill(
    userId: string,
    skillId: string,
  ): Promise<{ message: string }> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
      }

      const skill = await this.db.candidateSkill.findFirst({
        where: {
          id: skillId,
          candidateId: candidate.id,
        },
      });

      if (!skill) {
        throw new NotFoundException('Skill not found');
      }

      await this.db.candidateSkill.delete({
        where: { id: skillId },
      });

      // Log the skill deletion
      await this.logActivity(
        userId,
        LogAction.DELETE,
        LogLevel.INFO,
        'CandidateSkill',
        skillId,
        `Skill deleted: ${skill.skillName}`,
      );

      return { message: 'Skill deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  // =================================================================
  // CANDIDATE EDUCATION MANAGEMENT
  // =================================================================

  async getCandidateEducation(
    userId: string,
  ): Promise<CandidateEducationResponseDto[]> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async addCandidateEducation(
    userId: string,
    createDto: CreateCandidateEducationDto,
  ): Promise<CandidateEducationResponseDto> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
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

      // Log the education addition
      await this.logActivity(
        userId,
        LogAction.CREATE,
        LogLevel.INFO,
        'CandidateEducation',
        education.id,
        `Education added: ${createDto.degree} at ${createDto.institution}`,
      );

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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async updateCandidateEducation(
    userId: string,
    educationId: string,
    updateDto: UpdateCandidateEducationDto,
  ): Promise<CandidateEducationResponseDto> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
      }

      const education = await this.db.candidateEducation.findFirst({
        where: {
          id: educationId,
          candidateId: candidate.id,
        },
      });

      if (!education) {
        throw new NotFoundException('Education record not found');
      }

      const updateData: any = { ...updateDto };

      // Convert date strings to Date objects
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

      // Log the education update
      await this.logActivity(
        userId,
        LogAction.UPDATE,
        LogLevel.INFO,
        'CandidateEducation',
        educationId,
        `Education updated: ${updatedEducation.degree} at ${updatedEducation.institution}`,
      );

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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async deleteCandidateEducation(
    userId: string,
    educationId: string,
  ): Promise<{ message: string }> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
      }

      const education = await this.db.candidateEducation.findFirst({
        where: {
          id: educationId,
          candidateId: candidate.id,
        },
      });

      if (!education) {
        throw new NotFoundException('Education record not found');
      }

      await this.db.candidateEducation.delete({
        where: { id: educationId },
      });

      // Log the education deletion
      await this.logActivity(
        userId,
        LogAction.DELETE,
        LogLevel.INFO,
        'CandidateEducation',
        educationId,
        `Education deleted: ${education.degree} at ${education.institution}`,
      );

      return { message: 'Education record deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  // =================================================================
  // CANDIDATE EXPERIENCE MANAGEMENT
  // =================================================================

  async getCandidateExperience(
    userId: string,
  ): Promise<CandidateExperienceResponseDto[]> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async addCandidateExperience(
    userId: string,
    createDto: CreateCandidateExperienceDto,
  ): Promise<CandidateExperienceResponseDto> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
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

      // Log the experience addition
      await this.logActivity(
        userId,
        LogAction.CREATE,
        LogLevel.INFO,
        'CandidateExperience',
        experience.id,
        `Experience added: ${createDto.position} at ${createDto.company}`,
      );

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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async updateCandidateExperience(
    userId: string,
    experienceId: string,
    updateDto: UpdateCandidateExperienceDto,
  ): Promise<CandidateExperienceResponseDto> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
      }

      const experience = await this.db.candidateExperience.findFirst({
        where: {
          id: experienceId,
          candidateId: candidate.id,
        },
      });

      if (!experience) {
        throw new NotFoundException('Experience record not found');
      }

      const updateData: any = { ...updateDto };

      // Convert date strings to Date objects
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

      // Log the experience update
      await this.logActivity(
        userId,
        LogAction.UPDATE,
        LogLevel.INFO,
        'CandidateExperience',
        experienceId,
        `Experience updated: ${updatedExperience.position} at ${updatedExperience.company}`,
      );

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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async deleteCandidateExperience(
    userId: string,
    experienceId: string,
  ): Promise<{ message: string }> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
      }

      const experience = await this.db.candidateExperience.findFirst({
        where: {
          id: experienceId,
          candidateId: candidate.id,
        },
      });

      if (!experience) {
        throw new NotFoundException('Experience record not found');
      }

      await this.db.candidateExperience.delete({
        where: { id: experienceId },
      });

      // Log the experience deletion
      await this.logActivity(
        userId,
        LogAction.DELETE,
        LogLevel.INFO,
        'CandidateExperience',
        experienceId,
        `Experience deleted: ${experience.position} at ${experience.company}`,
      );

      return { message: 'Experience record deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  // =================================================================
  // JOB RECOMMENDATIONS & ALERTS
  // =================================================================

  async getRecommendedJobs(
    userId: string,
    query: any,
  ): Promise<RecommendedJobsResponseDto> {
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
        throw new NotFoundException('Candidate profile not found');
      }

      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const skip = (page - 1) * limit;

      // Build recommendation criteria based on candidate profile
      const whereClause: any = {
        status: 'PUBLISHED',
      };

      // Filter by skills if candidate has skills
      if (candidate.skills && candidate.skills.length > 0) {
        const candidateSkills = candidate.skills.map(
          (skill) => skill.skillName,
        );
        whereClause.skillsRequired = {
          hasSome: candidateSkills,
        };
      }

      // Filter by experience level
      if (candidate.experience && candidate.experience.length > 0) {
        // Determine experience level based on years of experience
        const totalExperience = candidate.experience.reduce((total, exp) => {
          const startDate = new Date(exp.startDate);
          const endDate = exp.isCurrent
            ? new Date()
            : exp.endDate
              ? new Date(exp.endDate)
              : new Date();
          const years =
            (endDate.getTime() - startDate.getTime()) /
            (1000 * 60 * 60 * 24 * 365);
          return total + years;
        }, 0);

        if (totalExperience >= 5) {
          whereClause.experienceLevel = { in: ['SENIOR_LEVEL', 'EXECUTIVE'] };
        } else if (totalExperience >= 2) {
          whereClause.experienceLevel = { in: ['MID_LEVEL', 'SENIOR_LEVEL'] };
        } else {
          whereClause.experienceLevel = { in: ['ENTRY_LEVEL', 'MID_LEVEL'] };
        }
      }

      // Filter by location if candidate has location preference
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
                companyId: true,
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
                    country: job.city.state.country ? {
                      id: job.city.state.country.id,
                      name: job.city.state.country.name,
                      iso2: job.city.state.country.iso2,
                    } : undefined,
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async getJobAlerts(
    userId: string,
    query: any,
  ): Promise<JobAlertsResponseDto> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async createJobAlert(
    userId: string,
    createDto: CreateJobAlertDto,
  ): Promise<JobAlertResponseDto> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
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

      // Log the job alert creation
      await this.logActivity(
        userId,
        LogAction.CREATE,
        LogLevel.INFO,
        'JobAlert',
        alert.id,
        `Job alert created: ${createDto.title}`,
      );

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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async updateJobAlert(
    userId: string,
    alertId: string,
    updateDto: UpdateJobAlertDto,
  ): Promise<JobAlertResponseDto> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
      }

      const alert = await this.db.jobAlert.findFirst({
        where: {
          id: alertId,
          candidateId: candidate.id,
        },
      });

      if (!alert) {
        throw new NotFoundException('Job alert not found');
      }

      const updatedAlert = await this.db.jobAlert.update({
        where: { id: alertId },
        data: updateDto,
      });

      // Log the job alert update
      await this.logActivity(
        userId,
        LogAction.UPDATE,
        LogLevel.INFO,
        'JobAlert',
        alertId,
        `Job alert updated: ${updatedAlert.title}`,
      );

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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  // =================================================================
  // JOB APPLICATIONS MANAGEMENT
  // =================================================================

  async getCandidateApplications(
    userId: string,
    query: any,
  ): Promise<ApplicationsResponseDto> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
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
                    companyId: true,
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
            jobType: app.job.jobType,
            workMode: app.job.workMode,
            company: {
              id: app.job.company.id,
              name: app.job.company.name,
              companyId: app.job.company.companyId || '',
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
                      latitude: app.job.city.state.latitude,
                      longitude: app.job.city.state.longitude,
                      isActive: app.job.city.state.isActive,
                      createdAt: app.job.city.state.createdAt,
                      updatedAt: app.job.city.state.updatedAt,
                      country: app.job.city.state.country ? {
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
                      } : undefined,
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async getApplicationHistory(
    userId: string,
    query: ApplicationHistoryQueryDto,
  ): Promise<ApplicationsResponseDto> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
      }

      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '10');
      const skip = (page - 1) * limit;

      // Build where clause for filtering
      const whereClause: any = { candidateId: candidate.id };

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
                    companyId: true,
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
            jobType: app.job.jobType,
            workMode: app.job.workMode,
            company: {
              id: app.job.company.id,
              name: app.job.company.name,
              companyId: app.job.company.companyId || '',
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
                      latitude: app.job.city.state.latitude,
                      longitude: app.job.city.state.longitude,
                      isActive: app.job.city.state.isActive,
                      createdAt: app.job.city.state.createdAt,
                      updatedAt: app.job.city.state.updatedAt,
                      country: app.job.city.state.country ? {
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
                      } : undefined,
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async getApplicationDetails(
    userId: string,
    applicationId: string,
  ): Promise<ApplicationResponseDto> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
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
                  companyId: true,
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
        throw new NotFoundException('Application not found');
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
          jobType: application.job.jobType,
          workMode: application.job.workMode,
          company: {
            id: application.job.company.id,
            name: application.job.company.name,
            companyId: application.job.company.companyId || '',
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
                    country: application.job.city.state.country
                      ? {
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
                        }
                      : undefined,
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async updateApplication(
    userId: string,
    applicationId: string,
    updateDto: UpdateApplicationDto,
  ): Promise<ApplicationResponseDto> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
      }

      const application = await this.db.jobApplication.findFirst({
        where: {
          id: applicationId,
          candidateId: candidate.id,
        },
      });

      if (!application) {
        throw new NotFoundException('Application not found');
      }

      // Only allow candidates to update cover letter and withdraw application
      const updateData: any = {};
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
                  companyId: true,
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

      // Log the application update
      await this.logActivity(
        userId,
        LogAction.UPDATE,
        LogLevel.INFO,
        'JobApplication',
        applicationId,
        'Application updated',
      );

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
          jobType: updatedApplication.job.jobType,
          workMode: updatedApplication.job.workMode,
          company: {
            id: updatedApplication.job.company.id,
            name: updatedApplication.job.company.name,
            companyId: updatedApplication.job.company.companyId || '',
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
                    country: updatedApplication.job.city.state.country
                      ? {
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
                        }
                      : undefined,
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  // =================================================================
  // DASHBOARD STATISTICS
  // =================================================================

  async getDashboardStats(userId: string): Promise<any> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
      }

      // Count profile views from ActivityLog
      // Profile views are logged when someone views the candidate profile
      const profileViews = await this.db.activityLog.count({
        where: {
          entity: 'Candidate',
          entityId: candidate.id,
          action: 'VIEW',
        },
      });

      // Count previous day profile views for percentage calculation
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterdayViews = await this.db.activityLog.count({
        where: {
          entity: 'Candidate',
          entityId: candidate.id,
          action: 'VIEW',
          createdAt: {
            gte: yesterday,
            lt: today,
          },
        },
      });

      const todayViews = await this.db.activityLog.count({
        where: {
          entity: 'Candidate',
          entityId: candidate.id,
          action: 'VIEW',
          createdAt: {
            gte: today,
          },
        },
      });

      // Calculate percentage change
      let viewsChange = 0;
      let viewsPercentage = 0;
      if (yesterdayViews > 0) {
        viewsChange = todayViews - yesterdayViews;
        viewsPercentage = ((todayViews - yesterdayViews) / yesterdayViews) * 100;
      } else if (todayViews > 0) {
        viewsChange = todayViews;
        viewsPercentage = 100;
      }

      // Count total job applications
      const totalApplications = await this.db.jobApplication.count({
        where: { candidateId: candidate.id },
      });

      return {
        profileViews,
        totalApplications,
        profileViewsChange: {
          value: viewsChange,
          percentage: Math.round(viewsPercentage * 10) / 10, // Round to 1 decimal place
          period: 'day',
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  // =================================================================
  // JOB APPLICATION - APPLY FOR JOB
  // =================================================================

  async applyForJob(
    userId: string,
    jobId: string,
    applyDto: ApplyForJobDto,
  ): Promise<ApplicationResponseDto> {
    try {
      const candidate = await this.getOrCreateCandidate(userId);

      // Check if job exists
      const job = await this.db.job.findUnique({
        where: { id: jobId },
        include: { company: true, city: true },
      });

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      // Check if already applied
      const existingApplication = await this.db.jobApplication.findFirst({
        where: {
          jobId,
          candidateId: candidate.id,
        },
      });

      if (existingApplication) {
        throw new BadRequestException('You have already applied for this job');
      }

      // Create application
      const application = await this.db.jobApplication.create({
        data: {
          jobId,
          candidateId: candidate.id,
          resumeId: applyDto.resumeId,
          resumeFilePath: applyDto.resumeFilePath,
          coverLetter: applyDto.coverLetter,
          fullName: applyDto.fullName,
          email: applyDto.email,
          phone: applyDto.phone,
          location: applyDto.location,
          experienceLevel: applyDto.experienceLevel,
          noticePeriod: applyDto.noticePeriod,
          currentCTC: applyDto.currentCTC,
          expectedCTC: applyDto.expectedCTC,
          status: 'APPLIED',
        },
        include: {
          job: {
            include: {
              company: true,
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
          resume: true,
        },
      });

      // Increment application count on job
      await this.db.job.update({
        where: { id: jobId },
        data: {
          applicationCount: {
            increment: 1,
          },
        },
      });

      // Log activity
      await this.logActivity(
        userId,
        LogAction.APPLY,
        LogLevel.INFO,
        'JobApplication',
        application.id,
        `Applied for job: ${job.title}`,
      );

      return {
        id: application.id,
        jobId: application.jobId,
        candidateId: application.candidateId,
        resumeId: application.resumeId || undefined,
        resumeFilePath: application.resumeFilePath || undefined,
        coverLetter: application.coverLetter || undefined,
        status: application.status,
        appliedAt: application.appliedAt,
        reviewedAt: application.reviewedAt || undefined,
        reviewedBy: application.reviewedBy || undefined,
        feedback: application.feedback || undefined,
        fullName: application.fullName || undefined,
        email: application.email || undefined,
        phone: application.phone || undefined,
        location: application.location || undefined,
        experienceLevel: application.experienceLevel || undefined,
        noticePeriod: application.noticePeriod || undefined,
        currentCTC: application.currentCTC || undefined,
        expectedCTC: application.expectedCTC || undefined,
        updatedAt: application.updatedAt,
        job: {
          id: application.job.id,
          title: application.job.title,
          slug: application.job.slug,
          description: application.job.description,
          jobType: application.job.jobType,
          workMode: application.job.workMode,
          company: {
            id: application.job.company.id,
            name: application.job.company.name,
            companyId: application.job.company.companyId || '',
            logo: application.job.company.logo || undefined,
          },
          location: application.job.city && application.job.city.state ? {
            city: {
              id: application.job.city.id,
              name: application.job.city.name,
              state_id: application.job.city.state_id,
              state_code: application.job.city.state_code ?? null,
              state_name: application.job.city.state_name ?? null,
              country_id: application.job.city.country_id ?? null,
              country_code: application.job.city.country_code ?? null,
              country_name: application.job.city.country_name ?? null,
              latitude: application.job.city.latitude ?? null,
              longitude: application.job.city.longitude ?? null,
              wikiDataId: application.job.city.wikiDataId ?? null,
              isActive: application.job.city.isActive,
              createdAt: application.job.city.createdAt,
              updatedAt: application.job.city.updatedAt,
              state: {
                id: application.job.city.state.id,
                name: application.job.city.state.name,
                country_id: application.job.city.state.country_id ?? null,
                country_code: application.job.city.state.country_code ?? null,
                country_name: application.job.city.state.country_name ?? null,
                iso2: application.job.city.state.iso2 ?? null,
                fips_code: application.job.city.state.fips_code ?? null,
                type: application.job.city.state.type ?? null,
                level: application.job.city.state.level ?? null,
                parent_id: application.job.city.state.parent_id ?? null,
                latitude: application.job.city.state.latitude ?? null,
                longitude: application.job.city.state.longitude ?? null,
                isActive: application.job.city.state.isActive,
                createdAt: application.job.city.state.createdAt,
                updatedAt: application.job.city.state.updatedAt,
                country: application.job.city.state.country ? {
                  id: application.job.city.state.country.id,
                  name: application.job.city.state.country.name,
                  iso3: application.job.city.state.country.iso3 ?? null,
                  iso2: application.job.city.state.country.iso2 ?? null,
                  numeric_code: application.job.city.state.country.numeric_code ?? null,
                  phonecode: application.job.city.state.country.phonecode ?? null,
                  capital: application.job.city.state.country.capital ?? null,
                  currency: application.job.city.state.country.currency ?? null,
                  currency_name: application.job.city.state.country.currency_name ?? null,
                  currency_symbol: application.job.city.state.country.currency_symbol ?? null,
                  tld: application.job.city.state.country.tld ?? null,
                  native: application.job.city.state.country.native ?? null,
                  region: application.job.city.state.country.region ?? null,
                  region_id: application.job.city.state.country.region_id ?? null,
                  subregion: application.job.city.state.country.subregion ?? null,
                  subregion_id: application.job.city.state.country.subregion_id ?? null,
                  nationality: application.job.city.state.country.nationality ?? null,
                  latitude: application.job.city.state.country.latitude ?? null,
                  longitude: application.job.city.state.country.longitude ?? null,
                  isActive: application.job.city.state.country.isActive,
                  createdAt: application.job.city.state.country.createdAt,
                  updatedAt: application.job.city.state.country.updatedAt,
                } : undefined,
              },
            },
          } : undefined,
        },
        resume: application.resume ? {
          id: application.resume.id,
          title: application.resume.title,
          fileName: application.resume.fileName,
          uploadedAt: application.resume.uploadedAt,
        } : undefined,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  // =================================================================
  // FAVORITE JOBS MANAGEMENT
  // =================================================================

  async getFavoriteJobs(userId: string): Promise<any> {
    try {
      const candidate = await this.getOrCreateCandidate(userId);

      const favoriteJobs = await this.db.favoriteJob.findMany({
        where: { candidateId: candidate.id },
        include: {
          job: {
            include: {
              company: true,
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
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        favoriteJobs: favoriteJobs.map((fav) => ({
          id: fav.id,
          jobId: fav.jobId,
          createdAt: fav.createdAt,
          job: fav.job,
        })),
        total: favoriteJobs.length,
      };
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async checkFavoriteJob(userId: string, jobId: string): Promise<{ isFavorite: boolean }> {
    try {
      const candidate = await this.getOrCreateCandidate(userId);

      const favoriteJob = await this.db.favoriteJob.findFirst({
        where: {
          candidateId: candidate.id,
          jobId,
        },
      });

      return {
        isFavorite: !!favoriteJob,
      };
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async addFavoriteJob(userId: string, jobId: string): Promise<{ message: string; favoriteJob: any }> {
    try {
      const candidate = await this.getOrCreateCandidate(userId);

      // Check if job exists
      const job = await this.db.job.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      // Check if already favorited
      const existing = await this.db.favoriteJob.findFirst({
        where: {
          candidateId: candidate.id,
          jobId,
        },
      });

      if (existing) {
        throw new BadRequestException('Job is already in your favorites');
      }

      const favoriteJob = await this.db.favoriteJob.create({
        data: {
          candidateId: candidate.id,
          jobId,
        },
        include: {
          job: {
            include: {
              company: true,
              city: true,
            },
          },
        },
      });

      await this.logActivity(
        userId,
        LogAction.CREATE,
        LogLevel.INFO,
        'FavoriteJob',
        favoriteJob.id,
        `Added job to favorites: ${job.title}`,
      );

      return {
        message: 'Job added to favorites successfully',
        favoriteJob,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async removeFavoriteJob(userId: string, jobId: string): Promise<{ message: string }> {
    try {
      const candidate = await this.getOrCreateCandidate(userId);

      const favoriteJob = await this.db.favoriteJob.findFirst({
        where: {
          candidateId: candidate.id,
          jobId,
        },
      });

      if (!favoriteJob) {
        throw new NotFoundException('Favorite job not found');
      }

      await this.db.favoriteJob.delete({
        where: { id: favoriteJob.id },
      });

      await this.logActivity(
        userId,
        LogAction.DELETE,
        LogLevel.INFO,
        'FavoriteJob',
        favoriteJob.id,
        'Removed job from favorites',
      );

      return {
        message: 'Job removed from favorites successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  private handleException(error: any): void {
    throw new InternalServerErrorException("Can't process candidate request");
  }
}
