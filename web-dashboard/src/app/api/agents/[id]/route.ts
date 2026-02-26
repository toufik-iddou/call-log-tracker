import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { id } = await params;
        const data = await request.json();
        const { username } = data;

        if (!username || username.trim() === '') {
            return NextResponse.json(
                { error: 'Username is required' },
                { status: 400 }
            );
        }

        // Check if the new username already exists on another agent
        const existingAgent = await prisma.user.findFirst({
            where: {
                username: username,
                id: {
                    not: id // Exclude current agent so they can "rename" to same name safely
                }
            },
        });

        if (existingAgent) {
            return NextResponse.json(
                { error: `Agent with username "${username}" already exists.` },
                { status: 409 }
            );
        }

        // Update the agent
        const updatedAgent = await prisma.user.update({
            where: { id },
            data: { username },
            select: {
                id: true,
                username: true,
                createdAt: true,
            }
        });

        return NextResponse.json({ success: true, agent: updatedAgent });
    } catch (error: any) {
        console.error('Failed to update agent:', error);

        // Handle Prisma specific errors (e.g., record not found)
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Agent not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
