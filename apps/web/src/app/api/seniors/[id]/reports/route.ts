import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, dailyReports } from '@careload/db';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { id: seniorId } = await params;
  const reports = await db
    .select()
    .from(dailyReports)
    .where(eq(dailyReports.seniorId, seniorId))
    .orderBy(desc(dailyReports.createdAt))
    .limit(14);

  return NextResponse.json({ reports });
}
