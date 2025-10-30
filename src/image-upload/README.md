# File Upload Module

This module provides file upload functionality using Digital Ocean Spaces (S3-compatible storage). It supports both image and document uploads.

## Features

### Image Upload
- Single image upload
- Multiple image upload (up to 10 files)
- Image deletion
- Presigned URL generation for direct uploads
- File type validation (JPEG, PNG, GIF, WebP)
- File size validation (5MB limit)
- Automatic file naming with UUID
- Public read access for uploaded images

### Document Upload
- Single document upload
- Multiple document upload (up to 10 files)
- Document deletion
- Presigned download URL generation
- File type validation (PDF, DOC, DOCX, TXT)
- File size validation (10MB limit)
- Automatic file naming with UUID
- Private access for uploaded documents

## Environment Variables

Add the following variables to your `.env` file:

```env
DO_SPACES_ENDPOINT=https://spearwin.sfo3.digitaloceanspaces.com
DO_SPACES_BUCKET_NAME=spearwin
DO_SPACES_REGION=sfo3
DO_SPACES_ACCESS_KEY=DO00VHTAXGT38B43BUKK
DO_SPACES_SECRET_KEY=NdRv04O4aeX36kGOLgQLfrNvd6IU4o27e6shA8l2dic
```

## API Endpoints

All endpoints require JWT authentication.

### Image Upload Endpoints

#### Upload Single Image

**POST** `/file-upload/single`

- **Content-Type**: `multipart/form-data`
- **Body**: 
  - `image`: File (required)
  - `folder`: Query parameter (optional, defaults to 'images')

**Response**:
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "imageUrl": "https://spearwin.sfo3.digitaloceanspaces.com/images/uuid.jpg",
    "originalName": "photo.jpg",
    "size": 1024000,
    "mimeType": "image/jpeg"
  }
}
```

#### Upload Multiple Images

**POST** `/file-upload/multiple`

- **Content-Type**: `multipart/form-data`
- **Body**: 
  - `images`: File[] (required, max 10 files)
  - `folder`: Query parameter (optional, defaults to 'images')

**Response**:
```json
{
  "success": true,
  "message": "3 images uploaded successfully",
  "data": {
    "imageUrls": [
      "https://spearwin.sfo3.digitaloceanspaces.com/images/uuid1.jpg",
      "https://spearwin.sfo3.digitaloceanspaces.com/images/uuid2.png"
    ],
    "count": 2,
    "files": [
      {
        "originalName": "photo1.jpg",
        "size": 1024000,
        "mimeType": "image/jpeg"
      }
    ]
  }
}
```

#### Delete Image

**DELETE** `/file-upload`

- **Body**:
```json
{
  "imageUrl": "https://spearwin.sfo3.digitaloceanspaces.com/images/uuid.jpg"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

#### Generate Presigned URL

**GET** `/file-upload/presigned-url?key=path/to/file.jpg&expiresIn=3600`

- **Query Parameters**:
  - `key`: File path/key (required)
  - `expiresIn`: Expiration time in seconds (optional, default: 3600)

**Response**:
```json
{
  "success": true,
  "data": {
    "presignedUrl": "https://spearwin.sfo3.digitaloceanspaces.com/path/to/file.jpg?...",
    "key": "path/to/file.jpg",
    "expiresIn": 3600
  }
}
```

#### Get Image URL

**GET** `/file-upload/url/:key`

- **Path Parameters**:
  - `key`: File path/key

**Response**:
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://spearwin.sfo3.digitaloceanspaces.com/path/to/file.jpg",
    "key": "path/to/file.jpg"
  }
}
```

### Document Upload Endpoints

#### Upload Single Document

**POST** `/file-upload/document/single`

- **Content-Type**: `multipart/form-data`
- **Body**: 
  - `document`: File (required)
  - `folder`: Query parameter (optional, defaults to 'documents')

**Response**:
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "documentKey": "documents/uuid.pdf",
    "originalName": "resume.pdf",
    "size": 2048000,
    "mimeType": "application/pdf"
  }
}
```

#### Upload Multiple Documents

**POST** `/file-upload/document/multiple`

- **Content-Type**: `multipart/form-data`
- **Body**: 
  - `documents`: File[] (required, max 10 files)
  - `folder`: Query parameter (optional, defaults to 'documents')

**Response**:
```json
{
  "success": true,
  "message": "2 documents uploaded successfully",
  "data": {
    "documentKeys": [
      "documents/uuid1.pdf",
      "documents/uuid2.docx"
    ],
    "count": 2,
    "files": [
      {
        "originalName": "resume.pdf",
        "size": 2048000,
        "mimeType": "application/pdf"
      }
    ]
  }
}
```

#### Delete Document

**DELETE** `/file-upload/document`

- **Body**:
```json
{
  "documentKey": "documents/uuid.pdf"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

#### Generate Document Download URL

**GET** `/file-upload/document/download-url?key=documents/uuid.pdf&expiresIn=3600`

- **Query Parameters**:
  - `key`: Document path/key (required)
  - `expiresIn`: Expiration time in seconds (optional, default: 3600)

**Response**:
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://spearwin.sfo3.digitaloceanspaces.com/documents/uuid.pdf?...",
    "key": "documents/uuid.pdf",
    "expiresIn": 3600
  }
}
```

## Usage in Other Services

```typescript
import { FileUploadService } from './image-upload/file-upload.service';

@Injectable()
export class YourService {
  constructor(private fileUploadService: FileUploadService) {}

  async uploadUserAvatar(file: Express.Multer.File) {
    return await this.fileUploadService.uploadImage(file, 'avatars');
  }

  async deleteUserAvatar(imageUrl: string) {
    return await this.fileUploadService.deleteImage(imageUrl);
  }

  async uploadResume(file: Express.Multer.File) {
    return await this.fileUploadService.uploadDocument(file, 'resumes');
  }

  async deleteResume(documentKey: string) {
    return await this.fileUploadService.deleteDocument(documentKey);
  }

  async getResumeDownloadUrl(documentKey: string) {
    return await this.fileUploadService.generateDocumentDownloadUrl(documentKey);
  }
}
```

## File Organization

Uploaded files are organized in folders:
- **Images**: Default folder `images/` (public access)
- **Documents**: Default folder `documents/` (private access)
- Custom folders can be specified via the `folder` parameter
- Files are automatically renamed with UUID to prevent conflicts

## Usage Examples

### Upload Single Image
```bash
curl -X POST http://localhost:5000/file-upload/single \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  -F "folder=user-avatars"
```

### Upload Single Document
```bash
curl -X POST http://localhost:5000/file-upload/document/single \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "document=@/path/to/resume.pdf" \
  -F "folder=resumes"
```

### Upload Multiple Documents
```bash
curl -X POST http://localhost:5000/file-upload/document/multiple \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "documents=@/path/to/resume1.pdf" \
  -F "documents=@/path/to/resume2.docx" \
  -F "folder=job-applications"
```

### Get Document Download URL
```bash
curl -X GET "http://localhost:5000/file-upload/document/download-url?key=documents/uuid.pdf&expiresIn=3600" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Error Handling

The module includes comprehensive error handling for:
- Invalid file types
- File size limits
- Upload failures
- Delete failures
- Missing parameters

All errors return appropriate HTTP status codes and error messages.
