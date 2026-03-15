const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function testConnection() {
  console.log('Testing connection with URL:', process.env.DATABASE_URL);
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    // Adding more logging to catch issues
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('Attempting to connect...');
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('Connection successful! SELECT 1 returned:', result);
    
    const count = await prisma.user.count();
    console.log('User count:', count);
    
  } catch (error) {
    console.error('Connection failed with the following error:');
    console.dir(error, { depth: null });
    
    if (error.code) console.log('Error Code:', error.code);
    if (error.meta) console.log('Error Metadata:', error.meta);
  } finally {
    await prisma.$disconnect();
    console.log('Disconnected.');
  }
}

testConnection();
