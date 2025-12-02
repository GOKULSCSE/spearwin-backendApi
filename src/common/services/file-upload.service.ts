import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// @ts-ignore - aws-sdk types may not be available
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

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
export class FileUploadService {
  private s3: AWS.S3;

  constructor(private configService: ConfigService) {
    // Configure AWS SDK for DigitalOcean Spaces using environment variables
    this.s3 = new AWS.S3({
      endpoint: this.configService.get('DO_SPACES_ENDPOINT'),
      accessKeyId: this.configService.get('DO_SPACES_ACCESS_KEY'),
      secretAccessKey: this.configService.get('DO_SPACES_SECRET_KEY'),
      region: this.configService.get('DO_SPACES_REGION'),
      s3ForcePathStyle: false,
    });
  }

  async uploadFile(
    file: MulterFile,
    folder: string = 'uploads',
  ): Promise<{ url: string; key: string }> {
    try {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const key = `${folder}/${fileName}`;

      const uploadParams = {
        Bucket: this.configService.get('DO_SPACES_BUCKET'),
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      };

      const result = await this.s3.upload(uploadParams).promise();
      
      return {
        url: result.Location,
        key: key,
      };
    } catch (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  async uploadMultipleFiles(
    files: MulterFile[],
    folder: string = 'uploads',
  ): Promise<{ url: string; key: string }[]> {
    try {
      const uploadPromises = files.map(file => this.uploadFile(file, folder));
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new Error(`Multiple file upload failed: ${error.message}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const bucket = this.configService.get('DO_SPACES_BUCKET');
      if (!bucket) {
        throw new Error('DO_SPACES_BUCKET is not configured');
      }
      
      await this.s3.deleteObject({
        Bucket: bucket,
        Key: key,
      }).promise();
    } catch (error) {
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  async deleteMultipleFiles(keys: string[]): Promise<void> {
    try {
      const deletePromises = keys.map(key => this.deleteFile(key));
      await Promise.all(deletePromises);
    } catch (error) {
      throw new Error(`Multiple file deletion failed: ${error.message}`);
    }
  }
}
