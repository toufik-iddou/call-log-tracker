const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function check() {
  try {
    const users = await prisma.user.findMany({
      select: { username: true, lastSeen: true },
      orderBy: { lastSeen: 'desc' },
      take: 10
    });
    console.log('User status snapshot:', JSON.stringify(users, null, 2));
    
    const sessionCount = await prisma.agentSession.count();
    console.log('Total AgentSessions in DB:', sessionCount);
  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}
check();
