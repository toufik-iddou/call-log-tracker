const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedLogs() {
    const users = await prisma.user.findMany();

    if (users.length === 0) {
        console.log("No users found to attach logs to.");
        return;
    }

    const agentId = users[0].id;
    const types = ['INCOMING', 'OUTGOING', 'MISSED'];

    console.log(`Seeding 60 fake call logs for agent ${agentId} to test pagination...`);

    for (let i = 0; i < 60; i++) {
        const randomType = types[Math.floor(Math.random() * types.length)];
        const randomDuration = Math.floor(Math.random() * 300); // Up to 5 minutes

        // Spread dates back over the last few days
        let date = new Date();
        date.setHours(date.getHours() - i);

        await prisma.callLog.create({
            data: {
                phoneNumber: `+1555${String(Math.floor(Math.random() * 90000) + 10000)}`,
                type: randomType,
                duration: randomDuration,
                timestamp: date,
                agentId: agentId,
            }
        });
    }

    console.log("Successfully seeded 60 logs!");
    process.exit(0);
}

seedLogs().catch(e => {
    console.error(e);
    process.exit(1);
});
