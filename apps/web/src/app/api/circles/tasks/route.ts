import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, circleTasks, circleMembers } from '@careload/db';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId = session.user.id;
  const memberships = await db.select().from(circleMembers).where(eq(circleMembers.userId, userId));

  if (memberships.length === 0) {
    return NextResponse.json({ tasks: [] });
  }

  const circleId = memberships[0].circleId;
  const tasks = await db.select().from(circleTasks).where(eq(circleTasks.circleId, circleId));

  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();

  const { circleId, title, description, assignedToId, dueDate } = body;

  const [task] = await db
    .insert(circleTasks)
    .values({
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      circleId,
      title,
      description: description || null,
      assignedToId: assignedToId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdById: userId,
      status: 'pending',
    })
    .returning();

  return NextResponse.json({ task });
}
