import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
        }

        const agentId = params.id;

        const sessions = await prisma.agentSession.findMany({
            where: { agentId },
            orderBy: { startTime: 'desc' },
            take: 100 // Limit to recent 100 sessions to prevent huge payloads
        });

        return NextResponse.json({ success: true, sessions });
    } catch (error) {
        console.error('Failed to fetch agent sessions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
