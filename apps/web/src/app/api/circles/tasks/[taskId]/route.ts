import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, circleTasks } from '@careload/db';
import { eq } from 'drizzle-orm';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { taskId } = await params;
  const body = await req.json();

  const [updated] = await db
    .update(circleTasks)
    .set({
      title: body.title,
      description: body.description,
      assignedToId: body.assignedToId,
      status: body.status,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(circleTasks.id, taskId))
    .returning();

  return NextResponse.json({ task: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { taskId } = await params;
  await db.delete(circleTasks).where(eq(circleTasks.id, taskId));

  return NextResponse.json({ success: true });
}
