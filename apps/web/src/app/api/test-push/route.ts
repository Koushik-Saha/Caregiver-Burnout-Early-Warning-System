import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, pushTokens } from '@careload/db';
import { eq } from 'drizzle-orm';
import { sendPush } from '@careload/core';

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId = session.user.id;
  const userTokens = await db.select().from(pushTokens).where(eq(pushTokens.userId, userId));
  const tokenStrings = userTokens.map((t) => t.token);

  if (tokenStrings.length === 0) {
    return NextResponse.json(
      { error: 'NO_TOKENS', message: 'No registered push tokens found for this device.' },
      { status: 400 }
    );
  }

  const res = await sendPush({
    tokens: tokenStrings,
    title: 'Test Push Notification',
    body: 'CareLoad push notifications are working correctly!',
    data: { test: true },
  });

  return NextResponse.json({ success: true, pushResult: res });
}
