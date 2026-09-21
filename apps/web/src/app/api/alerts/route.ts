import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, burnoutAlerts, circleMembers } from '@careload/db';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId = session.user.id;
  const memberships = await db.select().from(circleMembers).where(eq(circleMembers.userId, userId));

  if (memberships.length === 0) {
    return NextResponse.json({ alerts: [] });
  }

  const circleId = memberships[0].circleId;
  const { searchParams } = new URL(req.url);
  const openOnly = searchParams.get('open') === 'true';

  let alertList;
  if (openOnly) {
    alertList = await db
      .select()
      .from(burnoutAlerts)
      .where(and(eq(burnoutAlerts.circleId, circleId), eq(burnoutAlerts.isResolved, false)));
  } else {
    alertList = await db.select().from(burnoutAlerts).where(eq(burnoutAlerts.circleId, circleId));
  }

  return NextResponse.json({ alerts: alertList });
}
