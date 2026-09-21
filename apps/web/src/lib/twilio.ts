import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID || 'AC_dummy_account_sid';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'dummy_auth_token';

export const twilioClient = twilio(accountSid, authToken);

export function validateTwilioWebhook(req: Request, params: Record<string, string>): boolean {
  if (process.env.NODE_ENV === 'development') {
    return true; // Bypass signature validation in local dev
  }
  const signature = req.headers.get('x-twilio-signature') || '';
  const url = req.url;
  return twilio.validateRequest(authToken, signature, url, params);
}
