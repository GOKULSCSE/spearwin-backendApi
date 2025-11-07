const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    const email = 'webnoxbackend@gmail.com';
    const password = '12345678';

    console.log('🚀 Starting super admin creation process...');
    console.log(`📧 Email: ${email}`);

    // Step 1: Find all existing super admins
    console.log('\n📋 Finding all existing super admins...');
    const existingSuperAdmins = await prisma.user.findMany({
      where: {
        role: 'SUPER_ADMIN',
      },
      include: {
        superAdmin: true,
      },
    });

    console.log(`Found ${existingSuperAdmins.length} existing super admin(s)`);

    // Step 2: Delete all existing super admins
    if (existingSuperAdmins.length > 0) {
      console.log('\n🗑️  Deleting existing super admins...');
      for (const user of existingSuperAdmins) {
        console.log(`   Deleting: ${user.email} (ID: ${user.id})`);
        // Delete the user (SuperAdmin will be cascade deleted)
        await prisma.user.delete({
          where: { id: user.id },
        });
      }
      console.log('✅ All existing super admins deleted');
    }

    // Step 3: Check if the new email already exists
    console.log('\n🔍 Checking if email already exists...');
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`⚠️  User with email ${email} already exists. Deleting...`);
      await prisma.user.delete({
        where: { id: existingUser.id },
      });
      console.log('✅ Existing user deleted');
    }

    // Step 4: Hash password
    console.log('\n🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed');

    // Step 5: Create new super admin
    console.log('\n👤 Creating new super admin...');
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: email,
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          emailVerified: true,
          phoneVerified: false,
          profileCompleted: true,
          twoFactorEnabled: false,
        },
      });

      console.log(`   ✅ User created: ${user.id}`);

      // Create SuperAdmin profile
      const superAdmin = await tx.superAdmin.create({
        data: {
          userId: user.id,
          email: email,
          firstName: 'Super',
          lastName: 'Admin',
          permissions: [],
        },
      });

      console.log(`   ✅ SuperAdmin profile created: ${superAdmin.id}`);

      return { user, superAdmin };
    });

    console.log('\n✅ Super admin created successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Email: ${result.user.email}`);
    console.log(`   User ID: ${result.user.id}`);
    console.log(`   SuperAdmin ID: ${result.superAdmin.id}`);
    console.log(`   Role: ${result.user.role}`);
    console.log(`   Status: ${result.user.status}`);
    console.log('\n🎉 Process completed successfully!');

  } catch (error) {
    console.error('\n❌ Error creating super admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createSuperAdmin()
  .then(() => {
    console.log('\n✨ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });

