import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, circleMembers } from '@careload/db';
import { eq } from 'drizzle-orm';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { memberId } = await params;
  await db.delete(circleMembers).where(eq(circleMembers.id, memberId));

  return NextResponse.json({ success: true });
}
