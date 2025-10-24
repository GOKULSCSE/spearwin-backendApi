import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { FileUploadService } from '../common/services/file-upload.service';
import { UpdateCandidateProfileDto } from './dto/update-candidate-profile.dto';

// Define Multer file type
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class CandidateUpdateService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async updateCandidateProfile(
    candidateId: string,
    updateDto: UpdateCandidateProfileDto,
    files?: {
      profilePicture?: MulterFile;
      cv?: MulterFile;
    },
  ) {
    try {
      // Check if candidate exists
      const existingCandidate = await this.prisma.candidate.findUnique({
        where: { id: candidateId },
        include: { user: true },
      });

      if (!existingCandidate) {
        throw new NotFoundException('Candidate profile not found');
      }

      // Handle file uploads
      let profilePictureUrl = existingCandidate.profilePicture;
      let cvUrl = '';

      if (files?.profilePicture) {
        // Delete old profile picture if exists
        if (existingCandidate.profilePicture) {
          try {
            const oldKey = existingCandidate.profilePicture.split('/').pop();
            await this.fileUploadService.deleteFile(`candidates/profile-pictures/${oldKey}`);
          } catch (error) {
            console.log('Could not delete old profile picture:', error.message);
          }
        }

        const profilePictureResult = await this.fileUploadService.uploadFile(
          files.profilePicture,
          'candidates/profile-pictures',
        );
        profilePictureUrl = profilePictureResult.url;
      }

      if (files?.cv) {
        const cvResult = await this.fileUploadService.uploadFile(
          files.cv,
          'candidates/cvs',
        );
        cvUrl = cvResult.url;
      }

      // Update candidate profile in a transaction
      const result = await this.prisma.$transaction(async (prisma) => {
        // Update candidate profile
        const updatedCandidate = await prisma.candidate.update({
          where: { id: candidateId },
          data: {
            firstName: updateDto.firstName,
            lastName: updateDto.lastName,
            fatherName: updateDto.fatherName,
            dateOfBirth: updateDto.dateOfBirth ? new Date(updateDto.dateOfBirth) : undefined,
            gender: updateDto.gender,
            maritalStatus: updateDto.maritalStatus,
            profilePicture: profilePictureUrl,
            bio: updateDto.profileSummary,
            currentTitle: updateDto.jobExperience,
            experienceYears: this.extractExperienceYears(updateDto.jobExperience),
            expectedSalary: updateDto.expectedSalary,
            address: updateDto.streetAddress,
            cityName: updateDto.cityName,
            country: updateDto.country,
            currentCompany: updateDto.currentCompany,
            currentLocation: updateDto.currentLocation,
            currentSalary: updateDto.currentSalary,
            email: updateDto.email,
            jobExperience: updateDto.jobExperience,
            noticePeriod: updateDto.noticePeriod,
            preferredLocation: updateDto.preferredLocation,
            profileSummary: updateDto.profileSummary,
            profileType: updateDto.profileType,
            state: updateDto.state,
            streetAddress: updateDto.streetAddress,
            linkedinUrl: updateDto.linkedinUrl,
            githubUrl: updateDto.githubUrl,
            portfolioUrl: updateDto.portfolioUrl,
            isAvailable: updateDto.isAvailable,
            mobileNumber: updateDto.mobileNumber,
          },
          include: {
            user: true,
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
        });

        // Create resume record if new CV is uploaded
        if (cvUrl && files?.cv) {
          await prisma.resume.create({
            data: {
              candidateId: updatedCandidate.id,
              title: 'CV',
              fileName: files.cv.originalname,
              filePath: cvUrl,
              fileSize: files.cv.size,
              mimeType: files.cv.mimetype,
              isDefault: true,
            },
          });
        }

        return updatedCandidate;
      });

      return {
        success: true,
        message: 'Candidate profile updated successfully',
        data: {
          id: result.id,
          userId: result.userId,
          firstName: result.firstName,
          lastName: result.lastName,
          fatherName: result.fatherName,
          dateOfBirth: result.dateOfBirth,
          gender: result.gender,
          maritalStatus: result.maritalStatus,
          profilePicture: result.profilePicture,
          bio: result.bio,
          currentTitle: result.currentTitle,
          currentCompany: result.currentCompany,
          currentLocation: result.currentLocation,
          preferredLocation: result.preferredLocation,
          noticePeriod: result.noticePeriod,
          currentSalary: result.currentSalary ? Number(result.currentSalary) : undefined,
          expectedSalary: result.expectedSalary ? Number(result.expectedSalary) : undefined,
          profileType: result.profileType,
          experienceYears: result.experienceYears,
          address: result.address,
          linkedinUrl: result.linkedinUrl,
          githubUrl: result.githubUrl,
          portfolioUrl: result.portfolioUrl,
          isAvailable: result.isAvailable,
          email: result.email,
          mobileNumber: result.mobileNumber,
          jobExperience: result.jobExperience,
          country: result.country,
          state: result.state,
          cityName: result.cityName,
          streetAddress: result.streetAddress,
          profileSummary: result.profileSummary,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
          user: result.user,
          city: result.city,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update candidate profile: ${error.message}`);
    }
  }

  async getCandidateProfile(candidateId: string) {
    try {
      const candidate = await this.prisma.candidate.findUnique({
        where: { id: candidateId },
        include: {
          user: true,
          city: {
            include: {
              state: {
                include: {
                  country: true,
                },
              },
            },
          },
          resumes: {
            where: { isDefault: true },
            orderBy: { uploadedAt: 'desc' },
            take: 1,
          },
        },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
      }

      return {
        success: true,
        message: 'Candidate profile retrieved successfully',
        data: {
          id: candidate.id,
          userId: candidate.userId,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          fatherName: candidate.fatherName,
          dateOfBirth: candidate.dateOfBirth,
          gender: candidate.gender,
          maritalStatus: candidate.maritalStatus,
          profilePicture: candidate.profilePicture,
          bio: candidate.bio,
          currentTitle: candidate.currentTitle,
          currentCompany: candidate.currentCompany,
          currentLocation: candidate.currentLocation,
          preferredLocation: candidate.preferredLocation,
          noticePeriod: candidate.noticePeriod,
          currentSalary: candidate.currentSalary ? Number(candidate.currentSalary) : undefined,
          expectedSalary: candidate.expectedSalary ? Number(candidate.expectedSalary) : undefined,
          profileType: candidate.profileType,
          experienceYears: candidate.experienceYears,
          address: candidate.address,
          linkedinUrl: candidate.linkedinUrl,
          githubUrl: candidate.githubUrl,
          portfolioUrl: candidate.portfolioUrl,
          isAvailable: candidate.isAvailable,
          email: candidate.email,
          mobileNumber: candidate.mobileNumber,
          jobExperience: candidate.jobExperience,
          country: candidate.country,
          state: candidate.state,
          cityName: candidate.cityName,
          streetAddress: candidate.streetAddress,
          profileSummary: candidate.profileSummary,
          createdAt: candidate.createdAt,
          updatedAt: candidate.updatedAt,
          user: candidate.user,
          city: candidate.city,
          cv: candidate.resumes[0] ? {
            id: candidate.resumes[0].id,
            title: candidate.resumes[0].title,
            fileName: candidate.resumes[0].fileName,
            filePath: candidate.resumes[0].filePath,
            fileSize: candidate.resumes[0].fileSize,
            mimeType: candidate.resumes[0].mimeType,
            isDefault: candidate.resumes[0].isDefault,
            uploadedAt: candidate.resumes[0].uploadedAt,
          } : null,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to get candidate profile: ${error.message}`);
    }
  }

  private extractExperienceYears(jobExperience?: string): number | null {
    if (!jobExperience) return null;
    
    // Extract years from strings like "3+ years", "5 years", "2-3 years"
    const match = jobExperience.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }
}
