// Seed file placeholder — will be populated when workspace/goal features are built
import prisma from '../src/config/db.js';

async function main() {
  console.log('🌱 Seeding database...');

  // Seed data will be added as features are built
  console.log('✅ Seeding complete');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
