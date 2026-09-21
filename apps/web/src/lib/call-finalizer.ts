import { db, callLogs, dailyReports, seniors, circleTasks, burnoutAlerts, pushTokens } from '@careload/db';
import { eq } from 'drizzle-orm';
import { buildReport, sendPush } from '@careload/core';

export async function finalizeCall(callId: string, answers: Record<string, any>) {
  // 1. Fetch call log
  const calls = await db.select().from(callLogs).where(eq(callLogs.id, callId)).limit(1);
  if (calls.length === 0) return;
  const call = calls[0];

  // 2. Idempotency check: check if daily report already exists for this call
  const existingReports = await db.select().from(dailyReports).where(eq(dailyReports.callId, callId)).limit(1);
  if (existingReports.length > 0) {
    return existingReports[0];
  }

  // 3. Fetch senior details
  const seniorList = await db.select().from(seniors).where(eq(seniors.id, call.seniorId)).limit(1);
  const seniorName = seniorList.length > 0 ? seniorList[0].name : 'Senior';

  // 4. Build report with @careload/core
  const reportResult = buildReport(answers);
  const todayStr = new Date().toISOString().split('T')[0];

  const reportId = `report_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const [report] = await db.insert(dailyReports).values({
    id: reportId,
    seniorId: call.seniorId,
    circleId: call.circleId,
    callId: call.id,
    reportDate: todayStr,
    wellbeingScore: reportResult.wellbeingScore,
    alertLevel: reportResult.alertLevel,
    flags: reportResult.flags,
    summary: reportResult.summary,
    answers: reportResult.answers,
  }).returning();

  // 5. Auto-create task if callback requested
  if (answers.q6_callback_requested === true || answers.q6_callback_requested === 'yes' || answers.q6_callback_requested === '1') {
    await db.insert(circleTasks).values({
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      circleId: call.circleId,
      title: `Call ${seniorName} back`,
      description: `Callback requested during daily check-in call on ${todayStr}`,
      status: 'pending',
      createdById: 'system',
    });
  }

  // 6. Create burnout alert if red or amber
  if (reportResult.alertLevel === 'red' || reportResult.alertLevel === 'amber') {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await db.insert(burnoutAlerts).values({
      id: alertId,
      circleId: call.circleId,
      seniorId: call.seniorId,
      severity: reportResult.alertLevel === 'red' ? 'critical' : 'medium',
      message: `${seniorName}: ${reportResult.summary}`,
      isResolved: false,
    });

    // Send Push Notification
    const tokens = await db.select().from(pushTokens);
    const tokenStrings = tokens.map((t) => t.token);
    if (tokenStrings.length > 0) {
      await sendPush({
        tokens: tokenStrings,
        title: `Care Alert (${reportResult.alertLevel.toUpperCase()}): ${seniorName}`,
        body: reportResult.summary,
        data: { alertId, reportId },
      });
    }
  }

  return report;
}
