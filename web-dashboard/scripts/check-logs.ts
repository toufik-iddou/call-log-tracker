import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const logs = await prisma.callLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { agent: true }
    });
    console.log(JSON.stringify(logs, null, 2));
}

main().finally(() => prisma.$disconnect());
