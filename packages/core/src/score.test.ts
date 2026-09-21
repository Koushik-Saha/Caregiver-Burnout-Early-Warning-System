import { describe, it, expect } from 'vitest';
import {
  computeCareLoadScore,
  scorePhq2,
  evaluateEarlyWarning,
  CareLoadInput,
} from './score.js';

describe('computeCareLoadScore', () => {
  it('calculates low score (score <= 34)', () => {
    const input: CareLoadInput = {
      mood: 0, // 0 pts
      careHours: 10, // 3.6 pts
      sleepHours: 8, // 0.9 pts
      stress: 1, // 2.0 pts
      personalTime: true, // 1.0 pt
    };
    const res = computeCareLoadScore(input);
    expect(res.score).toBeLessThanOrEqual(34);
    expect(res.level).toBe('low');
  });

  it('tests boundary value 34 vs 35 (low vs moderate)', () => {
    // Custom inputs to hit boundary
    const lowInput: CareLoadInput = {
      mood: 1, // 3.36 pts
      careHours: 15, // 3.6 pts
      sleepHours: 7, // 5.4 pts
      stress: 6, // 12 pts
      personalTime: true, // 1 pt -> total ~25.36
    };
    const resLow = computeCareLoadScore(lowInput);
    expect(resLow.score).toBeLessThanOrEqual(34);
    expect(resLow.level).toBe('low');

    const modInput: CareLoadInput = {
      mood: 3, // 14.56 pts
      careHours: 30, // 9.12 pts
      sleepHours: 6.5, // 5.4 pts
      stress: 3, // 6 pts
      personalTime: false, // 8.5 pts -> total ~43.58
    };
    const resMod = computeCareLoadScore(modInput);
    expect(resMod.score).toBeGreaterThanOrEqual(35);
    expect(resMod.level).toBe('moderate');
  });

  it('tests boundary value 59 vs 60 (moderate vs elevated)', () => {
    const modInput: CareLoadInput = {
      mood: 3, // 14.56 pts
      careHours: 50, // 16.32 pts
      sleepHours: 6.0, // 10.8 pts
      stress: 5, // 10 pts
      personalTime: true, // 1 pt -> total ~42.68
    };
    const resMod = computeCareLoadScore(modInput);
    expect(resMod.score).toBeLessThanOrEqual(59);

    const elevatedInput: CareLoadInput = {
      mood: 4, // 20.16 pts
      careHours: 50, // 16.32 pts
      sleepHours: 5.0, // 14.76 pts
      stress: 7, // 14 pts
      personalTime: false, // 8.5 pts -> total ~73.74
    };
    const resElevated = computeCareLoadScore(elevatedInput);
    expect(resElevated.score).toBeGreaterThanOrEqual(60);
    expect(resElevated.level).toBe('elevated');
  });

  it('calculates high risk score (score >= 75)', () => {
    const highInput: CareLoadInput = {
      mood: 6, // 28 pts
      careHours: 70, // 24 pts
      sleepHours: 4.0, // 18 pts
      stress: 9, // 18 pts
      personalTime: false, // 8.5 pts -> total 96.5
    };
    const res = computeCareLoadScore(highInput);
    expect(res.score).toBeGreaterThanOrEqual(75);
    expect(res.level).toBe('high');
  });
});

describe('scorePhq2', () => {
  it('calculates PHQ-2 sum correctly', () => {
    expect(scorePhq2(0, 0)).toBe(0);
    expect(scorePhq2(1, 2)).toBe(3);
    expect(scorePhq2(3, 3)).toBe(6);
    expect(scorePhq2(5, 5)).toBe(6); // max cap
  });
});

describe('evaluateEarlyWarning', () => {
  it('detects sustained elevated score >= 60 for 2 consecutive days', () => {
    const history = [
      { date: '2026-09-18', score: 40 },
      { date: '2026-09-19', score: 65 },
      { date: '2026-09-20', score: 68 },
    ];
    const res = evaluateEarlyWarning(history);
    expect(res.triggered).toBe(true);
    expect(res.severity).toBe('red');
  });

  it('detects 3 consecutive days of increasing scores', () => {
    const history = [
      { date: '2026-09-18', score: 30 },
      { date: '2026-09-19', score: 40 },
      { date: '2026-09-20', score: 52 },
    ];
    const res = evaluateEarlyWarning(history);
    expect(res.triggered).toBe(true);
    expect(res.severity).toBe('amber');
  });

  it('detects 3 consecutive days with no personal time', () => {
    const history = [
      { date: '2026-09-18', score: 40, personalTime: false },
      { date: '2026-09-19', score: 38, personalTime: false },
      { date: '2026-09-20', score: 42, personalTime: false },
    ];
    const res = evaluateEarlyWarning(history);
    expect(res.triggered).toBe(true);
    expect(res.severity).toBe('amber');
  });

  it('returns false when no warning criteria met', () => {
    const history = [
      { date: '2026-09-18', score: 45, personalTime: true },
      { date: '2026-09-19', score: 40, personalTime: true },
      { date: '2026-09-20', score: 42, personalTime: true },
    ];
    const res = evaluateEarlyWarning(history);
    expect(res.triggered).toBe(false);
  });
});
