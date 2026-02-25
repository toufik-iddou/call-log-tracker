import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getUserIdFromRequest(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    return payload ? payload.userId : null;
}

export async function POST(request: Request) {
    try {
        const userId = getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        console.log("---- RECEIVED /api/logs POST ----");
        console.log(JSON.stringify(data, null, 2));

        const logsToProcess = Array.isArray(data) ? data : [data];

        if (logsToProcess.length === 0) {
            return NextResponse.json(
                { error: 'No logs provided' },
                { status: 400 }
            );
        }

        const validLogsData = [];
        for (const logItem of logsToProcess) {
            const { phoneNumber, type, duration, timestamp } = logItem;
            if (!phoneNumber || !type || duration === undefined || !timestamp) {
                return NextResponse.json(
                    { error: 'Missing required fields in one or more logs' },
                    { status: 400 }
                );
            }
            validLogsData.push({
                phoneNumber,
                type,
                duration: typeof duration === 'string' ? parseInt(duration, 10) : duration,
                timestamp: new Date(timestamp),
                agentId: userId,
            });
        }

        if (validLogsData.length === 1) {
            const log = await prisma.callLog.create({
                data: validLogsData[0],
                include: {
                    agent: {
                        select: { username: true }
                    }
                }
            });
            return NextResponse.json({ success: true, log }, { status: 201 });
        } else {
            const result = await prisma.callLog.createMany({
                data: validLogsData,
            });
            return NextResponse.json({ success: true, count: result.count, batch: true }, { status: 201 });
        }
    } catch (error) {
        console.error('Failed to create call log:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '100', 10);
        const agentId = searchParams.get('agentId');

        const logs = await prisma.callLog.findMany({
            where: agentId ? { agentId } : undefined,
            orderBy: { timestamp: 'desc' },
            take: limit,
            include: {
                agent: {
                    select: { username: true }
                }
            }
        });

        return NextResponse.json({ success: true, logs });
    } catch (error) {
        console.error('Failed to fetch call logs:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
