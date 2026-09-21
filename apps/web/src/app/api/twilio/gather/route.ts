import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { db, seniors, callLogs, burnoutAlerts, pushTokens } from '@careload/db';
import { eq } from 'drizzle-orm';
import { detectEmergency, sendPush } from '@careload/core';
import { finalizeCall } from '@/lib/call-finalizer';

const VoiceResponse = twilio.twiml.VoiceResponse;

// In-memory call response state store
const callStateStore = new Map<string, Record<string, any>>();

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get('kind') || 'daily';
  const step = searchParams.get('step') || '1';
  const callId = searchParams.get('callId') || '';

  const formData = await req.formData();
  const digits = (formData.get('Digits') as string) || '';
  const speechResult = (formData.get('SpeechResult') as string) || '';

  const twiml = new VoiceResponse();
  const inputMode = process.env.CALL_INPUT_MODE || 'dtmf';
  const gatherInputs: any[] = inputMode === 'speech' ? ['speech', 'dtmf'] : ['dtmf'];

  // Check for Emergency Keypress 9 or Emergency speech keywords
  if (digits === '9' || detectEmergency(speechResult)) {
    const calls = await db.select().from(callLogs).where(eq(callLogs.id, callId)).limit(1);
    if (calls.length > 0) {
      const call = calls[0];
      const seniorList = await db.select().from(seniors).where(eq(seniors.id, call.seniorId)).limit(1);
      const seniorName = seniorList.length > 0 ? seniorList[0].name : 'Senior';

      await db.insert(burnoutAlerts).values({
        id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        circleId: call.circleId,
        seniorId: call.seniorId,
        severity: 'critical',
        message: `EMERGENCY ALERT: ${seniorName} triggered emergency assistance during check-in call ("${speechResult || 'Keypress 9'}").`,
        isResolved: false,
      });

      const tokens = await db.select().from(pushTokens);
      const tokenStrings = tokens.map((t) => t.token);
      if (tokenStrings.length > 0) {
        await sendPush({
          tokens: tokenStrings,
          title: `RED ALERT: Emergency Triggered by ${seniorName}`,
          body: `Emergency assistance requested during call. Immediate follow-up needed.`,
          data: { callId, emergency: true },
        });
      }
    }

    twiml.say('Emergency notification sent to your caregivers. Help is on the way.');
    twiml.hangup();
    return new NextResponse(twiml.toString(), { headers: { 'Content-Type': 'text/xml' } });
  }

  // Check for Opt-Out Keypress 8
  if (digits === '8') {
    const calls = await db.select().from(callLogs).where(eq(callLogs.id, callId)).limit(1);
    if (calls.length > 0) {
      await db.update(seniors).set({ consentStatus: 'revoked' }).where(eq(seniors.id, calls[0].seniorId));
    }
    twiml.say('You have opted out of daily check-in calls. Goodbye.');
    twiml.hangup();
    return new NextResponse(twiml.toString(), { headers: { 'Content-Type': 'text/xml' } });
  }

  if (kind === 'consent') {
    const calls = await db.select().from(callLogs).where(eq(callLogs.id, callId)).limit(1);
    if (calls.length > 0) {
      const seniorId = calls[0].seniorId;
      if (digits === '1' || speechResult.toLowerCase().includes('yes')) {
        await db.update(seniors).set({ consentStatus: 'granted' }).where(eq(seniors.id, seniorId));
        twiml.say('Thank you for consenting to daily check-in calls. Goodbye!');
      } else {
        await db.update(seniors).set({ consentStatus: 'declined' }).where(eq(seniors.id, seniorId));
        twiml.say('Daily check-in calls have been declined. Goodbye.');
      }
    }
    twiml.hangup();
    return new NextResponse(twiml.toString(), { headers: { 'Content-Type': 'text/xml' } });
  }

  // Daily Check-in 6-step script state handling
  const answers = callStateStore.get(callId) || {};

  if (step === '1') {
    answers.q1_wellbeing = digits || speechResult || '3';
    callStateStore.set(callId, answers);

    const gather = twiml.gather({
      numDigits: 1,
      action: `/api/twilio/gather?kind=daily&step=2&callId=${callId}`,
      method: 'POST',
      timeout: 5,
      input: gatherInputs,
    });
    gather.say('Question 2: Are you experiencing any physical pain or discomfort today? Press 1 for yes, press 2 for no.');
  } else if (step === '2') {
    answers.q2_pain = digits === '1' || speechResult.toLowerCase().includes('yes');
    callStateStore.set(callId, answers);

    const gather = twiml.gather({
      numDigits: 1,
      action: `/api/twilio/gather?kind=daily&step=3&callId=${callId}`,
      method: 'POST',
      timeout: 5,
      input: gatherInputs,
    });
    gather.say('Question 3: How was your sleep last night? On a scale of 1 to 5, where 5 is rested and 1 is very poor.');
  } else if (step === '3') {
    answers.q3_sleep = digits || speechResult || '3';
    callStateStore.set(callId, answers);

    const gather = twiml.gather({
      numDigits: 1,
      action: `/api/twilio/gather?kind=daily&step=4&callId=${callId}`,
      method: 'POST',
      timeout: 5,
      input: gatherInputs,
    });
    gather.say('Question 4: How are your spirits or mood today? On a scale of 1 to 5, where 5 is high spirits and 1 is feeling low.');
  } else if (step === '4') {
    answers.q4_mood = digits || speechResult || '3';
    callStateStore.set(callId, answers);

    const gather = twiml.gather({
      numDigits: 1,
      action: `/api/twilio/gather?kind=daily&step=5&callId=${callId}`,
      method: 'POST',
      timeout: 5,
      input: gatherInputs,
    });
    gather.say('Question 5: Have you been able to eat your regular meals today? Press 1 for yes, press 2 for no.');
  } else if (step === '5') {
    answers.q5_meals = digits === '1' || speechResult.toLowerCase().includes('yes');
    callStateStore.set(callId, answers);

    const gather = twiml.gather({
      numDigits: 1,
      action: `/api/twilio/gather?kind=daily&step=6&callId=${callId}`,
      method: 'POST',
      timeout: 5,
      input: gatherInputs,
    });
    gather.say('Final Question: Would you like a family member or caregiver to call you back today? Press 1 for yes, press 2 for no.');
  } else if (step === '6') {
    answers.q6_callback_requested = digits === '1' || speechResult.toLowerCase().includes('yes');
    callStateStore.set(callId, answers);

    // Finalize report & call
    await finalizeCall(callId, answers);
    callStateStore.delete(callId);

    twiml.say('Thank you for completing your daily check-in! Have a wonderful day. Goodbye!');
    twiml.hangup();
  }

  return new NextResponse(twiml.toString(), { headers: { 'Content-Type': 'text/xml' } });
}
