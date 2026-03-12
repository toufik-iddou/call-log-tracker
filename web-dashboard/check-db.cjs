const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function check() {
  try {
    const res = await prisma.$queryRaw`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'AgentSession')`;
    console.log('Table AgentSession exists:', res);
  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}
check();
