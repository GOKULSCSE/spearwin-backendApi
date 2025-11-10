import { PrismaClient } from '@prisma/client';
import { generateCompanyId } from '../src/company/utils/company-uuid.util';

const prisma = new PrismaClient();

async function backfillCompanyIds() {
  try {
    console.log('Starting companyId backfill...');

    // Get all companies and filter those without companyId
    const allCompanies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        companyId: true,
      },
    });

    // Filter companies without companyId
    const companiesWithoutId = allCompanies.filter(
      (c) => !c.companyId || c.companyId.trim() === ''
    );

    console.log(`Found ${companiesWithoutId.length} companies without companyId`);

    if (companiesWithoutId.length === 0) {
      console.log('All companies already have companyId. Exiting.');
      return;
    }

    // Get all existing companyIds to avoid duplicates (reuse the query from above)
    const existingCompanyIds = allCompanies
      .map(c => c.companyId)
      .filter((id): id is string => id !== null && id !== undefined && id.trim() !== '');

    console.log(`Existing companyIds: ${existingCompanyIds.length}`);

    // Update each company
    for (const company of companiesWithoutId) {
      try {
        // Generate a new companyId
        const newCompanyId = generateCompanyId(company.name, existingCompanyIds);
        
        // Check if it already exists (race condition protection)
        const exists = await prisma.company.findUnique({
          where: { companyId: newCompanyId },
        });

        if (exists) {
          console.log(`CompanyId ${newCompanyId} already exists, skipping ${company.name}`);
          continue;
        }

        // Update the company
        await prisma.company.update({
          where: { id: company.id },
          data: { companyId: newCompanyId },
        });

        console.log(`Updated ${company.name} with companyId: ${newCompanyId}`);
        
        // Add to existing list for next iteration
        existingCompanyIds.push(newCompanyId);
      } catch (error) {
        console.error(`Error updating company ${company.name}:`, error);
      }
    }

    console.log('CompanyId backfill completed!');
  } catch (error) {
    console.error('Error during backfill:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

backfillCompanyIds()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

