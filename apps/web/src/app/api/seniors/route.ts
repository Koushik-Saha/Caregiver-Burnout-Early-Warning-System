import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, seniors, circleMembers } from '@careload/db';
import { eq } from 'drizzle-orm';
import { normalizePhoneNumber, computeNextCallAt } from '@careload/core';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId = session.user.id;
  const memberships = await db.select().from(circleMembers).where(eq(circleMembers.userId, userId));

  if (memberships.length === 0) {
    return NextResponse.json({ seniors: [] });
  }

  const circleId = memberships[0].circleId;
  const seniorList = await db.select().from(seniors).where(eq(seniors.circleId, circleId));

  return NextResponse.json({ seniors: seniorList });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();

  const { circleId, name, phoneNumber, timezone, preferredCallTime, callDays, notes } = body;

  // Validate circle membership & role
  const memberships = await db.select().from(circleMembers).where(eq(circleMembers.userId, userId));
  const member = memberships.find((m) => m.circleId === circleId);

  if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
    return NextResponse.json({ error: 'FORBIDDEN', message: 'Only circle owners or admins can add seniors' }, { status: 403 });
  }

  // Normalize phone number
  const phoneRes = normalizePhoneNumber(phoneNumber || '');
  if (!phoneRes.valid || !phoneRes.e164) {
    return NextResponse.json({ error: 'INVALID_PHONE', message: phoneRes.error || 'Invalid phone number' }, { status: 400 });
  }

  const seniorId = `senior_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const tz = timezone || 'America/Chicago';
  const callTime = preferredCallTime || '10:00';
  const days = callDays || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  const nextCallAt = computeNextCallAt({
    timezone: tz,
    preferredCallTime: callTime,
    callDays: days,
  });

  const [newSenior] = await db
    .insert(seniors)
    .values({
      id: seniorId,
      circleId,
      name,
      phoneNumber: phoneRes.e164,
      timezone: tz,
      preferredCallTime: callTime,
      callDays: days,
      consentStatus: 'pending',
      nextCallAt,
      notes: notes || null,
    })
    .returning();

  return NextResponse.json({ senior: newSenior });
}
