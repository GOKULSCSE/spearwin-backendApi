-- CreateTable
CREATE TABLE "public"."job_alerts" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "keywords" TEXT,
    "location" TEXT,
    "skills" TEXT[],
    "jobType" TEXT,
    "experienceLevel" TEXT,
    "company" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "frequency" TEXT NOT NULL DEFAULT 'WEEKLY',
    "lastSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_alerts_candidateId_isActive_idx" ON "public"."job_alerts"("candidateId", "isActive");

-- CreateIndex
CREATE INDEX "job_alerts_frequency_isActive_idx" ON "public"."job_alerts"("frequency", "isActive");

-- AddForeignKey
ALTER TABLE "public"."job_alerts" ADD CONSTRAINT "job_alerts_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "public"."candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
