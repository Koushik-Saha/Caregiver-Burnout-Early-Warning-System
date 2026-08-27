import React from 'react';
import { Stack } from 'expo-router';

/**
 * Nested layout for the onboarding flow.
 * Disables headers for all onboarding screens.
 */
export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
