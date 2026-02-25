import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const adminUsername = 'admin';
    const adminPassword = 'adminpassword';

    const existingUser = await prisma.user.findUnique({
        where: { username: adminUsername },
    });

    if (!existingUser) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const user = await prisma.user.create({
            data: {
                username: adminUsername,
                password: hashedPassword,
            },
        });
        console.log(`Created admin user with ID: ${user.id} and username: ${user.username}`);
    } else {
        console.log('Admin user already exists.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
