import { NextRequest, NextResponse } from 'next/server';
import { db, seniors, callLogs, scheduledCalls } from '@careload/db';
import { lte, eq, and, isNull, or, sql } from 'drizzle-orm';
import { computeNextCallAt } from '@careload/core';
import { twilioClient } from '@/lib/twilio';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const secret = req.nextUrl.searchParams.get('secret');
  const cronSecret = process.env.CRON_SECRET || 'dev_cron_secret';

  const isValidSecret =
    authHeader === `Bearer ${cronSecret}` || secret === cronSecret;

  if (!isValidSecret && process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const now = new Date();
  const baseUrl = process.env.PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER || '+18005550199';

  // Atomic claim query using FOR UPDATE SKIP LOCKED pattern via SQL raw template
  const dueSeniors = await db.execute(sql`
    UPDATE seniors
    SET next_call_at = NULL, updated_at = NOW()
    WHERE id IN (
      SELECT id FROM seniors
      WHERE consent_status = 'granted'
        AND (paused_until IS NULL OR paused_until <= NOW())
        AND next_call_at IS NOT NULL
        AND next_call_at <= NOW()
      FOR UPDATE SKIP LOCKED
    )
    RETURNING id, circle_id, name, phone_number, timezone, preferred_call_time, call_days
  `);

  const rows = dueSeniors.rows as any[];
  const results = [];

  for (const senior of rows) {
    if (!senior.phone_number) continue;

    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await db.insert(callLogs).values({
      id: callId,
      seniorId: senior.id,
      circleId: senior.circle_id,
      status: 'in_progress',
      outcome: 'cron_dispatched',
    });

    try {
      const twilioCall = await twilioClient.calls.create({
        url: `${baseUrl}/api/twilio/voice?kind=daily&callId=${callId}`,
        to: senior.phone_number,
        from: twilioPhone,
        statusCallback: `${baseUrl}/api/twilio/status?callId=${callId}`,
        statusCallbackEvent: ['completed', 'answered', 'no-answer', 'busy', 'failed'],
        machineDetection: 'Enable',
      });

      await db.update(callLogs).set({ twilioCallSid: twilioCall.sid }).where(eq(callLogs.id, callId));

      // Calculate & update next scheduled call time
      const nextCall = computeNextCallAt({
        timezone: senior.timezone || 'America/Chicago',
        preferredCallTime: senior.preferred_call_time || '10:00',
        callDays: senior.call_days || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      });

      await db.update(seniors).set({ nextCallAt: nextCall }).where(eq(seniors.id, senior.id));

      results.push({ seniorId: senior.id, callId, status: 'dispatched', twilioSid: twilioCall.sid });
    } catch (err: any) {
      console.error(`[Cron Dispatch Error for senior ${senior.id}]`, err);
      results.push({ seniorId: senior.id, callId, status: 'error', error: err.message });
    }
  }

  return NextResponse.json({
    dispatchedCount: results.length,
    results,
    timestamp: now.toISOString(),
  });
}
