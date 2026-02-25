import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.error('Usage: npm run add-agent <username> <password>');
    process.exit(1);
  }

  const [username, password] = args;

  try {
    const existingAgent = await prisma.user.findUnique({
      where: { username },
    });

    if (existingAgent) {
      console.error(`Agent with username "${username}" already exists.`);
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAgent = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    console.log(`Agent added successfully!`);
    console.log(`ID: ${newAgent.id}`);
    console.log(`Username: ${newAgent.username}`);
  } catch (error) {
    console.error('Error adding agent:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
