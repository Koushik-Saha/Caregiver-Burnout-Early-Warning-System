export interface DailyCheckinAnswers {
  q1_wellbeing?: number | string; // 1..5 scale (5 = great, 1 = poor)
  q2_pain?: boolean | string; // pain reported
  q3_sleep?: number | string; // sleep quality
  q4_mood?: number | string; // mood quality
  q5_meals?: boolean | string; // eating ok
  q6_callback_requested?: boolean | string; // request caregiver call back
}

export type ReportAlertLevel = 'green' | 'amber' | 'red';

export interface DailyReportResult {
  wellbeingScore: number; // 0..10 scale
  alertLevel: ReportAlertLevel;
  flags: string[];
  summary: string;
  answers: Record<string, any>;
}

const EMERGENCY_KEYWORDS = [
  'fall', 'fell', 'help', 'emergency', 'chest pain',
  "can't breathe", 'cannot breathe', 'ambulance', '911',
  'hurt bad', 'bleeding', 'collapsed', 'passed out'
];

const PAIN_KEYWORDS = [
  'pain', 'hurts', 'ache', 'sore', 'headache', 'stomach ache', 'back pain'
];

export function detectEmergency(speechText: string): boolean {
  if (!speechText) return false;
  const lower = speechText.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
}

export function detectPain(speechText: string): boolean {
  if (!speechText) return false;
  const lower = speechText.toLowerCase();
  return PAIN_KEYWORDS.some((kw) => lower.includes(kw));
}

export function buildReport(
  answers: DailyCheckinAnswers,
  last7Reports: DailyReportResult[] = []
): DailyReportResult {
  const flags: string[] = [];
  let totalPoints = 10;
  let deductions = 0;

  // Q1: Overall Wellbeing (1..5)
  const q1Val = typeof answers.q1_wellbeing === 'number'
    ? answers.q1_wellbeing
    : parseInt(String(answers.q1_wellbeing || '3'), 10);

  if (q1Val <= 2) {
    flags.push('Low overall wellbeing reported');
    deductions += 3;
  }

  // Q2: Physical Pain
  const painReported =
    answers.q2_pain === true ||
    answers.q2_pain === 'yes' ||
    answers.q2_pain === '1';

  if (painReported) {
    flags.push('Physical pain or discomfort reported');
    deductions += 2;
  }

  // Q3: Sleep
  const q3Val = typeof answers.q3_sleep === 'number'
    ? answers.q3_sleep
    : parseInt(String(answers.q3_sleep || '3'), 10);

  if (q3Val <= 2) {
    flags.push('Poor sleep quality reported');
    deductions += 2;
  }

  // Q4: Mood
  const q4Val = typeof answers.q4_mood === 'number'
    ? answers.q4_mood
    : parseInt(String(answers.q4_mood || '3'), 10);

  if (q4Val <= 2) {
    flags.push('Low mood or spirit reported');
    deductions += 2;
  }

  // Q5: Meals
  const skippedMeals =
    answers.q5_meals === false ||
    answers.q5_meals === 'no' ||
    answers.q5_meals === '2';

  if (skippedMeals) {
    flags.push('Skipped or trouble with meals reported');
    deductions += 1;
  }

  // Q6: Callback Request
  const callbackRequested =
    answers.q6_callback_requested === true ||
    answers.q6_callback_requested === 'yes' ||
    answers.q6_callback_requested === '1';

  if (callbackRequested) {
    flags.push('Requested a call back from caregiver');
  }

  const wellbeingScore = Math.max(0, totalPoints - deductions);

  // Alert Level determination
  let alertLevel: ReportAlertLevel = 'green';
  if (wellbeingScore <= 4 || q1Val <= 1) {
    alertLevel = 'red';
  } else if (wellbeingScore <= 7 || flags.length > 0) {
    alertLevel = 'amber';
  }

  // Construct summary text
  let summary = `Check-in completed with a wellbeing score of ${wellbeingScore}/10 (${alertLevel.toUpperCase()}).`;
  if (flags.length > 0) {
    summary += ` Noted items: ${flags.join(', ')}.`;
  } else {
    summary += ' All daily check-in responses were positive.';
  }

  return {
    wellbeingScore,
    alertLevel,
    flags,
    summary,
    answers: { ...answers },
  };
}
