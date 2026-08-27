/**
 * Design system tokens for CareLoad.
 * Built specifically for stressed, exhausted caregivers.
 */

export const COLORS = {
  bg: '#0D1117',      // Dark, easy on tired eyes
  surface: '#161B22', // Cards
  card: '#1C2333',    // Input areas
  border: '#2D3748',
  teal: '#2DD4BF',    // Primary action color (calming)
  amber: '#F59E0B',   // Moderate warning
  coral: '#F87171',   // Elevated alert
  green: '#34D399',   // Good / manageable
  textPri: '#F0F6FC', // Primary text
  textSec: '#8B98A8', // Secondary text
  textMut: '#4A5568', // Hints, captions
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FONT_SIZES = {
  xs: 11,  // Warning: Do not use for user-facing content (below minimum accessibility threshold)
  sm: 13,  // Warning: Do not use for user-facing content (below minimum accessibility threshold)
  md: 15,  // Minimum accessibility threshold for main text
  lg: 18,
  xl: 24,
  xxl: 32,
} as const;

/**
 * Core CareLoad UX Rules:
 * 1. Minimum font size: 15px (caregivers are often 40-65 years old) - use FONT_SIZES.md or higher.
 * 2. Minimum touch target: 48x48px for every button.
 * 3. Maximum text per screen: 3 short sentences.
 * 4. Every button label: plain English verb ("Save", "Continue", NOT "Submit" or "Proceed").
 * 5. Never show more than one main action per screen.
 */
export const UX_RULES = {
  minFontSize: 15,
  minTouchTarget: 48,
  maxSentencesPerScreen: 3,
  validButtonVerbs: ['Save', 'Continue', 'Back', 'Start', 'Stop', 'Edit', 'Add', 'Delete', 'Call', 'Share', 'Yes', 'No', 'Close', 'Cancel'],
} as const;

export const theme = {
  colors: COLORS,
  spacing: SPACING,
  fontSizes: FONT_SIZES,
  uxRules: UX_RULES,
} as const;

export type Theme = typeof theme;
export type Colors = typeof COLORS;
export type Spacing = typeof SPACING;
export type FontSizes = typeof FONT_SIZES;
export type UxRules = typeof UX_RULES;
