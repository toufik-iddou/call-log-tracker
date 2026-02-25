import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const logs = await prisma.callLog.findMany({
        orderBy: { createdAt: 'desc' }
    })
    console.log("ALL CALL LOGS IN DATABASE:")
    logs.forEach(log => {
        console.log(`[${log.createdAt.toISOString()}] Number: ${log.phoneNumber}, Type: ${log.type}, Duration: ${log.duration}s`)
    })
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
