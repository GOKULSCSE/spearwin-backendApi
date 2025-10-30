-- Add contact information and additional fields to job_applications table
-- Run this SQL in your database management tool (pgAdmin, DBeaver, etc.)

ALTER TABLE job_applications 
  ADD COLUMN IF NOT EXISTS "fullName" TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS "experienceLevel" TEXT,
  ADD COLUMN IF NOT EXISTS "noticePeriod" TEXT,
  ADD COLUMN IF NOT EXISTS "currentCTC" TEXT,
  ADD COLUMN IF NOT EXISTS "expectedCTC" TEXT,
  ADD COLUMN IF NOT EXISTS "javaExperience" TEXT,
  ADD COLUMN IF NOT EXISTS "locationPreference" TEXT;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'job_applications' 
ORDER BY ordinal_position;

