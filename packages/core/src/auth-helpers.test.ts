import { describe, it, expect } from 'vitest';
import { requireSession, requireCircleMember } from './auth-helpers.js';

describe('requireSession', () => {
  it('returns user when session is valid', () => {
    const session = {
      user: { id: 'user_123', email: 'test@example.com', name: 'Test User' },
    };
    const user = requireSession(session);
    expect(user.id).toBe('user_123');
  });

  it('throws UNAUTHORIZED when session is missing or null', () => {
    expect(() => requireSession(null)).toThrow('UNAUTHORIZED');
    expect(() => requireSession({})).toThrow('UNAUTHORIZED');
  });
});

describe('requireCircleMember', () => {
  const members = [
    { userId: 'user_1', circleId: 'circle_1', role: 'owner' },
    { userId: 'user_2', circleId: 'circle_1', role: 'member' },
  ];

  it('returns member record when user belongs to circle', () => {
    const member = requireCircleMember('user_1', 'circle_1', members);
    expect(member.role).toBe('owner');
  });

  it('throws FORBIDDEN when user does not belong to circle', () => {
    expect(() => requireCircleMember('user_3', 'circle_1', members)).toThrow('FORBIDDEN');
  });
});
