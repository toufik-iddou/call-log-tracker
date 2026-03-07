const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

function signToken(userId, role) {
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_in_prod';
    return jwt.sign({ userId, role }, secret, { expiresIn: '30d' });
}

async function main() {
    try {
        const user = await prisma.user.findFirst();
        if (!user) {
            console.error('No users found to test with.');
            process.exit(1);
        }

        const token = signToken(user.id, user.role);

        const logsBatch = [
            {
                phoneNumber: '+1234567890',
                type: 'OUTGOING',
                duration: 45,
                timestamp: new Date(Date.now() - 1000000).toISOString()
            },
            {
                phoneNumber: '+1234567890',
                type: 'OUTGOING',
                duration: 45,
                timestamp: new Date(Date.now() - 1000000).toISOString()
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
