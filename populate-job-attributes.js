const { PrismaClient } = require('@prisma/client');

async function populateJobAttributes() {
  const db = new PrismaClient();

  try {
    console.log('🚀 Populating Job Attributes...');

    // Language Levels
    await db.jobAttribute.createMany({
      data: [
        { name: 'Beginner', category: 'LANGUAGE_LEVEL', sortOrder: 1 },
        { name: 'Intermediate', category: 'LANGUAGE_LEVEL', sortOrder: 2 },
        { name: 'Advanced', category: 'LANGUAGE_LEVEL', sortOrder: 3 },
        { name: 'Native Speaker', category: 'LANGUAGE_LEVEL', sortOrder: 4 },
      ],
    });

    // Career Levels
    await db.jobAttribute.createMany({
      data: [
        { name: 'High School / Secondary', category: 'CAREER_LEVEL', sortOrder: 1 },
        { name: 'Diploma / Certification', category: 'CAREER_LEVEL', sortOrder: 2 },
        { name: 'Bachelor\'s Degree', category: 'CAREER_LEVEL', sortOrder: 3 },
        { name: 'Master\'s Degree', category: 'CAREER_LEVEL', sortOrder: 4 },
      ],
    });

    // Functional Areas
    await db.jobAttribute.createMany({
      data: [
        { name: 'Software Development', category: 'FUNCTIONAL_AREA', sortOrder: 1 },
        { name: 'UI/UX & Design', category: 'FUNCTIONAL_AREA', sortOrder: 2 },
        { name: 'Banking & Insurance', category: 'FUNCTIONAL_AREA', sortOrder: 3 },
        { name: 'Education & Training', category: 'FUNCTIONAL_AREA', sortOrder: 4 },
      ],
    });

    // Genders
    await db.jobAttribute.createMany({
      data: [
        { name: 'Male', category: 'GENDER', sortOrder: 1 },
        { name: 'Female', category: 'GENDER', sortOrder: 2 },
        { name: 'Transgender', category: 'GENDER', sortOrder: 3 },
        { name: 'Non-Binary', category: 'GENDER', sortOrder: 4 },
      ],
    });

    // Industries
    await db.jobAttribute.createMany({
      data: [
        { name: 'IT', category: 'INDUSTRY', sortOrder: 1 },
        { name: 'Banking', category: 'INDUSTRY', sortOrder: 2 },
        { name: 'Manufacturing', category: 'INDUSTRY', sortOrder: 3 },
        { name: 'Healthcare', category: 'INDUSTRY', sortOrder: 4 },
      ],
    });

    // Job Experience
    await db.jobAttribute.createMany({
      data: [
        { name: 'Fresher / Entry', category: 'JOB_EXPERIENCE', sortOrder: 1 },
        { name: '0-1 Year', category: 'JOB_EXPERIENCE', sortOrder: 2 },
        { name: '1-3 Years', category: 'JOB_EXPERIENCE', sortOrder: 3 },
        { name: '3-5 Years', category: 'JOB_EXPERIENCE', sortOrder: 4 },
      ],
    });

    // Job Skills
    await db.jobAttribute.createMany({
      data: [
        { name: 'Project Management', category: 'JOB_SKILL', sortOrder: 1 },
        { name: 'React.js', category: 'JOB_SKILL', sortOrder: 2 },
        { name: 'UI/UX & Design', category: 'JOB_SKILL', sortOrder: 3 },
        { name: 'Digital Marketing', category: 'JOB_SKILL', sortOrder: 4 },
      ],
    });

    // Job Types
    await db.jobAttribute.createMany({
      data: [
        { name: 'Full-Time', category: 'JOB_TYPE', sortOrder: 1 },
        { name: 'Part-Time', category: 'JOB_TYPE', sortOrder: 2 },
        { name: 'Contract', category: 'JOB_TYPE', sortOrder: 3 },
        { name: 'Internship', category: 'JOB_TYPE', sortOrder: 4 },
      ],
    });

    // Job Shifts
    await db.jobAttribute.createMany({
      data: [
        { name: 'Day Shift', category: 'JOB_SHIFT', sortOrder: 1 },
        { name: 'Night Shift', category: 'JOB_SHIFT', sortOrder: 2 },
        { name: 'Flexible', category: 'JOB_SHIFT', sortOrder: 3 },
        { name: 'Rotating', category: 'JOB_SHIFT', sortOrder: 4 },
      ],
    });

    // Degree Levels
    await db.jobAttribute.createMany({
      data: [
        { name: 'High School / Secondary', category: 'DEGREE_LEVEL', sortOrder: 1 },
        { name: 'Diploma / Certification', category: 'DEGREE_LEVEL', sortOrder: 2 },
        { name: 'Bachelor\'s Degree', category: 'DEGREE_LEVEL', sortOrder: 3 },
        { name: 'Master\'s Degree', category: 'DEGREE_LEVEL', sortOrder: 4 },
      ],
    });

    // Degree Types
    await db.jobAttribute.createMany({
      data: [
        { name: 'Arts & Science', category: 'DEGREE_TYPE', sortOrder: 1 },
        { name: 'Engineering', category: 'DEGREE_TYPE', sortOrder: 2 },
        { name: 'Medicine', category: 'DEGREE_TYPE', sortOrder: 3 },
        { name: 'Agriculture', category: 'DEGREE_TYPE', sortOrder: 4 },
      ],
    });

    // Major Subjects
    await db.jobAttribute.createMany({
      data: [
        { name: 'Computer Science', category: 'MAJOR_SUBJECT', sortOrder: 1 },
        { name: 'Electronics', category: 'MAJOR_SUBJECT', sortOrder: 2 },
        { name: 'Mechanical Engineering', category: 'MAJOR_SUBJECT', sortOrder: 3 },
        { name: 'Nursing', category: 'MAJOR_SUBJECT', sortOrder: 4 },
      ],
    });

    console.log('✅ Job attributes populated successfully!');
    
    // Show summary
    const total = await db.jobAttribute.count();
    console.log(`📊 Total attributes created: ${total}`);
    
    const byCategory = await db.jobAttribute.groupBy({
      by: ['category'],
      _count: { id: true }
    });
    
    console.log('📋 Attributes by category:');
    byCategory.forEach(cat => {
      console.log(`  ${cat.category}: ${cat._count.id} attributes`);
    });

  } catch (error) {
    console.error('❌ Error populating job attributes:', error);
  } finally {
    await db.$disconnect();
  }
}

populateJobAttributes();
