import { COLORS } from '@/constants/theme';

export interface WeeklySignals {
  /** 
   * A weekly score calculated from two mood questions. 
   * Range: 0 (feeling good) to 6 (feeling very down).
   */
  phq2Score: number;
  
  /** 
   * Number of hours spent caregiving per week.
   * Represented by values like 10 (under 20h), 30 (20-40h), 50 (40-60h), or 70 (over 60h).
   */
  careHours: number;
  
  /** 
   * Average hours of sleep per night. (Optional)
   */
  sleepHours?: number;
  
  /** 
   * Physical activity level, measured as a percentage of the person's normal 30-day average. (Optional)
   * Example: 0.85 represents 85% of normal step count.
   */
  stepCountPct?: number;
  
  /** 
   * Number of social interactions (phone calls, visits, meetups) in the past week. (Optional)
   */
  socialScore?: number;
  
  /** 
   * Whether the caregiver was able to take a break or get help (respite care) this week. (Optional)
   */
  usedRespite?: boolean;
}

export interface CareLoadResult {
  /** 
   * The final burnout risk score from 0 (very low risk) to 100 (extreme risk). 
   */
  score: number;
  
  /** 
   * The category of burnout risk: "manageable", "moderate", "elevated", or "high". 
   */
  band: 'manageable' | 'moderate' | 'elevated' | 'high';
  
  /** 
   * The color indicator matching the category (green, teal, amber, or coral). 
   */
  bandColor: string;
  
  /** 
   * The change in score compared to last week. A positive number means the risk increased. (Optional)
   */
  weeklyDelta?: number;
}

/**
 * Calculates a score from 0 to 100 representing a caregiver's risk of burnout.
 * A higher score means a higher risk of burnout.
 * 
 * The algorithm uses six different signals, weighing the most critical indicators 
 * (like mood and caregiving hours) more heavily than optional ones (like steps or sleep).
 * 
 * If optional information is missing, we use a neutral midpoint value so the caregiver
 * is neither penalized nor rewarded for not providing it.
 * 
 * @param signals An object containing this week's measurements (mood, hours, sleep, etc.)
 * @param priorScore Last week's score, if available, to calculate the change over time.
 * @returns An object containing the score, risk category, matching color, and weekly change.
 */
export function computeCareLoad(signals: WeeklySignals, priorScore?: number): CareLoadResult {
  
  // 1. Calculate individual score for Question/Mood signal (weight: 28%)
  // Feeling down or losing interest is the strongest early sign of burnout.
  let phq2ScoreScaled = 0.5; // Default neutral value
  const mood = signals.phq2Score;
  if (mood === 0) phq2ScoreScaled = 0.0;
  else if (mood === 1) phq2ScoreScaled = 0.12;
  else if (mood === 2) phq2ScoreScaled = 0.30;
  else if (mood === 3) phq2ScoreScaled = 0.52;
  else if (mood === 4) phq2ScoreScaled = 0.72;
  else if (mood === 5) phq2ScoreScaled = 0.88;
  else if (mood === 6) phq2ScoreScaled = 1.0;

  // 2. Calculate score for Caregiving Hours signal (weight: 24%)
  // Spending more hours on caregiving increases overall load.
  let careHoursScaled = 0.5; // Default neutral value
  const hours = signals.careHours;
  if (hours < 20) careHoursScaled = 0.15;
  else if (hours >= 20 && hours <= 40) careHoursScaled = 0.38;
  else if (hours > 40 && hours <= 60) careHoursScaled = 0.68;
  else if (hours > 60) careHoursScaled = 1.0;

  // 3. Calculate score for Sleep signal (weight: 18%) - Optional
  // Getting less than 7.5 hours of sleep increases stress levels.
  let sleepHoursScaled = 0.5; // Neutral imputation if missing
  if (signals.sleepHours !== undefined && signals.sleepHours !== null) {
    const sleep = signals.sleepHours;
    if (sleep >= 7.5) sleepHoursScaled = 0.05;
    else if (sleep >= 6.5) sleepHoursScaled = 0.30;
    else if (sleep >= 5.5) sleepHoursScaled = 0.60;
    else if (sleep >= 4.5) sleepHoursScaled = 0.82;
    else sleepHoursScaled = 1.0;
  }

  // 4. Calculate score for Physical Activity/Steps signal (weight: 14%) - Optional
  // Moving less than usual is often a sign of feeling drained or having no personal time.
  let stepCountPctScaled = 0.5; // Neutral imputation if missing
  if (signals.stepCountPct !== undefined && signals.stepCountPct !== null) {
    // Standardize input if passed as a percentage (e.g. 85) instead of a decimal (e.g. 0.85)
    const steps = signals.stepCountPct > 2 ? signals.stepCountPct / 100 : signals.stepCountPct;
    if (steps >= 0.90) stepCountPctScaled = 0.05;
    else if (steps >= 0.70) stepCountPctScaled = 0.25;
    else if (steps >= 0.50) stepCountPctScaled = 0.55;
    else if (steps >= 0.30) stepCountPctScaled = 0.80;
    else stepCountPctScaled = 1.0;
  }

  // 5. Calculate score for Social Connection signal (weight: 10%) - Optional
  // Isolation is a major risk factor. Regular interaction with friends helps protect mental health.
  let socialScoreScaled = 0.5; // Neutral imputation if missing
  if (signals.socialScore !== undefined && signals.socialScore !== null) {
    const social = signals.socialScore;
    if (social >= 5) socialScoreScaled = 0.05;
    else if (social >= 3) socialScoreScaled = 0.30;
    else if (social >= 1) socialScoreScaled = 0.65;
    else socialScoreScaled = 1.0;
  }

  // 6. Calculate score for Respite Break signal (weight: 6%) - Optional
  // Taking a break or receiving external help provides vital relief.
  let usedRespiteScaled = 0.5; // Neutral imputation if missing
  if (signals.usedRespite !== undefined && signals.usedRespite !== null) {
    usedRespiteScaled = signals.usedRespite ? 0.10 : 0.85;
  }

  // Calculate the raw weighted score sum (out of 100)
  const rawScore = 
    (phq2ScoreScaled * 28) +
    (careHoursScaled * 24) +
    (sleepHoursScaled * 18) +
    (stepCountPctScaled * 14) +
    (socialScoreScaled * 10) +
    (usedRespiteScaled * 6);

  // Round to the nearest whole number
  const score = Math.round(rawScore);

  // Categorize the score into a risk category (band) and pick its matching color
  let band: 'manageable' | 'moderate' | 'elevated' | 'high';
  let bandColor: string;

  if (score <= 44) {
    band = 'manageable';
    bandColor = COLORS.green;
  } else if (score <= 64) {
    band = 'moderate';
    bandColor = COLORS.teal;
  } else if (score <= 79) {
    band = 'elevated';
    bandColor = COLORS.amber;
  } else {
    band = 'high';
    bandColor = COLORS.coral;
  }

  const result: CareLoadResult = {
    score,
    band,
    bandColor,
  };

  // If a prior score was provided, calculate the change compared to last week
  if (priorScore !== undefined && priorScore !== null) {
    result.weeklyDelta = score - priorScore;
  }

  return result;
}
