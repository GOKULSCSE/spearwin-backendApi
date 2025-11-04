-- Add social media URL fields to candidates table
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS "facebookUrl" TEXT,
ADD COLUMN IF NOT EXISTS "twitterUrl" TEXT,
ADD COLUMN IF NOT EXISTS "instagramUrl" TEXT;

