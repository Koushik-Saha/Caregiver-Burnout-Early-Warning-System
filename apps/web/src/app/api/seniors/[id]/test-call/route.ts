import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, seniors, callLogs } from '@careload/db';
import { eq } from 'drizzle-orm';
import { twilioClient } from '@/lib/twilio';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitRes = rateLimit(req, 5, 60 * 1000);
  if (rateLimitRes) return rateLimitRes;

  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { id } = await params;
  const seniorList = await db.select().from(seniors).where(eq(seniors.id, id)).limit(1);

  if (seniorList.length === 0) {
    return NextResponse.json({ error: 'NOT_FOUND', message: 'Senior not found' }, { status: 404 });
  }

  const senior = seniorList[0];
  if (!senior.phoneNumber) {
    return NextResponse.json({ error: 'NO_PHONE', message: 'Senior has no phone number set' }, { status: 400 });
  }

  const baseUrl = process.env.PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER || '+18005550199';

  const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  await db.insert(callLogs).values({
    id: callId,
    seniorId: senior.id,
    circleId: senior.circleId,
    status: 'in_progress',
    outcome: 'test_call_initiated',
  });

  try {
    const isConsentCall = senior.consentStatus === 'pending';
    const webhookPath = isConsentCall ? '/api/twilio/voice?kind=consent' : '/api/twilio/voice?kind=daily';
    const twilioCall = await twilioClient.calls.create({
      url: `${baseUrl}${webhookPath}&callId=${callId}`,
      to: senior.phoneNumber,
      from: twilioPhone,
      statusCallback: `${baseUrl}/api/twilio/status?callId=${callId}`,
      statusCallbackEvent: ['completed', 'answered', 'no-answer', 'busy', 'failed'],
      machineDetection: 'Enable',
    });

    await db.update(callLogs).set({ twilioCallSid: twilioCall.sid }).where(eq(callLogs.id, callId));

    return NextResponse.json({ success: true, callId, twilioSid: twilioCall.sid });
  } catch (err: any) {
    console.error('[Twilio Call Error]', err);
    return NextResponse.json(
      { error: 'TWILIO_ERROR', message: err.message || 'Failed to place call' },
      { status: 500 }
    );
  }
}
