import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UploadImageDto {
  @IsOptional()
  @IsString()
  folder?: string;
}

export class UploadDocumentDto {
  @IsOptional()
  @IsString()
  folder?: string;
}

export class DeleteImageDto {
  @IsString()
  imageUrl: string;
}

export class DeleteDocumentDto {
  @IsString()
  documentKey: string;
}

export class PresignedUrlDto {
  @IsString()
  key: string;

  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(3600)
  expiresIn?: number;
}

export class DocumentDownloadUrlDto {
  @IsString()
  key: string;

  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(3600)
  expiresIn?: number;
}
