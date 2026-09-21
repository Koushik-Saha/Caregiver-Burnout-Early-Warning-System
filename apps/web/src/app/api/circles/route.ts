import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, careCircles, circleMembers, user } from '@careload/db';
import { eq, inArray } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId = session.user.id;
  const memberships = await db.select().from(circleMembers).where(eq(circleMembers.userId, userId));

  if (memberships.length === 0) {
    return NextResponse.json({ circle: null, members: [] });
  }

  const circleId = memberships[0].circleId;
  const [circle] = await db.select().from(careCircles).where(eq(careCircles.id, circleId)).limit(1);
  const allMembers = await db.select().from(circleMembers).where(eq(circleMembers.circleId, circleId));

  const userIds = allMembers.map((m) => m.userId);
  const userList = await db.select({ id: user.id, name: user.name, email: user.email }).from(user).where(inArray(user.id, userIds));

  const userMap = new Map(userList.map((u) => [u.id, u]));
  const memberDetails = allMembers.map((m) => ({
    ...m,
    user: userMap.get(m.userId) || { id: m.userId, name: 'Member', email: '' },
  }));

  return NextResponse.json({
    circle,
    members: memberDetails,
    userRole: memberships[0].role,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();

  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const circleId = `circle_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const [circle] = await db
    .insert(careCircles)
    .values({
      id: circleId,
      name: body.name || 'Care Circle',
      code,
      description: body.description || null,
    })
    .returning();

  await db.insert(circleMembers).values({
    id: `cm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    circleId,
    userId,
    role: 'owner',
  });

  return NextResponse.json({ circle });
}
