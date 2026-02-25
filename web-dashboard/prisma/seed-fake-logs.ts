import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const admin = await prisma.user.findUnique({
        where: { username: 'admin' }
    })

    if (!admin) {
        console.error("Admin user not found. Database might not be seeded properly.");
        return;
    }

    console.log("Seeding fake call logs for agent:", admin.username);

    const logs = await prisma.callLog.createMany({
        data: [
            {
                phoneNumber: "+1 (555) 123-4567",
                type: "INCOMING",
                duration: 124,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                agentId: admin.id
            },
            {
                phoneNumber: "+1 (555) 987-6543",
                type: "OUTGOING",
                duration: 45,
                timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
                agentId: admin.id
            },
            {
                phoneNumber: "+1 (555) 111-2222",
                type: "MISSED",
                duration: 0,
                timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
                agentId: admin.id
            },
            {
                phoneNumber: "+1 (555) 333-4444",
                type: "INCOMING",
                duration: 312,
                timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
                agentId: admin.id
            }
        ]
    })

    console.log(`Successfully seeded ${logs.count} fake call logs.`);
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
