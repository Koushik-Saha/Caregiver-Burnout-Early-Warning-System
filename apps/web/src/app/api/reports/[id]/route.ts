import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, dailyReports } from '@careload/db';
import { eq } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { id } = await params;
  const list = await db.select().from(dailyReports).where(eq(dailyReports.id, id)).limit(1);

  if (list.length === 0) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({ report: list[0] });
}
