import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, burnoutAlerts } from '@careload/db';
import { eq } from 'drizzle-orm';
import { writeAuditLog } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId = session.user.id;
  const { id } = await params;

  const [updated] = await db
    .update(burnoutAlerts)
    .set({
      isResolved: true,
      acknowledgedById: userId,
      acknowledgedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(burnoutAlerts.id, id))
    .returning();

  await writeAuditLog(userId, 'ALERT_ACKNOWLEDGE', { alertId: id });

  return NextResponse.json({ alert: updated });
}
