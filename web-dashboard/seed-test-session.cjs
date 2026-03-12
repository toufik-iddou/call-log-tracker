const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestSession() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No users found');
      return;
    }
    console.log(`Creating test session for user: ${user.username} (${user.id})`);
    
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    
    await prisma.agentSession.create({
      data: {
        agentId: user.id,
        startTime: oneHourAgo,
        endTime: now
      }
    });
    console.log('Test session created successfully');
  } catch (err) {
    console.error('Failed to create test session:', err);
  } finally {
    await prisma.$disconnect();
  }
}
createTestSession();
