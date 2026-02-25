import { PrismaClient } from '@prisma/client';
import { signToken } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findFirst();
        if (!user) {
            console.error('No users found to test with.');
            process.exit(1);
        }

        const token = signToken(user.id);

        const logsBatch = [
            {
                phoneNumber: '+1234567890',
                type: 'OUTGOING',
                duration: 45,
                timestamp: new Date(Date.now() - 1000000).toISOString()
            },
            {
                phoneNumber: '+0987654321',
                type: 'MISSED',
                duration: 0,
                timestamp: new Date(Date.now() - 500000).toISOString()
            },
            {
                phoneNumber: '+1122334455',
                type: 'INCOMING',
                duration: 120,
                timestamp: new Date().toISOString()
            }
        ];

        console.log('Sending batch of', logsBatch.length, 'logs...');

        const res = await fetch('http://localhost:3000/api/logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(logsBatch),
        });

        const data = await res.json();
        console.log('Response status:', res.status);
        console.log('Response body:', data);

    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
