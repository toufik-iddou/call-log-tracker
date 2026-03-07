const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteDuplicates() {
    console.log("Analyzing call logs for duplicates...");

    // Fetch all logs ordered by timestamp
    const allLogs = await prisma.callLog.findMany({
        orderBy: { timestamp: 'asc' },
    });

    console.log(`Found ${allLogs.length} total logs.`);

    const logsToDelete = [];
    const keepLogs = new Set();

    // A naive but effective duplicate detection based on our +/- 10s rule
    for (const log of allLogs) {
        let isDuplicate = false;

        // Check if we already have a similar log we're keeping
        for (const keptId of keepLogs) {
            const keptLog = allLogs.find(l => l.id === keptId);
            if (!keptLog) continue;

            if (
                log.phoneNumber === keptLog.phoneNumber &&
                log.type === keptLog.type &&
                log.agentId === keptLog.agentId
            ) {
                // Check timestamp proximity (15000ms just to be safe)
                const diffMs = Math.abs(log.timestamp.getTime() - keptLog.timestamp.getTime());
                if (diffMs <= 15000) {
                    isDuplicate = true;
                    break;
                }
            }
        }

        if (isDuplicate) {
            logsToDelete.push(log.id);
        } else {
            keepLogs.add(log.id);
        }
    }

    if (logsToDelete.length === 0) {
        console.log("No duplicates found!");
        process.exit(0);
    }

    console.log(`Found ${logsToDelete.length} duplicates. Deleting them now...`);

    const result = await prisma.callLog.deleteMany({
        where: {
            id: {
                in: logsToDelete
            }
        }
    });

    console.log(`Successfully deleted ${result.count} duplicate logs!`);
    process.exit(0);
}

deleteDuplicates().catch(e => {
    console.error(e);
    process.exit(1);
});
