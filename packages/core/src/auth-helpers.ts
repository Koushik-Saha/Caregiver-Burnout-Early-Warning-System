export interface SessionUser {
  id: string;
  email: string;
  name?: string;
}

export interface Session {
  user?: SessionUser | null;
  session?: {
    id: string;
    expiresAt: Date | string;
  } | null;
}

export interface CircleMemberRecord {
  userId: string;
  circleId: string;
  role: string;
}

export function requireSession(sessionData: Session | null | undefined): SessionUser {
  if (!sessionData || !sessionData.user || !sessionData.user.id) {
    throw new Error('UNAUTHORIZED: Authentication session is required');
  }
  return sessionData.user;
}

export function requireCircleMember(
  userId: string,
  circleId: string,
  members: CircleMemberRecord[]
): CircleMemberRecord {
  const member = members.find(
    (m) => m.userId === userId && m.circleId === circleId
  );
  if (!member) {
    throw new Error('FORBIDDEN: User is not a member of this care circle');
  }
  return member;
}
