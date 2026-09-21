import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, seniors } from '@careload/db';
import { eq } from 'drizzle-orm';
import { normalizePhoneNumber, computeNextCallAt } from '@careload/core';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { id } = await params;
  const seniorList = await db.select().from(seniors).where(eq(seniors.id, id)).limit(1);

  if (seniorList.length === 0) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({ senior: seniorList[0] });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const existingList = await db.select().from(seniors).where(eq(seniors.id, id)).limit(1);
  if (existingList.length === 0) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const existing = existingList[0];
  let phoneE164 = existing.phoneNumber;

  if (body.phoneNumber) {
    const phoneRes = normalizePhoneNumber(body.phoneNumber);
    if (phoneRes.valid && phoneRes.e164) {
      phoneE164 = phoneRes.e164;
    }
  }

  const tz = body.timezone ?? existing.timezone;
  const callTime = body.preferredCallTime ?? existing.preferredCallTime;
  const days = body.callDays ?? existing.callDays;

  const nextCallAt = computeNextCallAt({
    timezone: tz,
    preferredCallTime: callTime,
    callDays: days,
    pausedUntil: body.pausedUntil !== undefined ? body.pausedUntil : existing.pausedUntil,
  });

  const [updated] = await db
    .update(seniors)
    .set({
      name: body.name ?? existing.name,
      phoneNumber: phoneE164,
      timezone: tz,
      preferredCallTime: callTime,
      callDays: days,
      consentStatus: body.consentStatus ?? existing.consentStatus,
      pausedUntil: body.pausedUntil !== undefined ? (body.pausedUntil ? new Date(body.pausedUntil) : null) : existing.pausedUntil,
      nextCallAt,
      notes: body.notes ?? existing.notes,
      updatedAt: new Date(),
    })
    .where(eq(seniors.id, id))
    .returning();

  return NextResponse.json({ senior: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { id } = await params;
  await db.delete(seniors).where(eq(seniors.id, id));

  return NextResponse.json({ success: true });
}
