import { NextRequest, NextResponse } from 'next/server';
import { db, callLogs, seniors, burnoutAlerts, pushTokens, dailyReports } from '@careload/db';
import { eq, and, desc } from 'drizzle-orm';
import { sendPush } from '@careload/core';

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const callId = searchParams.get('callId') || '';

  const formData = await req.formData();
  const callStatus = (formData.get('CallStatus') as string) || '';
  const answeredBy = (formData.get('AnsweredBy') as string) || '';
  const durationStr = (formData.get('CallDuration') as string) || '0';
  const durationSeconds = parseInt(durationStr, 10) || 0;

  const calls = await db.select().from(callLogs).where(eq(callLogs.id, callId)).limit(1);
  if (calls.length === 0) {
    return NextResponse.json({ success: true });
  }

  const call = calls[0];
  const isFailedStatus =
    callStatus === 'no-answer' ||
    callStatus === 'busy' ||
    callStatus === 'failed' ||
    answeredBy.includes('machine');

  if (isFailedStatus) {
    await db
      .update(callLogs)
      .set({
        status: answeredBy.includes('machine') ? 'voicemail' : (callStatus as any),
        outcome: answeredBy.includes('machine') ? 'voicemail_left' : 'no_answer',
        durationSeconds,
        updatedAt: new Date(),
      })
      .where(eq(callLogs.id, callId));

    const seniorList = await db.select().from(seniors).where(eq(seniors.id, call.seniorId)).limit(1);
    const seniorName = seniorList.length > 0 ? seniorList[0].name : 'Senior';

    // Check recent missed reports for this senior
    const recentReports = await db
      .select()
      .from(dailyReports)
      .where(eq(dailyReports.seniorId, call.seniorId))
      .orderBy(desc(dailyReports.createdAt))
      .limit(2);

    const missedCount = recentReports.filter((r) => r.answers?.missedCall === true).length + 1;
    const alertSeverity = missedCount >= 2 ? 'critical' : 'medium';
    const alertLevelStr = missedCount >= 2 ? 'RED ALERT' : 'AMBER ALERT';

    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await db.insert(burnoutAlerts).values({
      id: alertId,
      circleId: call.circleId,
      seniorId: call.seniorId,
      severity: alertSeverity,
      message: `${alertLevelStr}: ${seniorName} missed check-in call (${callStatus}). ${missedCount} consecutive missed day(s).`,
      isResolved: false,
    });

    const tokens = await db.select().from(pushTokens);
    const tokenStrings = tokens.map((t) => t.token);
    if (tokenStrings.length > 0) {
      await sendPush({
        tokens: tokenStrings,
        title: `${alertLevelStr}: Missed Call - ${seniorName}`,
        body: `${seniorName} did not answer the scheduled check-in call.`,
        data: { alertId, seniorId: call.seniorId },
      });
    }
  } else {
    await db
      .update(callLogs)
      .set({
        status: 'completed',
        durationSeconds,
        updatedAt: new Date(),
      })
      .where(eq(callLogs.id, callId));
  }

  return NextResponse.json({ success: true });
}
