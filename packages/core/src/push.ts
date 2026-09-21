import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

const expo = new Expo();

export interface PushNotificationPayload {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface PushNotificationResult {
  sentCount: number;
  invalidTokens: string[];
}

export async function sendPush(payload: PushNotificationPayload): Promise<PushNotificationResult> {
  const { tokens, title, body, data } = payload;
  const validTokens: string[] = [];
  const invalidTokens: string[] = [];

  for (const token of tokens) {
    if (Expo.isExpoPushToken(token)) {
      validTokens.push(token);
    } else {
      invalidTokens.push(token);
    }
  }

  if (validTokens.length === 0) {
    return { sentCount: 0, invalidTokens };
  }

  const messages: ExpoPushMessage[] = validTokens.map((pushToken) => ({
    to: pushToken,
    sound: 'default',
    title,
    body,
    data: data || {},
  }));

  const chunks = expo.chunkPushNotifications(messages);
  let sentCount = 0;

  for (const chunk of chunks) {
    try {
      const tickets: ExpoPushTicket[] = await expo.sendPushNotificationsAsync(chunk);
      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        if (ticket.status === 'ok') {
          sentCount++;
        } else if (ticket.status === 'error') {
          if (ticket.details && ticket.details.error === 'DeviceNotRegistered') {
            invalidTokens.push(validTokens[i]);
          }
        }
      }
    } catch (error) {
      console.error('[sendPush Error]', error);
    }
  }

  return {
    sentCount,
    invalidTokens,
  };
}
