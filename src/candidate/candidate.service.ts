import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Multer } from 'multer';
import { UpdateCandidateProfileDto, UpdateAvailabilityDto, CandidateProfileResponseDto } from './dto/candidate-profile.dto';
import { CreateCandidateSkillDto, UpdateCandidateSkillDto, CandidateSkillResponseDto } from './dto/candidate-skill.dto';
import { CreateCandidateEducationDto, UpdateCandidateEducationDto, CandidateEducationResponseDto } from './dto/candidate-education.dto';
import { CreateCandidateExperienceDto, UpdateCandidateExperienceDto, CandidateExperienceResponseDto } from './dto/candidate-experience.dto';
import { 
  CreateJobAlertDto, 
  UpdateJobAlertDto, 
  JobAlertResponseDto, 
  RecommendedJobsResponseDto, 
  JobAlertsResponseDto 
} from './dto/job-alert.dto';
import { 
  ApplyForJobDto, 
  UpdateApplicationDto, 
  ApplicationResponseDto, 
  ApplicationsResponseDto, 
  ApplicationHistoryQueryDto 
} from './dto/job-application.dto';
import { 
  ResumeParseRequestDto, 
  ResumeParseResponseDto, 
  ResumeAnalysisResponseDto, 
  ResumeOptimizationResponseDto 
} from './dto/resume-analysis.dto';
import { LogAction, LogLevel } from '@prisma/client';

@Injectable()
export class CandidateService {
  constructor(private readonly db: DatabaseService) {}

  // =================================================================
  // CANDIDATE PROFILE MANAGEMENT
  // =================================================================

