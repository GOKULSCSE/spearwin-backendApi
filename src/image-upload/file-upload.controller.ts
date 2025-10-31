import {
  Controller,
  Post,
  Delete,
  Get,
  Query,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@Controller('file-upload')
// @UseGuards(JwtAuthGuard) // Temporarily disabled for testing
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('single')
  @UseInterceptors(FileInterceptor('image'))
  async uploadSingleImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const imageUrl = await this.fileUploadService.uploadImage(file, folder);
    return {
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      },
    };
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 files
  async uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No image files provided');
    }

    const imageUrls = await this.fileUploadService.uploadMultipleImages(files, folder);
    
    return {
      success: true,
      message: `${files.length} images uploaded successfully`,
      data: {
        imageUrls,
        count: files.length,
        files: files.map(file => ({
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
        })),
      },
    };
  }

  @Delete()
  async deleteImage(@Body('imageUrl') imageUrl: string) {
    if (!imageUrl) {
      throw new BadRequestException('Image URL is required');
    }

    await this.fileUploadService.deleteImage(imageUrl);
    
    return {
      success: true,
      message: 'Image deleted successfully',
    };
  }

  @Get('presigned-url')
  async getPresignedUrl(
    @Query('key') key: string,
    @Query('expiresIn') expiresIn?: string,
  ) {
    if (!key) {
      throw new BadRequestException('Key is required');
    }

    const expires = expiresIn ? parseInt(expiresIn) : 3600;
    const presignedUrl = await this.fileUploadService.generatePresignedUrl(key, expires);
    
    return {
      success: true,
      data: {
        presignedUrl,
        key,
        expiresIn: expires,
      },
    };
  }

  @Get('url/:key')
  async getImageUrl(@Param('key') key: string) {
    const imageUrl = await this.fileUploadService.getImageUrl(key);
    
    return {
      success: true,
      data: {
        imageUrl,
        key,
      },
    };
  }

  // =================================================================
  // DOCUMENT UPLOAD ENDPOINTS
  // =================================================================

  @Post('document/single')
  @UseInterceptors(FileInterceptor('document'))
  async uploadSingleDocument(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No document file provided');
    }

    const documentUrl = await this.fileUploadService.uploadDocument(file, folder);
    return {
      success: true,
      message: 'Document uploaded successfully',
      data: {
        documentUrl,
        documentKey: documentUrl, // Keep for backward compatibility
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      },
    };
  }

  @Post('document/multiple')
  @UseInterceptors(FilesInterceptor('documents', 10)) // Max 10 files
  async uploadMultipleDocuments(
    @UploadedFile() files: Express.Multer.File[],
    @Query('folder') folder?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No document files provided');
    }

    const documentUrls = await this.fileUploadService.uploadMultipleDocuments(files, folder);
    
    return {
      success: true,
      message: `${files.length} documents uploaded successfully`,
      data: {
        documentUrls,
        documentKeys: documentUrls, // Keep for backward compatibility
        count: files.length,
        files: files.map(file => ({
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
        })),
      },
    };
  }

  @Delete('document')
  async deleteDocument(@Body('documentKey') documentKey: string) {
    if (!documentKey) {
      throw new BadRequestException('Document key is required');
    }

    await this.fileUploadService.deleteDocument(documentKey);
    
    return {
      success: true,
      message: 'Document deleted successfully',
    };
  }

  @Get('document/download-url')
  async getDocumentDownloadUrl(
    @Query('key') key: string,
    @Query('expiresIn') expiresIn?: string,
  ) {
    if (!key) {
      throw new BadRequestException('Key is required');
    }

    const expires = expiresIn ? parseInt(expiresIn) : 3600;
    const downloadUrl = await this.fileUploadService.generateDocumentDownloadUrl(key, expires);
    
    return {
      success: true,
      data: {
        downloadUrl,
        key,
        expiresIn: expires,
      },
    };
  }
}
