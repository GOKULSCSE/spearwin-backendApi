-- Migration: Add profile_pictures table
-- Date: 2025-11-03
-- Description: Creates a new profile_pictures table similar to resumes table

CREATE TABLE IF NOT EXISTS "profile_pictures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Profile Picture',
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "profile_pictures_candidateId_fkey" 
        FOREIGN KEY ("candidateId") 
        REFERENCES "candidates"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS "profile_pictures_candidateId_idx" ON "profile_pictures"("candidateId");
CREATE INDEX IF NOT EXISTS "profile_pictures_isDefault_idx" ON "profile_pictures"("isDefault");

-- Comment on table
COMMENT ON TABLE "profile_pictures" IS 'Stores candidate profile pictures with metadata, similar to resumes table';

