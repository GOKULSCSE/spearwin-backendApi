import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('DO_SPACES_BUCKET_NAME') || 'spearwin';
    
    const endpoint = this.configService.get<string>('DO_SPACES_ENDPOINT');
    const region = this.configService.get<string>('DO_SPACES_REGION');
    const accessKeyId = this.configService.get<string>('DO_SPACES_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>('DO_SPACES_SECRET_KEY');

    console.log('Digital Ocean Spaces Configuration:', {
      endpoint,
      region,
      accessKeyId: accessKeyId ? '***' + accessKeyId.slice(-4) : 'NOT_SET',
      secretAccessKey: secretAccessKey ? '***' + secretAccessKey.slice(-4) : 'NOT_SET',
      bucketName: this.bucketName
    });

    if (!endpoint || !region || !accessKeyId || !secretAccessKey) {
      throw new Error('Missing required Digital Ocean Spaces configuration');
    }
    
    this.s3Client = new S3Client({
      endpoint,
      forcePathStyle: false,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'images'): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 5MB.');
    }

    return this.uploadFile(file, folder, 'public-read');
  }

  async uploadDocument(file: Express.Multer.File, folder: string = 'documents'): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    
    // Validate file type
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.');
    }

    // Validate file size (10MB limit for documents)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 10MB.');
    }

    return this.uploadFile(file, folder, 'public-read');
  }

  private async uploadFile(file: Express.Multer.File, folder: string, acl: 'public-read' | 'private'): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = `${folder}/${fileName}`;
    const region = this.configService.get<string>('DO_SPACES_REGION');

    try {
      const params: any = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          'original-name': file.originalname,
          'uploaded-at': new Date().toISOString(),
        },
      };

      // Set ACL for public files
      // Note: DigitalOcean Spaces requires bucket-level public access to be enabled
      // for object-level ACL to work. Ensure your Space is configured for public file access.
      if (acl === 'public-read') {
        params.ACL = 'public-read';
        console.log(`Uploading file as public: ${key}`);
      } else {
        params.ACL = 'private';
        console.log(`Uploading file as private: ${key}`);
      }

      await this.s3Client.send(new PutObjectCommand(params));
      
      // Construct and return the public URL for images
      if (acl === 'public-read') {
        const publicUrl = `https://${this.bucketName}.${region}.digitaloceanspaces.com/${key}`;
        console.log(`File uploaded successfully. Public URL: ${publicUrl}`);
        return publicUrl;
      } else {
        // For private files, return the key for later retrieval via presigned URL
        console.log(`Private file uploaded successfully. Key: ${key}`);
        return key;
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        statusCode: error.$metadata?.httpStatusCode,
        bucketName: this.bucketName,
        key: key,
        fileSize: file.size,
        fileType: file.mimetype,
        acl: acl
      });
      
      // If ACL error, provide helpful message
      if (error.code === 'AccessDenied' || error.message?.includes('ACL')) {
        throw new BadRequestException(
          `Failed to set file permissions. Please ensure your DigitalOcean Space bucket is configured for public access. Error: ${error.message}`
        );
      }
      
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  async uploadMultipleImages(files: Express.Multer.File[], folder: string = 'images'): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadPromises = files.map(file => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  async uploadMultipleDocuments(files: Express.Multer.File[], folder: string = 'documents'): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadPromises = files.map(file => this.uploadDocument(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteFile(fileUrlOrKey: string): Promise<void> {
    try {
      let key: string;
      
      // Check if it's a URL or a key
      if (fileUrlOrKey.startsWith('http')) {
        // Extract key from URL
        const urlParts = fileUrlOrKey.split('/');
        key = urlParts.slice(3).join('/'); // Remove domain parts
      } else {
        // It's already a key
        key = fileUrlOrKey;
      }

      const params = {
        Bucket: this.bucketName,
        Key: key,
      };

      await this.s3Client.send(new DeleteObjectCommand(params));
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new BadRequestException('Failed to delete file');
    }
  }

  // Alias for backward compatibility
  async deleteImage(imageUrl: string): Promise<void> {
    return this.deleteFile(imageUrl);
  }

  async deleteDocument(documentKey: string): Promise<void> {
    return this.deleteFile(documentKey);
  }

  async generatePresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new BadRequestException('Failed to generate presigned URL');
    }
  }

  async getImageUrl(key: string): Promise<string> {
    return `https://${this.bucketName}.${this.configService.get<string>('DO_SPACES_REGION')}.digitaloceanspaces.com/${key}`;
  }

  async generateDocumentDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating document download URL:', error);
      throw new BadRequestException('Failed to generate document download URL');
    }
  }
}
