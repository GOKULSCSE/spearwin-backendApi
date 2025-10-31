const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initializeJobAttributes() {
  try {
    console.log('🚀 Initializing job attribute categories...');

    const defaultCategories = [
      { name: 'LANGUAGE_LEVEL', displayName: 'Language Level', sortOrder: 1 },
      { name: 'CAREER_LEVEL', displayName: 'Career Level', sortOrder: 2 },
      { name: 'FUNCTIONAL_AREA', displayName: 'Functional Areas', sortOrder: 3 },
      { name: 'GENDER', displayName: 'Genders', sortOrder: 4 },
      { name: 'INDUSTRY', displayName: 'Industries', sortOrder: 5 },
      { name: 'JOB_EXPERIENCE', displayName: 'Job Experience', sortOrder: 6 },
      { name: 'JOB_SKILL', displayName: 'Job Skills', sortOrder: 7 },
      { name: 'JOB_TYPE', displayName: 'Job Types', sortOrder: 8 },
      { name: 'JOB_SHIFT', displayName: 'Job Shifts', sortOrder: 9 },
      { name: 'DEGREE_LEVEL', displayName: 'Degree Levels', sortOrder: 10 },
      { name: 'DEGREE_TYPE', displayName: 'Degree Types', sortOrder: 11 },
      { name: 'MAJOR_SUBJECT', displayName: 'Major Subjects', sortOrder: 12 }
    ];

    console.log('\n🔄 Updating category displayNames...');
    
    // Update existing categories with correct displayNames
    for (const category of defaultCategories) {
      try {
        const existing = await prisma.jobAttributeCategory.findUnique({
          where: { name: category.name }
        });

        if (existing && existing.displayName !== category.displayName) {
          await prisma.jobAttributeCategory.update({
            where: { name: category.name },
            data: { displayName: category.displayName }
          });
          console.log(`✅ Updated displayName for ${category.name}: "${existing.displayName}" → "${category.displayName}"`);
        }
      } catch (error) {
        console.error(`❌ Failed to update category ${category.name}:`, error.message);
      }
    }

    const createdCategories = [];

    for (const category of defaultCategories) {
      try {
        const existing = await prisma.jobAttributeCategory.findUnique({
          where: { name: category.name }
        });

        if (!existing) {
          const created = await prisma.jobAttributeCategory.create({
            data: category
          });
          createdCategories.push(created);
          console.log(`✅ Created category: ${category.displayName}`);
        } else {
          console.log(`⚠️  Category already exists: ${category.displayName}`);
        }
      } catch (error) {
        console.error(`❌ Failed to create category ${category.name}:`, error.message);
      }
    }

    console.log(`\n🎉 Initialization complete! Created ${createdCategories.length} new categories.`);
    console.log('\n📋 Available categories:');
    
    const allCategories = await prisma.jobAttributeCategory.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    allCategories.forEach(category => {
      console.log(`   ${category.sortOrder}. ${category.displayName} (${category.name})`);
    });

  } catch (error) {
    console.error('❌ Error during initialization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization
initializeJobAttributes();