  async createCandidate(userId: string, createDto: any): Promise<CandidateProfileResponseDto> {
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
        'Candidate profile created'
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
        expectedSalary: candidate.expectedSalary ? Number(candidate.expectedSalary) : undefined,
        address: candidate.address || undefined,
        linkedinUrl: candidate.linkedinUrl || undefined,
        githubUrl: candidate.githubUrl || undefined,
        portfolioUrl: candidate.portfolioUrl || undefined,
        isAvailable: candidate.isAvailable,
        createdAt: candidate.createdAt,
        updatedAt: candidate.updatedAt,
        city: candidate.city ? {
          id: candidate.city.id,
          name: candidate.city.name,
          state: {
            id: candidate.city.state.id,
            name: candidate.city.state.name,
            country: {
              id: candidate.city.state.country.id,
              name: candidate.city.state.country.name,
              code: candidate.city.state.country.code,
            },
          },
        } : undefined,
      };
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async getCandidateProfile(userId: string): Promise<CandidateProfileResponseDto> {
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
        expectedSalary: candidate.expectedSalary ? Number(candidate.expectedSalary) : undefined,
        address: candidate.address || undefined,
        linkedinUrl: candidate.linkedinUrl || undefined,
        githubUrl: candidate.githubUrl || undefined,
        portfolioUrl: candidate.portfolioUrl || undefined,
        isAvailable: candidate.isAvailable,
        createdAt: candidate.createdAt,
        updatedAt: candidate.updatedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async updateCandidate(userId: string, updateDto: any): Promise<CandidateProfileResponseDto> {
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
        'Candidate profile updated'
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
        expectedSalary: updatedCandidate.expectedSalary ? Number(updatedCandidate.expectedSalary) : undefined,
        address: updatedCandidate.address || undefined,
        linkedinUrl: updatedCandidate.linkedinUrl || undefined,
        githubUrl: updatedCandidate.githubUrl || undefined,
        portfolioUrl: updatedCandidate.portfolioUrl || undefined,
        isAvailable: updatedCandidate.isAvailable,
        createdAt: updatedCandidate.createdAt,
        updatedAt: updatedCandidate.updatedAt,
        city: updatedCandidate.city ? {
          id: updatedCandidate.city.id,
          name: updatedCandidate.city.name,
          state: {
            id: updatedCandidate.city.state.id,
            name: updatedCandidate.city.state.name,
            country: {
              id: updatedCandidate.city.state.country.id,
              name: updatedCandidate.city.state.country.name,
              code: updatedCandidate.city.state.country.code,
            },
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

  // =================================================================
  // RESUME PARSING & ANALYSIS
  // =================================================================

  async parseResume(userId: string, parseDto: ResumeParseRequestDto): Promise<ResumeParseResponseDto> {
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
          location: candidate.city ? `${candidate.city.name}, ${candidate.city.state.name}, ${candidate.city.state.country.name}` : '',
        },
        experience: candidate.experience.map(exp => ({
          company: exp.company,
          position: exp.position,
          duration: `${exp.startDate.toISOString().split('T')[0]} - ${exp.endDate ? exp.endDate.toISOString().split('T')[0] : 'Present'}`,
          description: exp.description || '',
        })),
        education: candidate.education.map(edu => ({
          institution: edu.institution,
          degree: edu.degree,
          field: edu.fieldOfStudy || '',
          graduationYear: edu.endDate ? edu.endDate.getFullYear().toString() : '',
        })),
        skills: candidate.skills.map(skill => skill.skillName),
        summary: candidate.bio || 'Professional with relevant experience and skills',
      };

      // Log the resume parsing activity
      await this.logActivity(
        userId,
        LogAction.VIEW,
        LogLevel.INFO,
        'Resume',
        resume?.id || 'parse',
        'Resume parsed for data extraction'
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

  async getResumeAnalysis(userId: string, resumeId: string): Promise<ResumeAnalysisResponseDto> {
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
      const experienceScore = this.calculateExperienceScore(candidate.experience);
      const educationScore = this.calculateEducationScore(candidate.education);
      const skillsScore = this.calculateSkillsScore(candidate.skills);
      const summaryScore = this.calculateSummaryScore(candidate.bio);

      const overallScore = Math.round((personalInfoScore + experienceScore + educationScore + skillsScore + summaryScore) / 5);

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
        'Resume analysis generated'
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

  async optimizeResume(userId: string, resumeId: string): Promise<ResumeOptimizationResponseDto> {
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

      // Log the resume optimization activity
      await this.logActivity(
        userId,
        LogAction.VIEW,
        LogLevel.INFO,
        'Resume',
        resumeId,
        'Resume optimization suggestions generated'
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
    score += experience.some(exp => exp.achievements) ? 20 : 0;
    score += experience.some(exp => exp.description && exp.description.length > 50) ? 20 : 0;
    return Math.min(score, 100);
  }

  private calculateEducationScore(education: any[]): number {
    if (education.length === 0) return 0;
    let score = 0;
    score += Math.min(education.length * 25, 75);
    score += education.some(edu => edu.isCompleted) ? 15 : 0;
    score += education.some(edu => edu.grade) ? 10 : 0;
    return Math.min(score, 100);
  }

  private calculateSkillsScore(skills: any[]): number {
    if (skills.length === 0) return 0;
    let score = 0;
    score += Math.min(skills.length * 8, 60);
    score += skills.some(skill => skill.level) ? 20 : 0;
    score += skills.some(skill => skill.yearsUsed) ? 20 : 0;
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
    const optionalFields = ['user.phone', 'city', 'bio', 'linkedinUrl', 'githubUrl', 'portfolioUrl'];
    
    requiredFields.forEach(field => {
      fields++;
      if (this.getNestedValue(candidate, field)) completed++;
    });
    
    optionalFields.forEach(field => {
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
    const withAchievements = experience.filter(exp => exp.achievements && exp.achievements.length > 0).length;
    return Math.round((withAchievements / experience.length) * 100) || 0;
  }

  private getExperienceIssues(experience: any[]): string[] {
    const issues: string[] = [];
    if (experience.length === 0) issues.push('No work experience listed');
    if (!experience.some(exp => exp.achievements)) issues.push('Missing quantifiable achievements');
    if (!experience.some(exp => exp.description && exp.description.length > 50)) issues.push('Job descriptions are too brief');
    return issues;
  }

  private calculateEducationRelevance(education: any[]): number {
    if (education.length === 0) return 0;
    return Math.min(education.length * 30, 100);
  }

  private getEducationIssues(education: any[]): string[] {
    const issues: string[] = [];
    if (education.length === 0) issues.push('No education listed');
    if (!education.some(edu => edu.isCompleted)) issues.push('Some education entries are incomplete');
    return issues;
  }

  private calculateSkillsRelevance(skills: any[]): number {
    if (skills.length === 0) return 0;
    return Math.min(skills.length * 15, 100);
  }

  private calculateSkillsDiversity(skills: any[]): number {
    if (skills.length === 0) return 0;
    const categories = new Set(skills.map(skill => skill.skillName.toLowerCase().split(' ')[0]));
    return Math.min(categories.size * 20, 100);
  }

  private getSkillsIssues(skills: any[]): string[] {
    const issues: string[] = [];
    if (skills.length === 0) issues.push('No skills listed');
    if (skills.length < 3) issues.push('Too few skills listed');
    if (!skills.some(skill => skill.level)) issues.push('Skill levels not specified');
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
      if (!bio.includes('experience') && !bio.includes('skills')) issues.push('Summary lacks key information');
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
    if (candidate.education.length > 0) strengths.push('Educational background present');
    if (candidate.skills.length > 0) strengths.push('Skills are listed');
    if (candidate.bio && candidate.bio.length > 50) strengths.push('Professional summary present');
    if (candidate.linkedinUrl) strengths.push('LinkedIn profile connected');
    return strengths;
  }

  private identifyWeaknesses(candidate: any): string[] {
    const weaknesses: string[] = [];
    if (candidate.experience.length === 0) weaknesses.push('No work experience');
    if (!candidate.bio || candidate.bio.length < 50) weaknesses.push('Weak professional summary');
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
    suggestions.push('Use standard section headers (Experience, Education, Skills)');
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
        suggested: 'Write a compelling professional summary highlighting key achievements',
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
      missing: missing.filter(keyword => 
        !candidate.skills.some((skill: any) => 
          skill.skillName.toLowerCase().includes(keyword.toLowerCase())
        )
      ),
      overused: overused.filter(keyword => 
        candidate.bio?.toLowerCase().includes(keyword.toLowerCase())
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
    if (candidate.experience.length > 0) length += candidate.experience.length * 0.3;
    if (candidate.education.length > 0) length += candidate.education.length * 0.2;
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

  async updateCandidateProfile(userId: string, updateDto: UpdateCandidateProfileDto): Promise<CandidateProfileResponseDto> {
    try {
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
      }

      const updateData: any = { ...updateDto };

      // Convert date strings to Date objects
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

      // Log the profile update
      await this.logActivity(userId, LogAction.UPDATE, LogLevel.INFO, 'Candidate', candidate.id, 'Profile updated');

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
        expectedSalary: updatedCandidate.expectedSalary ? Number(updatedCandidate.expectedSalary) : undefined,
        address: updatedCandidate.address || undefined,
        linkedinUrl: updatedCandidate.linkedinUrl || undefined,
        githubUrl: updatedCandidate.githubUrl || undefined,
        portfolioUrl: updatedCandidate.portfolioUrl || undefined,
        isAvailable: updatedCandidate.isAvailable,
        createdAt: updatedCandidate.createdAt,
        updatedAt: updatedCandidate.updatedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async uploadProfilePicture(userId: string, file: Multer.File): Promise<{ message: string; profilePicture: string }> {
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
      await this.logActivity(userId, LogAction.UPDATE, LogLevel.INFO, 'Candidate', candidate.id, 'Profile picture uploaded');

      return { message: 'Profile picture uploaded successfully', profilePicture };
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
      await this.logActivity(userId, LogAction.DELETE, LogLevel.INFO, 'Candidate', candidate.id, 'Profile picture deleted');

      return { message: 'Profile picture deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async updateAvailability(userId: string, updateDto: UpdateAvailabilityDto): Promise<{ message: string }> {
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
      await this.logActivity(userId, LogAction.UPDATE, LogLevel.INFO, 'Candidate', candidate.id, `Availability updated to ${updateDto.isAvailable ? 'available' : 'unavailable'}`);

      return { message: 'Availability updated successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  // =================================================================
  // CANDIDATE SKILLS MANAGEMENT
  // =================================================================

  async getCandidateSkills(userId: string): Promise<CandidateSkillResponseDto[]> {
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

      return skills.map(skill => ({
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

  async addCandidateSkill(userId: string, createDto: CreateCandidateSkillDto): Promise<CandidateSkillResponseDto> {
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
      await this.logActivity(userId, LogAction.CREATE, LogLevel.INFO, 'CandidateSkill', skill.id, `Skill added: ${createDto.skillName}`);

      return {
        id: skill.id,
        candidateId: skill.candidateId,
        skillName: skill.skillName,
        level: skill.level,
        yearsUsed: skill.yearsUsed,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async updateCandidateSkill(userId: string, skillId: string, updateDto: UpdateCandidateSkillDto): Promise<CandidateSkillResponseDto> {
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
      await this.logActivity(userId, LogAction.UPDATE, LogLevel.INFO, 'CandidateSkill', skillId, `Skill updated: ${updatedSkill.skillName}`);

      return {
        id: updatedSkill.id,
        candidateId: updatedSkill.candidateId,
        skillName: updatedSkill.skillName,
        level: updatedSkill.level,
        yearsUsed: updatedSkill.yearsUsed,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async deleteCandidateSkill(userId: string, skillId: string): Promise<{ message: string }> {
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
      await this.logActivity(userId, LogAction.DELETE, LogLevel.INFO, 'CandidateSkill', skillId, `Skill deleted: ${skill.skillName}`);

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

  async getCandidateEducation(userId: string): Promise<CandidateEducationResponseDto[]> {
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

      return education.map(edu => ({
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

  async addCandidateEducation(userId: string, createDto: CreateCandidateEducationDto): Promise<CandidateEducationResponseDto> {
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
      await this.logActivity(userId, LogAction.CREATE, LogLevel.INFO, 'CandidateEducation', education.id, `Education added: ${createDto.degree} at ${createDto.institution}`);

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

  async updateCandidateEducation(userId: string, educationId: string, updateDto: UpdateCandidateEducationDto): Promise<CandidateEducationResponseDto> {
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
      await this.logActivity(userId, LogAction.UPDATE, LogLevel.INFO, 'CandidateEducation', educationId, `Education updated: ${updatedEducation.degree} at ${updatedEducation.institution}`);

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

  async deleteCandidateEducation(userId: string, educationId: string): Promise<{ message: string }> {
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
      await this.logActivity(userId, LogAction.DELETE, LogLevel.INFO, 'CandidateEducation', educationId, `Education deleted: ${education.degree} at ${education.institution}`);

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

  async getCandidateExperience(userId: string): Promise<CandidateExperienceResponseDto[]> {
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

      return experience.map(exp => ({
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

  async addCandidateExperience(userId: string, createDto: CreateCandidateExperienceDto): Promise<CandidateExperienceResponseDto> {
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
      await this.logActivity(userId, LogAction.CREATE, LogLevel.INFO, 'CandidateExperience', experience.id, `Experience added: ${createDto.position} at ${createDto.company}`);

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

  async updateCandidateExperience(userId: string, experienceId: string, updateDto: UpdateCandidateExperienceDto): Promise<CandidateExperienceResponseDto> {
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
      await this.logActivity(userId, LogAction.UPDATE, LogLevel.INFO, 'CandidateExperience', experienceId, `Experience updated: ${updatedExperience.position} at ${updatedExperience.company}`);

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

  async deleteCandidateExperience(userId: string, experienceId: string): Promise<{ message: string }> {
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
      await this.logActivity(userId, LogAction.DELETE, LogLevel.INFO, 'CandidateExperience', experienceId, `Experience deleted: ${experience.position} at ${experience.company}`);

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

  async getRecommendedJobs(userId: string, query: any): Promise<RecommendedJobsResponseDto> {
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
        const candidateSkills = candidate.skills.map(skill => skill.skillName);
        whereClause.skillsRequired = {
          hasSome: candidateSkills,
        };
      }

      // Filter by experience level
      if (candidate.experience && candidate.experience.length > 0) {
        // Determine experience level based on years of experience
        const totalExperience = candidate.experience.reduce((total, exp) => {
          const startDate = new Date(exp.startDate);
          const endDate = exp.isCurrent ? new Date() : (exp.endDate ? new Date(exp.endDate) : new Date());
          const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
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
        jobs: jobs.map(job => ({
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
          location: job.city ? {
            city: {
              id: job.city.id,
              name: job.city.name,
              state: {
                id: job.city.state.id,
                name: job.city.state.name,
                code: job.city.state.code,
                country: {
                  id: job.city.state.country.id,
                  name: job.city.state.country.name,
                  code: job.city.state.country.code,
                },
              },
            },
          } : null,
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

  async getJobAlerts(userId: string, query: any): Promise<JobAlertsResponseDto> {
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
        alerts: alerts.map(alert => ({
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

  async createJobAlert(userId: string, createDto: CreateJobAlertDto): Promise<JobAlertResponseDto> {
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
      await this.logActivity(userId, LogAction.CREATE, LogLevel.INFO, 'JobAlert', alert.id, `Job alert created: ${createDto.title}`);

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

  async updateJobAlert(userId: string, alertId: string, updateDto: UpdateJobAlertDto): Promise<JobAlertResponseDto> {
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
      await this.logActivity(userId, LogAction.UPDATE, LogLevel.INFO, 'JobAlert', alertId, `Job alert updated: ${updatedAlert.title}`);

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

  async getCandidateApplications(userId: string, query: any): Promise<ApplicationsResponseDto> {
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
        applications: applications.map(app => ({
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
            location: app.job.city ? {
              city: {
                id: app.job.city.id,
                name: app.job.city.name,
                state: {
                  id: app.job.city.state.id,
                  name: app.job.city.state.name,
                  code: app.job.city.state.code || undefined,
                  country: {
                    id: app.job.city.state.country.id,
                    name: app.job.city.state.country.name,
                    code: app.job.city.state.country.code,
                  },
                },
              },
            } : undefined,
          },
          resume: app.resume ? {
            id: app.resume.id,
            title: app.resume.title,
            fileName: app.resume.fileName,
            uploadedAt: app.resume.uploadedAt,
          } : undefined,
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

  async getApplicationHistory(userId: string, query: ApplicationHistoryQueryDto): Promise<ApplicationsResponseDto> {
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
          whereClause.job.title = { contains: query.jobTitle, mode: 'insensitive' };
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
        applications: applications.map(app => ({
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
            location: app.job.city ? {
              city: {
                id: app.job.city.id,
                name: app.job.city.name,
                state: {
                  id: app.job.city.state.id,
                  name: app.job.city.state.name,
                  code: app.job.city.state.code || undefined,
                  country: {
                    id: app.job.city.state.country.id,
                    name: app.job.city.state.country.name,
                    code: app.job.city.state.country.code,
                  },
                },
              },
            } : undefined,
          },
          resume: app.resume ? {
            id: app.resume.id,
            title: app.resume.title,
            fileName: app.resume.fileName,
            uploadedAt: app.resume.uploadedAt,
          } : undefined,
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

  async getApplicationDetails(userId: string, applicationId: string): Promise<ApplicationResponseDto> {
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
          company: {
            id: application.job.company.id,
            name: application.job.company.name,
            logo: application.job.company.logo || undefined,
          },
          location: application.job.city ? {
            city: {
              id: application.job.city.id,
              name: application.job.city.name,
              state: {
                id: application.job.city.state.id,
                name: application.job.city.state.name,
                code: application.job.city.state.code || undefined,
                country: {
                  id: application.job.city.state.country.id,
                  name: application.job.city.state.country.name,
                  code: application.job.city.state.country.code,
                },
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
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async updateApplication(userId: string, applicationId: string, updateDto: UpdateApplicationDto): Promise<ApplicationResponseDto> {
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
      await this.logActivity(userId, LogAction.UPDATE, LogLevel.INFO, 'JobApplication', applicationId, 'Application updated');

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
          location: updatedApplication.job.city ? {
            city: {
              id: updatedApplication.job.city.id,
              name: updatedApplication.job.city.name,
              state: {
                id: updatedApplication.job.city.state.id,
                name: updatedApplication.job.city.state.name,
                code: updatedApplication.job.city.state.code || undefined,
                country: {
                  id: updatedApplication.job.city.state.country.id,
                  name: updatedApplication.job.city.state.country.name,
                  code: updatedApplication.job.city.state.country.code,
                },
              },
            },
          } : undefined,
        },
        resume: updatedApplication.resume ? {
          id: updatedApplication.resume.id,
          title: updatedApplication.resume.title,
          fileName: updatedApplication.resume.fileName,
          uploadedAt: updatedApplication.resume.uploadedAt,
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

  private handleException(error: any): void {
    throw new InternalServerErrorException("Can't process candidate request");
  }
}
