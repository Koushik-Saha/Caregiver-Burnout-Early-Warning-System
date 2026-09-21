export interface CareLoadInput {
  mood: number; // 0..6
  stress: number; // 0..10
  sleepHours: number; // hours
  careHours: number; // weekly hours
  personalTime: boolean; // had personal time today
}

export type CareLoadLevel = 'low' | 'moderate' | 'elevated' | 'high';

export interface ScoreBreakdown {
  moodPoints: number;
  careHoursPoints: number;
  sleepPoints: number;
  stressPoints: number;
  personalTimePoints: number;
}

export interface CareLoadResult {
  score: number;
  level: CareLoadLevel;
  breakdown: ScoreBreakdown;
}

export function computeCareLoadScore(input: CareLoadInput): CareLoadResult {
  // 1. Mood (28%)
  let moodScaled = 0.5;
  const m = Math.min(Math.max(input.mood, 0), 6);
  if (m === 0) moodScaled = 0.0;
  else if (m === 1) moodScaled = 0.12;
  else if (m === 2) moodScaled = 0.30;
  else if (m === 3) moodScaled = 0.52;
  else if (m === 4) moodScaled = 0.72;
  else if (m === 5) moodScaled = 0.88;
  else if (m === 6) moodScaled = 1.0;
  const moodPoints = moodScaled * 28;

  // 2. Care Hours (24%)
  let careHoursScaled = 0.5;
  const h = input.careHours;
  if (h < 20) careHoursScaled = 0.15;
  else if (h <= 40) careHoursScaled = 0.38;
  else if (h <= 60) careHoursScaled = 0.68;
  else careHoursScaled = 1.0;
  const careHoursPoints = careHoursScaled * 24;

  // 3. Sleep Hours (18%)
  let sleepScaled = 0.5;
  const s = input.sleepHours;
  if (s >= 7.5) sleepScaled = 0.05;
  else if (s >= 6.5) sleepScaled = 0.30;
  else if (s >= 5.5) sleepScaled = 0.60;
  else if (s >= 4.5) sleepScaled = 0.82;
  else sleepScaled = 1.0;
  const sleepPoints = sleepScaled * 18;

  // 4. Stress level 0..10 (20%)
  const str = Math.min(Math.max(input.stress, 0), 10);
  const stressScaled = str / 10;
  const stressPoints = stressScaled * 20;

  // 5. Personal Time (10%)
  const personalTimeScaled = input.personalTime ? 0.10 : 0.85;
  const personalTimePoints = personalTimeScaled * 10;

  const rawScore = moodPoints + careHoursPoints + sleepPoints + stressPoints + personalTimePoints;
  const score = Math.round(rawScore);

  let level: CareLoadLevel = 'low';
  if (score <= 34) {
    level = 'low';
  } else if (score <= 59) {
    level = 'moderate';
  } else if (score <= 74) {
    level = 'elevated';
  } else {
    level = 'high';
  }

  return {
    score,
    level,
    breakdown: {
      moodPoints: Math.round(moodPoints * 10) / 10,
      careHoursPoints: Math.round(careHoursPoints * 10) / 10,
      sleepPoints: Math.round(sleepPoints * 10) / 10,
      stressPoints: Math.round(stressPoints * 10) / 10,
      personalTimePoints: Math.round(personalTimePoints * 10) / 10,
    },
  };
}

export function scorePhq2(q1: number, q2: number): number {
  const v1 = Math.min(Math.max(q1, 0), 3);
  const v2 = Math.min(Math.max(q2, 0), 3);
  return v1 + v2;
}

export interface HistoryEntry {
  date: string;
  score: number;
  personalTime?: boolean;
}

export interface EarlyWarningResult {
  triggered: boolean;
  reason?: string;
  severity?: 'amber' | 'red';
}

export function evaluateEarlyWarning(history: HistoryEntry[]): EarlyWarningResult {
  if (history.length < 2) {
    return { triggered: false };
  }

  // Sort by date ascending
  const sorted = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const recent = sorted.slice(-5);

  // Rule 1: 2 consecutive days with score >= 60 -> Red alert
  if (recent.length >= 2) {
    const last2 = recent.slice(-2);
    if (last2[0].score >= 60 && last2[1].score >= 60) {
      return {
        triggered: true,
        reason: 'Sustained elevated CareLoad score for 2 consecutive days',
        severity: 'red',
      };
    }
  }

  // Rule 2: 3 consecutive days of increasing scores -> Amber alert
  if (recent.length >= 3) {
    const last3 = recent.slice(-3);
    if (last3[0].score < last3[1].score && last3[1].score < last3[2].score) {
      return {
        triggered: true,
        reason: 'CareLoad score increased continuously over 3 consecutive check-ins',
        severity: 'amber',
      };
    }
  }

  // Rule 3: 3 consecutive days with no personal time -> Amber alert
  if (recent.length >= 3) {
    const last3 = recent.slice(-3);
    if (
      last3[0].personalTime === false &&
      last3[1].personalTime === false &&
      last3[2].personalTime === false
    ) {
      return {
        triggered: true,
        reason: 'No personal time reported for 3 consecutive days',
        severity: 'amber',
      };
    }
  }

  return { triggered: false };
}
