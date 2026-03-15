const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function testLogin() {
  const prisma = new PrismaClient();
  try {
    console.log('Searching for users...');
    const users = await prisma.user.findMany({ select: { username: true } });
    console.log('Available users:', users.map(u => u.username));
    
    if (users.length > 0) {
      console.log('Testing update on user:', users[0].username);
      await prisma.user.update({
        where: { username: users[0].username },
        data: { lastSeen: new Date() }
      });
      console.log('Update successful!');
    } else {
      console.log('No users found to test update.');
    }
  } catch (error) {
    console.error('Prisma Operation Failed:');
    console.dir(error, { depth: null });
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
