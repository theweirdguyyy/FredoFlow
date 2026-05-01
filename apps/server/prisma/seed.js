import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Demo1234!', 10);

  console.log('🌱 Seeding database...');

  // 1. Create Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@fredoflow.com' },
    update: {},
    create: {
      email: 'demo@fredoflow.com',
      passwordHash: hashedPassword,
      name: 'Demo User',
    },
  });

  // 2. Create Workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'fredoflow-demo' },
    update: {},
    create: {
      name: 'FredoFlow Demo',
      slug: 'fredoflow-demo',
      accentColor: '#6366f1',
      ownerId: demoUser.id,
      members: {
        create: {
          userId: demoUser.id,
          role: 'ADMIN',
        },
      },
    },
  });

  // 3. Create Goals & Milestones
  const goal1 = await prisma.goal.create({
    data: {
      workspaceId: workspace.id,
      ownerId: demoUser.id,
      title: 'Q2 Product Roadmap',
      status: 'IN_PROGRESS',
      milestones: {
        create: [
          { title: 'Core UI Design', progress: 100, completed: true },
          { title: 'API Integration', progress: 40, completed: false },
        ],
      },
    },
  });

  const goal2 = await prisma.goal.create({
    data: {
      workspaceId: workspace.id,
      ownerId: demoUser.id,
      title: 'Marketing Strategy',
      status: 'NOT_STARTED',
      milestones: {
        create: [
          { title: 'Market Research', progress: 0, completed: false },
          { title: 'Content Plan', progress: 0, completed: false },
        ],
      },
    },
  });

  const goal3 = await prisma.goal.create({
    data: {
      workspaceId: workspace.id,
      ownerId: demoUser.id,
      title: 'Customer Onboarding',
      status: 'COMPLETED',
      milestones: {
        create: [
          { title: 'Setup Portal', progress: 100, completed: true },
          { title: 'Email Sequence', progress: 100, completed: true },
        ],
      },
    },
  });

  // 4. Create Announcement
  await prisma.announcement.create({
    data: {
      workspaceId: workspace.id,
      authorId: demoUser.id,
      title: 'Welcome to the Demo!',
      content: 'This workspace is populated with sample data to showcase FredoFlow features.',
      isPinned: true,
    },
  });

  // 5. Create Action Items
  const actions = [
    { title: 'Fix login bug', status: 'TODO', priority: 'HIGH', position: 1000 },
    { title: 'Update docs', status: 'TODO', priority: 'MEDIUM', position: 2000 },
    { title: 'Implement search', status: 'IN_PROGRESS', priority: 'HIGH', position: 1000 },
    { title: 'Refactor styles', status: 'IN_REVIEW', priority: 'LOW', position: 1000 },
    { title: 'Deploy v1.0', status: 'DONE', priority: 'HIGH', position: 1000 },
    { title: 'Initial setup', status: 'DONE', priority: 'MEDIUM', position: 2000 },
  ];

  for (const action of actions) {
    await prisma.actionItem.create({
      data: {
        workspaceId: workspace.id,
        creatorId: demoUser.id,
        assigneeId: demoUser.id,
        ...action,
      },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('📧 Demo Email: demo@fredoflow.com');
  console.log('🔑 Demo Password: Demo1234!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
