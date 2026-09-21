import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, pushTokens } from '@careload/db';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const { token, platform } = body;

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  // Check if token already exists
  const existing = await db.select().from(pushTokens).where(eq(pushTokens.token, token)).limit(1);

  if (existing.length === 0) {
    await db.insert(pushTokens).values({
      id: `pt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      token,
      platform: platform || 'expo',
    });
  } else if (existing[0].userId !== userId) {
    await db.update(pushTokens).set({ userId, updatedAt: new Date() }).where(eq(pushTokens.id, existing[0].id));
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const { token } = body;

  if (token) {
    await db.delete(pushTokens).where(and(eq(pushTokens.token, token), eq(pushTokens.userId, userId)));
  }

  return NextResponse.json({ success: true });
}
