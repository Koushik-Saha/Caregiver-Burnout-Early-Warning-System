import { NextRequest, NextResponse } from 'next/server';

const rateMap = new Map<string, { count: number; expiresAt: number }>();

export function rateLimit(req: NextRequest, limit = 10, windowMs = 60 * 1000): NextResponse | null {
  const ip = req.headers.get('x-forwarded-for') || 'unknown-ip';
  const now = Date.now();
  const record = rateMap.get(ip);

  if (!record || record.expiresAt < now) {
    rateMap.set(ip, { count: 1, expiresAt: now + windowMs });
    return null;
  }

  if (record.count >= limit) {
    return NextResponse.json(
      { error: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }

  record.count++;
  return null;
}
