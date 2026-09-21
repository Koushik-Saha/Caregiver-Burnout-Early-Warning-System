/**
 * CareLoad Unified Theme & Design System
 * Engineered for stressed caregivers: high contrast, dark mode, calming accents.
 */

export const COLORS = {
  bg: '#0D1117',        // Main canvas background
  surface: '#161B22',   // Card background
  card: '#1C2333',      // Embedded card / input area
  border: '#2D3748',    // Subtle border
  teal: '#2DD4BF',      // Primary active / highlight verb color
  tealDark: '#14B8A6',  // Hover / pressed state
  amber: '#F59E0B',     // Moderate load / caution badge
  coral: '#F87171',     // High burnout / alert color
  green: '#34D399',     // Good / healthy state
  textPri: '#F0F6FC',   // High-contrast primary text
  textSec: '#8B98A8',   // Medium-contrast secondary text
  textMut: '#4A5568',   // Muted hints / captions
  overlay: 'rgba(13, 17, 23, 0.85)', // Modal backdrop
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
  xs: 11,
  sm: 13,
  md: 15, // Accessible base body font size
  lg: 18,
  xl: 24,
  xxl: 32,
} as const;

export const BORDER_RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 16,
  full: 9999,
} as const;

export const SHADOWS = {
  card: {
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.25)',
  },
  button: {
    boxShadow: '0px 2px 6px rgba(45, 212, 191, 0.3)',
  },
} as const;

export const UX_RULES = {
  minFontSize: 15,
  minTouchTarget: 48,
  maxSentencesPerScreen: 3,
  validButtonVerbs: [
    'Save',
    'Continue',
    'Back',
    'Start',
    'Stop',
    'Edit',
    'Add',
    'Delete',
    'Call',
    'Share',
    'Yes',
    'No',
    'Close',
    'Cancel',
  ],
} as const;

export const theme = {
  colors: COLORS,
  spacing: SPACING,
  fontSizes: FONT_SIZES,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  uxRules: UX_RULES,
} as const;

export type Theme = typeof theme;
export type Colors = typeof COLORS;
export type Spacing = typeof SPACING;
export type FontSizes = typeof FONT_SIZES;
export type BorderRadius = typeof BORDER_RADIUS;
export type Shadows = typeof SHADOWS;
export type UxRules = typeof UX_RULES;
