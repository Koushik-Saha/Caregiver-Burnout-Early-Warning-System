import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get('kind') || 'daily';
  const callId = searchParams.get('callId') || '';

  const twiml = new VoiceResponse();
  const inputMode = process.env.CALL_INPUT_MODE || 'dtmf';
  const gatherInputs: any[] = inputMode === 'speech' ? ['speech', 'dtmf'] : ['dtmf'];

  if (kind === 'consent') {
    const gather = twiml.gather({
      numDigits: 1,
      action: `/api/twilio/gather?kind=consent&step=consent&callId=${callId}`,
      method: 'POST',
      timeout: 5,
      input: gatherInputs,
    });
    gather.say(
      'Hello. This is the CareLoad automated check-in service. We are calling to setup daily wellness calls. Press 1 to consent to receiving daily check-in calls. Press 2 to decline. Press 8 to opt out at any time.'
    );
    twiml.say('We did not receive a response. Goodbye.');
  } else {
    // Step 1 of 6-step daily script
    const gather = twiml.gather({
      numDigits: 1,
      action: `/api/twilio/gather?kind=daily&step=1&callId=${callId}`,
      method: 'POST',
      timeout: 5,
      input: gatherInputs,
    });
    gather.say(
      'Hello! This is your daily CareLoad check-in. Question 1 of 5: On a scale of 1 to 5, where 5 is feeling great and 1 is feeling poor, how are you feeling overall today? Press 9 at any time for emergency assistance.'
    );
    twiml.redirect(`/api/twilio/gather?kind=daily&step=1&retry=1&callId=${callId}`);
  }

  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
}
