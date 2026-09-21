import { describe, it, expect } from 'vitest';
import {
  buildReport,
  detectEmergency,
  detectPain,
  DailyCheckinAnswers,
} from './report-builder.js';

describe('detectEmergency', () => {
  it('detects emergency keywords in speech text', () => {
    expect(detectEmergency('I had a bad fall on the floor')).toBe(true);
    expect(detectEmergency('I can\'t breathe well')).toBe(true);
    expect(detectEmergency('Please call an ambulance')).toBe(true);
    expect(detectEmergency('I am doing fine today')).toBe(false);
  });
});

describe('detectPain', () => {
  it('detects pain keywords in speech text', () => {
    expect(detectPain('My hip hurts a lot')).toBe(true);
    expect(detectPain('I have a bad headache')).toBe(true);
    expect(detectPain('Just resting on the couch')).toBe(false);
  });
});

describe('buildReport', () => {
  it('builds a green report when all answers are positive', () => {
    const answers: DailyCheckinAnswers = {
      q1_wellbeing: 5,
      q2_pain: false,
      q3_sleep: 5,
      q4_mood: 5,
      q5_meals: true,
      q6_callback_requested: false,
    };
    const report = buildReport(answers);
    expect(report.wellbeingScore).toBe(10);
    expect(report.alertLevel).toBe('green');
    expect(report.flags).toHaveLength(0);
  });

  it('builds an amber report when pain and low mood are flagged', () => {
    const answers: DailyCheckinAnswers = {
      q1_wellbeing: 3,
      q2_pain: true,
      q3_sleep: 3,
      q4_mood: 2,
      q5_meals: true,
      q6_callback_requested: true,
    };
    const report = buildReport(answers);
    expect(report.alertLevel).toBe('amber');
    expect(report.flags).toContain('Physical pain or discomfort reported');
    expect(report.flags).toContain('Requested a call back from caregiver');
  });

  it('builds a red report when Q1 is 1 or score is <= 4', () => {
    const answers: DailyCheckinAnswers = {
      q1_wellbeing: 1,
      q2_pain: true,
      q3_sleep: 1,
      q4_mood: 1,
      q5_meals: false,
      q6_callback_requested: true,
    };
    const report = buildReport(answers);
    expect(report.alertLevel).toBe('red');
    expect(report.wellbeingScore).toBeLessThanOrEqual(4);
  });
});
