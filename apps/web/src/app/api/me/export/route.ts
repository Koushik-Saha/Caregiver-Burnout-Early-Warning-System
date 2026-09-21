import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, user, caregiverProfiles, checkins, phq2Responses, circleMembers } from '@careload/db';
import { eq } from 'drizzle-orm';
import { writeAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId = session.user.id;

  const [profile] = await db.select().from(caregiverProfiles).where(eq(caregiverProfiles.userId, userId)).limit(1);
  const userCheckins = await db.select().from(checkins).where(eq(checkins.userId, userId));
  const userPhq2 = await db.select().from(phq2Responses).where(eq(phq2Responses.userId, userId));
  const userMemberships = await db.select().from(circleMembers).where(eq(circleMembers.userId, userId));

  await writeAuditLog(userId, 'EXPORT_DATA', { timestamp: new Date().toISOString() });

  const exportData = {
    user: session.user,
    profile: profile || null,
    checkins: userCheckins,
    phq2Responses: userPhq2,
    circleMemberships: userMemberships,
    exportedAt: new Date().toISOString(),
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="careload-data-${userId}.json"`,
    },
  });
}
