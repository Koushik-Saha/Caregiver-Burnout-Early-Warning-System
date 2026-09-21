import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, phq2Responses } from '@careload/db';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId = session.user.id;
  const recent = await db
    .select()
    .from(phq2Responses)
    .where(eq(phq2Responses.userId, userId))
    .orderBy(desc(phq2Responses.createdAt))
    .limit(1);

  if (recent.length === 0) {
    return NextResponse.json({ due: true, lastResponse: null });
  }

  const lastDate = new Date(recent[0].createdAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  return NextResponse.json({
    due: diffDays >= 7,
    lastResponse: recent[0],
    daysSince: diffDays,
  });
}
