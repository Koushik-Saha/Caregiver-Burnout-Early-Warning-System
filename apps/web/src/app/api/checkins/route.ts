import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, checkins, burnoutAlerts } from '@careload/db';
import { eq, and, desc, gte } from 'drizzle-orm';
import { computeCareLoadScore, evaluateEarlyWarning } from '@careload/core';
import { writeAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();

  const { localDate, mood, stress, sleepHours, careHours, personalTime, note, circleId, seniorId } = body;
  const dateStr = localDate || new Date().toISOString().split('T')[0];

  // 1. Compute score
  const scoreResult = computeCareLoadScore({
    mood: Number(mood || 0),
    stress: Number(stress || 0),
    sleepHours: Number(sleepHours || 7),
    careHours: Number(careHours || 20),
    personalTime: Boolean(personalTime),
  });

  // 2. Daily Overwrite check: check if check-in exists for (userId, localDate)
  const existing = await db
    .select()
    .from(checkins)
    .where(and(eq(checkins.userId, userId), eq(checkins.localDate, dateStr)))
    .limit(1);

  let checkinRecord;
  if (existing.length > 0) {
    [checkinRecord] = await db
      .update(checkins)
      .set({
        mood: Number(mood),
        stress: Number(stress),
        sleepHours: Number(sleepHours),
        careHours: Number(careHours),
        personalTime: Boolean(personalTime),
        note: note || null,
        score: scoreResult.score,
        level: scoreResult.level,
        updatedAt: new Date(),
      })
      .where(eq(checkins.id, existing[0].id))
      .returning();
  } else {
    [checkinRecord] = await db
      .insert(checkins)
      .values({
        id: `chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        circleId: circleId || null,
        seniorId: seniorId || null,
        localDate: dateStr,
        mood: Number(mood),
        stress: Number(stress),
        sleepHours: Number(sleepHours),
        careHours: Number(careHours),
        personalTime: Boolean(personalTime),
        note: note || null,
        score: scoreResult.score,
        level: scoreResult.level,
      })
      .returning();
  }

  // 3. Fetch recent 30-day history & evaluate early warning
  const history = await db
    .select()
    .from(checkins)
    .where(eq(checkins.userId, userId))
    .orderBy(desc(checkins.localDate))
    .limit(30);

  const warning = evaluateEarlyWarning(
    history.map((h) => ({ date: h.localDate, score: h.score, personalTime: h.personalTime }))
  );

  let alertRecord = null;
  if (warning.triggered) {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    [alertRecord] = await db
      .insert(burnoutAlerts)
      .values({
        id: alertId,
        circleId: circleId || null,
        userId,
        severity: warning.severity === 'red' ? 'critical' : 'medium',
        message: warning.reason || 'Early warning alert triggered by CareLoad check-in trend.',
        isResolved: false,
      })
      .returning();
  }

  await writeAuditLog(userId, 'CHECKIN_SUBMIT', { date: dateStr, score: scoreResult.score });

  return NextResponse.json({
    checkin: checkinRecord,
    scoreResult,
    earlyWarning: warning,
    alert: alertRecord,
  });
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') || '30', 10);

  const history = await db
    .select()
    .from(checkins)
    .where(eq(checkins.userId, userId))
    .orderBy(desc(checkins.localDate))
    .limit(days);

  return NextResponse.json({ checkins: history });
}
