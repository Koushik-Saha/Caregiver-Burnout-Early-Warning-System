import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, circleInvites, circleMembers, careCircles } from '@careload/db';
import { eq, and, isNull } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const { code } = body;

  const normalizedCode = (code || '').trim().toUpperCase();

  // Find invite code or circle code
  const invites = await db
    .select()
    .from(circleInvites)
    .where(and(eq(circleInvites.code, normalizedCode), isNull(circleInvites.usedAt)))
    .limit(1);

  let targetCircleId: string | null = null;

  if (invites.length > 0) {
    const inv = invites[0];
    if (new Date(inv.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'EXPIRED_CODE', message: 'Invite code has expired' }, { status: 400 });
    }
    targetCircleId = inv.circleId;
    await db.update(circleInvites).set({ usedAt: new Date() }).where(eq(circleInvites.id, inv.id));
  } else {
    // Check if it's a primary circle code
    const circles = await db.select().from(careCircles).where(eq(careCircles.code, normalizedCode)).limit(1);
    if (circles.length > 0) {
      targetCircleId = circles[0].id;
    }
  }

  if (!targetCircleId) {
    return NextResponse.json({ error: 'INVALID_CODE', message: 'Invalid or used invite code' }, { status: 404 });
  }

  // Check if user is already a member
  const existingMembers = await db
    .select()
    .from(circleMembers)
    .where(and(eq(circleMembers.circleId, targetCircleId), eq(circleMembers.userId, userId)))
    .limit(1);

  if (existingMembers.length === 0) {
    await db.insert(circleMembers).values({
      id: `cm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      circleId: targetCircleId,
      userId,
      role: 'member',
    });
  }

  const [circle] = await db.select().from(careCircles).where(eq(careCircles.id, targetCircleId)).limit(1);

  return NextResponse.json({ success: true, circle });
}
