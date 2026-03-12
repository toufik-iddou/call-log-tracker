const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function count() {
  try {
    const userCount = await prisma.user.count();
    const sessionCount = await prisma.agentSession.count();
    const recentSessions = await prisma.agentSession.findMany({ take: 5, orderBy: { startTime: 'desc' } });
    console.log('Results:', { userCount, sessionCount, recentSessions });
  } catch (err) {
    console.error('Fetch failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}
count();
