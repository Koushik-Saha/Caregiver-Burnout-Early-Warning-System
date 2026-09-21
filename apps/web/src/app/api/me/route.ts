import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, user, caregiverProfiles, circleMembers, careCircles } from '@careload/db';
import { eq, inArray } from 'drizzle-orm';
import { requireSession } from '@careload/core';
import { writeAuditLog } from '@/lib/audit';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId = session.user.id;
  const profiles = await db.select().from(caregiverProfiles).where(eq(caregiverProfiles.userId, userId)).limit(1);
  const profile = profiles[0] || null;

  return NextResponse.json({
    user: session.user,
    profile,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();

  const existing = await db.select().from(caregiverProfiles).where(eq(caregiverProfiles.userId, userId)).limit(1);

  if (existing.length === 0) {
    await db.insert(caregiverProfiles).values({
      id: `prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      relationship: body.relationship,
      firstName: body.firstName,
      weeklyHours: body.weeklyHours,
      timezone: body.timezone || 'America/Chicago',
      onboardingCompleted: body.onboardingCompleted ?? true,
    });
  } else {
    await db.update(caregiverProfiles)
      .set({
        relationship: body.relationship ?? existing[0].relationship,
        firstName: body.firstName ?? existing[0].firstName,
        weeklyHours: body.weeklyHours ?? existing[0].weeklyHours,
        timezone: body.timezone ?? existing[0].timezone,
        onboardingCompleted: body.onboardingCompleted ?? existing[0].onboardingCompleted,
        updatedAt: new Date(),
      })
      .where(eq(caregiverProfiles.userId, userId));
  }

  await writeAuditLog(userId, 'USER_UPDATE_PROFILE', body);

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const rateLimitRes = rateLimit(req, 5);
  if (rateLimitRes) return rateLimitRes;

  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId = session.user.id;

  // Audit log account deletion
  await writeAuditLog(userId, 'USER_DELETE', { email: session.user.email });

  // Delete user record (cascades to caregiverProfiles, circleMembers, sessions, pushTokens, etc.)
  await db.delete(user).where(eq(user.id, userId));

  return NextResponse.json({ success: true, message: 'Account deleted successfully' });
}
