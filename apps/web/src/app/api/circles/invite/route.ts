import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, circleInvites, circleMembers } from '@careload/db';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const { circleId } = body;

  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const [invite] = await db
    .insert(circleInvites)
    .values({
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      circleId,
      code,
      createdById: userId,
      expiresAt,
    })
    .returning();

  return NextResponse.json({ invite });
}
