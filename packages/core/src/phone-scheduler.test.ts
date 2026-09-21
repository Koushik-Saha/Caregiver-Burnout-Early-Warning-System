import { describe, it, expect } from 'vitest';
import { normalizePhoneNumber, computeNextCallAt } from './phone-scheduler.js';
import { DateTime } from 'luxon';

describe('normalizePhoneNumber', () => {
  it('normalizes valid US phone numbers to E.164', () => {
    const res1 = normalizePhoneNumber('4155552671');
    expect(res1.valid).toBe(true);
    expect(res1.e164).toBe('+14155552671');

    const res2 = normalizePhoneNumber('+1 (415) 555-2671');
    expect(res2.valid).toBe(true);
    expect(res2.e164).toBe('+14155552671');
  });

  it('rejects invalid phone numbers', () => {
    const res = normalizePhoneNumber('123');
    expect(res.valid).toBe(false);
    expect(res.error).toBeDefined();
  });
});

describe('computeNextCallAt', () => {
  it('computes next call time for America/Chicago timezone', () => {
    // 2026-09-21 is a Monday
    const now = DateTime.fromISO('2026-09-21T08:00:00', { zone: 'America/Chicago' }).toJSDate();
    const senior = {
      timezone: 'America/Chicago',
      preferredCallTime: '10:00',
      callDays: ['mon', 'wed', 'fri'],
    };

    const nextCall = computeNextCallAt(senior, now);
    const nextDt = DateTime.fromJSDate(nextCall).setZone('America/Chicago');

    expect(nextDt.toFormat('yyyy-MM-dd HH:mm')).toBe('2026-09-21 10:00');
  });

  it('computes next call time for America/New_York timezone', () => {
    // 2026-09-21 Monday 11:00 AM NY (past 10:00 AM preference), next call should be Wed
    const now = DateTime.fromISO('2026-09-21T11:00:00', { zone: 'America/New_York' }).toJSDate();
    const senior = {
      timezone: 'America/New_York',
      preferredCallTime: '10:00',
      callDays: ['mon', 'wed', 'fri'],
    };

    const nextCall = computeNextCallAt(senior, now);
    const nextDt = DateTime.fromJSDate(nextCall).setZone('America/New_York');

    expect(nextDt.toFormat('yyyy-MM-dd HH:mm')).toBe('2026-09-23 10:00');
  });

  it('respects pausedUntil setting', () => {
    const now = DateTime.fromISO('2026-09-21T08:00:00', { zone: 'America/Chicago' }).toJSDate();
    const pausedUntil = DateTime.fromISO('2026-09-24T00:00:00', { zone: 'America/Chicago' }).toJSDate();
    const senior = {
      timezone: 'America/Chicago',
      preferredCallTime: '10:00',
      callDays: ['mon', 'wed', 'fri'],
      pausedUntil,
    };

    const nextCall = computeNextCallAt(senior, now);
    const nextDt = DateTime.fromJSDate(nextCall).setZone('America/Chicago');

    // Friday 2026-09-25 is the first active call day after pausedUntil (Sept 24)
    expect(nextDt.toFormat('yyyy-MM-dd HH:mm')).toBe('2026-09-25 10:00');
  });
});
