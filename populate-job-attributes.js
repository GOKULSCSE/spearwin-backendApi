const { PrismaClient } = require('@prisma/client');

async function populateJobAttributes() {
  const db = new PrismaClient();

  try {
    console.log('🚀 Populating Job Attributes...');

    // First, get all categories
    const categories = await db.jobAttributeCategory.findMany();
    
    if (categories.length === 0) {
      console.log('⚠️  No categories found! Please run initialize-job-attributes.js first.');
      return;
    }

    // Create a map of category name to category ID
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    console.log('📋 Found categories:', Object.keys(categoryMap));

    // Define attributes for each category
    const attributesData = {
      LANGUAGE_LEVEL: [
        'Beginner',
        'Intermediate',
        'Advanced',
        'Native Speaker'
      ],
      CAREER_LEVEL: [
        'Entry Level',
        'Mid Level',
        'Senior Level',
        'Executive Level'
      ],
      FUNCTIONAL_AREA: [
        'Software Development',
        'UI/UX & Design',
        'Banking & Insurance',
        'Education & Training',
        'Sales & Marketing',
        'Human Resources'
      ],
      GENDER: [
        'Male',
        'Female',
        'Transgender',
        'Non-Binary',
        'Prefer not to say'
      ],
      INDUSTRY: [
        'Information Technology',
        'Banking & Finance',
        'Manufacturing',
        'Healthcare',
        'Education',
        'Retail'
      ],
      JOB_EXPERIENCE: [
        'Fresher (0 years)',
        '0-1 Year',
        '1-3 Years',
        '3-5 Years',
        '5-10 Years',
        '10+ Years'
      ],
      JOB_SKILL: [
        'JavaScript',
        'React.js',
        'Node.js',
        'Python',
        'Java',
        'UI/UX Design',
        'Project Management',
        'Digital Marketing',
        'Data Analysis',
        'Communication'
      ],
      JOB_TYPE: [
        'Full-Time',
        'Part-Time',
        'Contract',
        'Internship',
        'Freelance'
      ],
      JOB_SHIFT: [
        'Day Shift',
        'Night Shift',
        'Flexible',
        'Rotating',
        'Weekend'
      ],
      DEGREE_LEVEL: [
        'High School',
        'Diploma',
        'Bachelor\'s Degree',
        'Master\'s Degree',
        'Doctorate (PhD)',
        'Professional Degree'
      ],
      DEGREE_TYPE: [
        'Arts & Science',
        'Engineering',
        'Medicine',
        'Agriculture',
        'Business Administration',
        'Law'
      ],
      MAJOR_SUBJECT: [
        'Computer Science',
        'Electronics',
        'Mechanical Engineering',
        'Civil Engineering',
        'Nursing',
        'Business Administration',
        'Accounting',
        'Marketing'
      ]
    };

    let totalCreated = 0;

    // Create attributes for each category
    for (const [categoryName, attributes] of Object.entries(attributesData)) {
      if (!categoryMap[categoryName]) {
        console.log(`⚠️  Category ${categoryName} not found, skipping...`);
        continue;
      }

      console.log(`\n➡️  Adding attributes for ${categoryName}...`);
      
      for (let i = 0; i < attributes.length; i++) {
        try {
          // Check if attribute already exists
          const existing = await db.jobAttribute.findFirst({
            where: {
              name: attributes[i],
              categoryId: categoryMap[categoryName]
            }
          });

          if (!existing) {
            await db.jobAttribute.create({
              data: {
                name: attributes[i],
                categoryId: categoryMap[categoryName],
                sortOrder: i + 1,
                isActive: true
              }
            });
            console.log(`   ✅ Created: ${attributes[i]}`);
            totalCreated++;
          } else {
            console.log(`   ⚠️  Already exists: ${attributes[i]}`);
          }
        } catch (error) {
          console.error(`   ❌ Failed to create ${attributes[i]}:`, error.message);
        }
      }
    }

    console.log('\n✅ Job attributes populated successfully!');
    console.log(`📊 Total new attributes created: ${totalCreated}`);
    
    // Show summary
    const total = await db.jobAttribute.count();
    console.log(`📊 Total attributes in database: ${total}`);
    
    console.log('\n📋 Attributes by category:');
    for (const category of categories) {
      const count = await db.jobAttribute.count({
        where: { categoryId: category.id }
      });
      console.log(`   ${category.displayName}: ${count} attributes`);
    }

  } catch (error) {
    console.error('❌ Error populating job attributes:', error);
  } finally {
    await db.$disconnect();
  }
}

populateJobAttributes();
