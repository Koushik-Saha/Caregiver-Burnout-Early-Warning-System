import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, phq2Responses } from '@careload/db';
import { scorePhq2 } from '@careload/core';

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const { q1Score, q2Score } = body;

  const totalScore = scorePhq2(Number(q1Score || 0), Number(q2Score || 0));

  const [response] = await db
    .insert(phq2Responses)
    .values({
      id: `phq2_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      q1Score: Number(q1Score || 0),
      q2Score: Number(q2Score || 0),
      totalScore,
    })
    .returning();

  return NextResponse.json({ phq2: response });
}
