const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const username = process.argv[2];
    if (!username) {
        console.error('Please provide a username, e.g., node promote-admin.cjs your_username');
        process.exit(1);
    }

    try {
        const user = await prisma.user.update({
            where: { username },
            data: { role: 'ADMIN' },
        });
        console.log(`Success! ${user.username} is now an ADMIN.`);
    } catch (err) {
        if (err.code === 'P2025') {
            console.error(`Error: User "${username}" not found.`);
        } else {
            console.error('An unexpected error occurred:', err.message);
        }
        process.exit(1);
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
