import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getAuthPayloadFromRequest(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    return verifyToken(token);
}

export async function POST(request: Request) {
    try {
        const payload = getAuthPayloadFromRequest(request);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = payload.userId;

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
            const singleLog = validLogsData[0];
            const existingLog = await prisma.callLog.findFirst({
                where: {
                    phoneNumber: singleLog.phoneNumber,
                    type: singleLog.type,
                    agentId: singleLog.agentId,
                    timestamp: {
                        gte: new Date(singleLog.timestamp.getTime() - 10000),
                        lte: new Date(singleLog.timestamp.getTime() + 10000)
                    }
                }
            });

            if (existingLog) {
                return NextResponse.json({ success: true, log: existingLog, duplicate: true }, { status: 200 });
            }

            const log = await prisma.callLog.create({
                data: singleLog,
                include: {
                    agent: {
                        select: { username: true }
                    }
                }
            });
            return NextResponse.json({ success: true, log }, { status: 201 });
        } else {
            // Filter duplicates from batch
            const uniqueLogsToInsert = [];
            for (const logItem of validLogsData) {
                const existingLog = await prisma.callLog.findFirst({
                    where: {
                        phoneNumber: logItem.phoneNumber,
                        type: logItem.type,
                        agentId: logItem.agentId,
                        timestamp: {
                            gte: new Date(logItem.timestamp.getTime() - 10000),
                            lte: new Date(logItem.timestamp.getTime() + 10000)
                        }
                    }
                });
                if (!existingLog) {
                    uniqueLogsToInsert.push(logItem);
                }
            }

            if (uniqueLogsToInsert.length > 0) {
                const result = await prisma.callLog.createMany({
                    data: uniqueLogsToInsert,
                });
                return NextResponse.json({ success: true, count: result.count, batch: true }, { status: 201 });
            } else {
                return NextResponse.json({ success: true, count: 0, batch: true, duplicates: validLogsData.length }, { status: 200 });
            }
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
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        let agentId = searchParams.get('agentId');

        const payload = getAuthPayloadFromRequest(request);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (payload.role !== 'ADMIN') {
            // Force agents to only view their own logs
            agentId = payload.userId;
        }

        const skip = (page - 1) * limit;
        const whereClause = agentId ? { agentId } : undefined;

        const [logs, totalLogs] = await Promise.all([
            prisma.callLog.findMany({
                where: whereClause,
                orderBy: { timestamp: 'desc' },
                skip,
                take: limit,
                include: {
                    agent: {
                        select: { username: true }
                    }
                }
            }),
            prisma.callLog.count({ where: whereClause })
        ]);

        const totalPages = Math.max(1, Math.ceil(totalLogs / limit));

        const response = NextResponse.json({ success: true, logs, totalLogs, totalPages, page, limit });
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        return response;
    } catch (error) {
        console.error('Failed to fetch call logs:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
