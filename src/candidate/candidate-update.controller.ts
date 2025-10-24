import {
  Controller,
  Put,
  Get,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CandidateUpdateService } from './candidate-update.service';
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

@Controller('candidate')
@UseGuards(JwtAuthGuard)
export class CandidateUpdateController {
  constructor(
    private readonly candidateUpdateService: CandidateUpdateService,
  ) {}

  @Put('profile/:candidateId')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FilesInterceptor('files', 2, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, callback) => {
        // Allow images for profile picture
        if (file.fieldname === 'profilePicture') {
          if (file.mimetype.startsWith('image/')) {
            callback(null, true);
          } else {
            callback(new Error('Profile picture must be an image'), false);
          }
        }
        // Allow PDFs and documents for CV
        else if (file.fieldname === 'cv') {
          const allowedMimes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ];
          if (allowedMimes.includes(file.mimetype)) {
            callback(null, true);
          } else {
            callback(new Error('CV must be a PDF or Word document'), false);
          }
        } else {
          callback(null, true);
        }
      },
    }),
  )
  async updateCandidateProfile(
    @Param('candidateId') candidateId: string,
    @Body() updateDto: UpdateCandidateProfileDto,
    @UploadedFiles() files: MulterFile[],
    @GetCurrentUser() user: CurrentUser,
  ) {
    // Separate files by fieldname
    const fileMap: {
      profilePicture?: MulterFile;
      cv?: MulterFile;
    } = {};

    files?.forEach((file) => {
      if (file.fieldname === 'profilePicture') {
        fileMap.profilePicture = file;
      } else if (file.fieldname === 'cv') {
        fileMap.cv = file;
      }
    });

    return this.candidateUpdateService.updateCandidateProfile(
      candidateId,
      updateDto,
      fileMap,
    );
  }

  @Get('profile/:candidateId')
  async getCandidateProfile(
    @Param('candidateId') candidateId: string,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.candidateUpdateService.getCandidateProfile(candidateId);
  }

  @Get('profile')
  async getCurrentCandidateProfile(
    @GetCurrentUser() user: CurrentUser,
  ) {
    // Find candidate by user ID
    const candidate = await this.candidateUpdateService['prisma'].candidate.findFirst({
      where: { userId: user.id },
    });

    if (!candidate) {
      throw new Error('Candidate profile not found for this user');
    }

    return this.candidateUpdateService.getCandidateProfile(candidate.id);
  }
}
