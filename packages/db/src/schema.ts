import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  json,
  pgEnum,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

// Enums
export const roleEnum = pgEnum('user_role', [
  'primary_caregiver',
  'family_member',
  'professional_caregiver',
  'admin',
]);

export const circleRoleEnum = pgEnum('circle_role', ['owner', 'admin', 'member']);

export const checkinStatusEnum = pgEnum('checkin_status', ['pending', 'completed', 'missed']);

export const alertSeverityEnum = pgEnum('alert_severity', ['low', 'medium', 'high', 'critical']);

export const callStatusEnum = pgEnum('call_status', [
  'scheduled',
  'in_progress',
  'completed',
  'failed',
  'cancelled',
  'no_answer',
  'busy',
  'voicemail',
]);

export const taskStatusEnum = pgEnum('task_status', ['pending', 'in_progress', 'completed']);

export const consentStatusEnum = pgEnum('consent_status', [
  'pending',
  'granted',
  'declined',
  'revoked',
]);

export const reportAlertLevelEnum = pgEnum('report_alert_level', ['green', 'amber', 'red']);

// Better Auth Tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  role: roleEnum('role').default('primary_caregiver'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Domain Tables
export const caregiverProfiles = pgTable('caregiver_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  relationship: text('relationship'),
  firstName: text('first_name'),
  weeklyHours: integer('weekly_hours'),
  timezone: text('timezone').default('America/Chicago'),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const careCircles = pgTable('care_circles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const circleMembers = pgTable(
  'circle_members',
  {
    id: text('id').primaryKey(),
    circleId: text('circle_id')
      .notNull()
      .references(() => careCircles.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: circleRoleEnum('role').default('member'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('circle_user_unique_idx').on(table.circleId, table.userId),
    index('circle_members_circle_idx').on(table.circleId),
    index('circle_members_user_idx').on(table.userId),
  ]
);

export const circleInvites = pgTable(
  'circle_invites',
  {
    id: text('id').primaryKey(),
    circleId: text('circle_id')
      .notNull()
      .references(() => careCircles.id, { onDelete: 'cascade' }),
    code: text('code').notNull().unique(),
    createdById: text('created_by_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at').notNull(),
    usedAt: timestamp('used_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('circle_invites_circle_idx').on(table.circleId)]
);

export const circleTasks = pgTable(
  'circle_tasks',
  {
    id: text('id').primaryKey(),
    circleId: text('circle_id')
      .notNull()
      .references(() => careCircles.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    assignedToId: text('assigned_to_id').references(() => user.id, { onDelete: 'set null' }),
    status: taskStatusEnum('status').default('pending'),
    dueDate: timestamp('due_date'),
    createdById: text('created_by_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('circle_tasks_circle_idx').on(table.circleId)]
);

export const pushTokens = pgTable(
  'push_tokens',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    platform: text('platform').default('expo'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('push_tokens_user_idx').on(table.userId)]
);

export const seniors = pgTable(
  'seniors',
  {
    id: text('id').primaryKey(),
    circleId: text('circle_id')
      .notNull()
      .references(() => careCircles.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    phoneNumber: text('phone_number'),
    timezone: text('timezone').default('America/Chicago'),
    preferredCallTime: text('preferred_call_time').default('10:00'),
    callDays: json('call_days').$type<string[]>().default(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
    consentStatus: consentStatusEnum('consent_status').default('pending'),
    pausedUntil: timestamp('paused_until'),
    nextCallAt: timestamp('next_call_at'),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('seniors_circle_idx').on(table.circleId),
    index('seniors_next_call_idx').on(table.nextCallAt),
  ]
);

export const callLogs = pgTable(
  'call_logs',
  {
    id: text('id').primaryKey(),
    seniorId: text('senior_id')
      .notNull()
      .references(() => seniors.id, { onDelete: 'cascade' }),
    circleId: text('circle_id')
      .notNull()
      .references(() => careCircles.id, { onDelete: 'cascade' }),
    twilioCallSid: text('twilio_call_sid'),
    status: callStatusEnum('status').default('scheduled'),
    outcome: text('outcome'),
    durationSeconds: integer('duration_seconds').default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('call_logs_senior_idx').on(table.seniorId),
    index('call_logs_circle_idx').on(table.circleId),
  ]
);

export const dailyReports = pgTable(
  'daily_reports',
  {
    id: text('id').primaryKey(),
    seniorId: text('senior_id')
      .notNull()
      .references(() => seniors.id, { onDelete: 'cascade' }),
    circleId: text('circle_id')
      .notNull()
      .references(() => careCircles.id, { onDelete: 'cascade' }),
    callId: text('call_id').references(() => callLogs.id, { onDelete: 'set null' }),
    reportDate: text('report_date').notNull(),
    wellbeingScore: integer('wellbeing_score').notNull(),
    alertLevel: reportAlertLevelEnum('alert_level').default('green'),
    flags: json('flags').$type<string[]>().default([]),
    summary: text('summary'),
    answers: json('answers').$type<Record<string, any>>().default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('daily_reports_senior_idx').on(table.seniorId),
    index('daily_reports_circle_idx').on(table.circleId),
  ]
);

export const checkins = pgTable(
  'checkins',
  {
    id: text('id').primaryKey(),
    circleId: text('circle_id').references(() => careCircles.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    seniorId: text('senior_id').references(() => seniors.id, { onDelete: 'set null' }),
    localDate: text('local_date').notNull(),
    mood: integer('mood').notNull(),
    stress: integer('stress').notNull(),
    sleepHours: integer('sleep_hours').notNull(),
    careHours: integer('care_hours').notNull(),
    personalTime: boolean('personal_time').notNull().default(false),
    note: text('note'),
    score: integer('score').notNull(),
    level: text('level').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('user_date_unique_idx').on(table.userId, table.localDate),
    index('checkins_circle_idx').on(table.circleId),
    index('checkins_user_idx').on(table.userId),
    index('checkins_senior_idx').on(table.seniorId),
  ]
);

export const phq2Responses = pgTable(
  'phq2_responses',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    q1Score: integer('q1_score').notNull(),
    q2Score: integer('q2_score').notNull(),
    totalScore: integer('total_score').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('phq2_user_idx').on(table.userId)]
);

export const burnoutAlerts = pgTable(
  'burnout_alerts',
  {
    id: text('id').primaryKey(),
    circleId: text('circle_id').references(() => careCircles.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
    seniorId: text('senior_id').references(() => seniors.id, { onDelete: 'set null' }),
    severity: alertSeverityEnum('severity').default('medium'),
    message: text('message').notNull(),
    isResolved: boolean('is_resolved').default(false),
    acknowledgedById: text('acknowledged_by_id').references(() => user.id, { onDelete: 'set null' }),
    acknowledgedAt: timestamp('acknowledged_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('burnout_alerts_circle_idx').on(table.circleId),
    index('burnout_alerts_user_idx').on(table.userId),
    index('burnout_alerts_senior_idx').on(table.seniorId),
  ]
);

export const scheduledCalls = pgTable(
  'scheduled_calls',
  {
    id: text('id').primaryKey(),
    circleId: text('circle_id')
      .notNull()
      .references(() => careCircles.id, { onDelete: 'cascade' }),
    seniorId: text('senior_id')
      .notNull()
      .references(() => seniors.id, { onDelete: 'cascade' }),
    scheduledAt: timestamp('scheduled_at').notNull(),
    nextCallAt: timestamp('next_call_at'),
    status: callStatusEnum('status').default('scheduled'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('scheduled_calls_circle_idx').on(table.circleId),
    index('scheduled_calls_senior_idx').on(table.seniorId),
    index('scheduled_calls_next_call_idx').on(table.nextCallAt),
  ]
);

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  details: json('details').$type<Record<string, any>>().default({}),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
