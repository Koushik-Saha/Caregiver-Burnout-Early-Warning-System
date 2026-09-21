import { parsePhoneNumberWithError, ParseError } from 'libphonenumber-js';
import { DateTime } from 'luxon';

export interface PhoneValidationResult {
  valid: boolean;
  e164?: string;
  error?: string;
}

export function normalizePhoneNumber(phone: string, defaultCountry = 'US'): PhoneValidationResult {
  try {
    const phoneNumber = parsePhoneNumberWithError(phone, defaultCountry as any);
    if (phoneNumber.isValid()) {
      return {
        valid: true,
        e164: phoneNumber.format('E.164'),
      };
    } else {
      return {
        valid: false,
        error: 'Invalid phone number structure',
      };
    }
  } catch (err: any) {
    return {
      valid: false,
      error: err.message || 'Failed to parse phone number',
    };
  }
}

export interface SeniorScheduleInput {
  timezone: string; // e.g. "America/Chicago"
  preferredCallTime: string; // "10:00" (HH:mm)
  callDays: string[]; // e.g. ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] or ["monday", ...]
  pausedUntil?: string | Date | null;
}

const DAY_NAME_TO_INDEX: Record<string, number> = {
  mon: 1, monday: 1,
  tue: 2, tuesday: 2,
  wed: 3, wednesday: 3,
  thu: 4, thursday: 4,
  fri: 5, friday: 5,
  sat: 6, saturday: 6,
  sun: 7, sunday: 7,
};

export function computeNextCallAt(senior: SeniorScheduleInput, nowInput: Date = new Date()): Date {
  const zone = senior.timezone || 'America/Chicago';
  let nowDt = DateTime.fromJSDate(nowInput).setZone(zone);

  // If pausedUntil is active, start from after pausedUntil
  if (senior.pausedUntil) {
    const pausedDt = DateTime.fromJSDate(new Date(senior.pausedUntil)).setZone(zone);
    if (pausedDt > nowDt) {
      nowDt = pausedDt;
    }
  }

  const [hoursStr, minutesStr] = (senior.preferredCallTime || '10:00').split(':');
  const targetHour = parseInt(hoursStr, 10) || 10;
  const targetMinute = parseInt(minutesStr, 10) || 0;

  const activeDays = (senior.callDays || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])
    .map((d) => DAY_NAME_TO_INDEX[d.toLowerCase().slice(0, 3)])
    .filter(Boolean);

  if (activeDays.length === 0) {
    // Default to all 7 days if none specified
    for (let i = 1; i <= 7; i++) activeDays.push(i);
  }

  // Check up to 14 days into the future
  for (let offset = 0; offset < 14; offset++) {
    const candidateDay = nowDt.plus({ days: offset });
    const candidateWeekday = candidateDay.weekday; // 1 (Mon) to 7 (Sun)

    if (activeDays.includes(candidateWeekday)) {
      const candidateTime = candidateDay.set({
        hour: targetHour,
        minute: targetMinute,
        second: 0,
        millisecond: 0,
      });

      if (candidateTime > nowDt) {
        return candidateTime.toJSDate();
      }
    }
  }

  // Fallback to tomorrow same time if loop fails
  return nowDt.plus({ days: 1 }).set({ hour: targetHour, minute: targetMinute }).toJSDate();
}
