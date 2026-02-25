import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const result = await prisma.callLog.deleteMany({
        where: {
            id: { gt: 1 }
        }
    })
    console.log(`Deleted ${result.count} fake call logs.`);
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
