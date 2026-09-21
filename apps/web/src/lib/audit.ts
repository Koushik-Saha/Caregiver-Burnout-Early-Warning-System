import { db, auditLogs } from '@careload/db';

export async function writeAuditLog(
  userId: string | null,
  action: string,
  details: Record<string, any> = {},
  ipAddress?: string | null
) {
  try {
    await db.insert(auditLogs).values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      action,
      details,
      ipAddress,
    });
  } catch (err) {
    console.error('[writeAuditLog Error]', err);
  }
}
