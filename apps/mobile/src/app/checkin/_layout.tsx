import React from 'react';
import { Stack } from 'expo-router';

/**
 * Nested layout for the check-in flow.
 * Disables headers for all check-in screens.
 */
export default function CheckinLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
