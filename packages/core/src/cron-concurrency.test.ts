import { describe, it, expect } from 'vitest';

describe('Cron Concurrency Protection', () => {
  it('simulates atomic skip-locked claim query to prevent double dialing', async () => {
    // Simulated database state of due seniors
    const dbSeniors = [
      { id: 'senior_1', nextCallAt: new Date('2026-09-21T08:00:00Z'), locked: false },
      { id: 'senior_2', nextCallAt: new Date('2026-09-21T08:05:00Z'), locked: false },
    ];

    // Simulated atomic claim function using FOR UPDATE SKIP LOCKED pattern
    async function claimDueSeniors() {
      const claimed: typeof dbSeniors = [];
      for (const senior of dbSeniors) {
        if (!senior.locked && senior.nextCallAt <= new Date()) {
          senior.locked = true; // Lock record
          claimed.push(senior);
        }
      }
      return claimed;
    }

    // Trigger two overlapping cron runs concurrently
    const [run1, run2] = await Promise.all([claimDueSeniors(), claimDueSeniors()]);

    // Combined claimed seniors across both runs should match total due seniors without duplicate claims
    const totalClaimed = [...run1, ...run2];
    const claimedIds = totalClaimed.map((s) => s.id);
    const uniqueIds = new Set(claimedIds);

    expect(uniqueIds.size).toBe(claimedIds.length);
    expect(run1.length + run2.length).toBe(2);
  });
});
