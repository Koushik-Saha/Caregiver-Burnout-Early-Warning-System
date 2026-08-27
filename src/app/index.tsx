import React from 'react';
import { Redirect } from 'expo-router';

/**
 * The entry point of the CareLoad app.
 * Automatically routes new users to the Welcome screen.
 */
export default function AppEntry() {
  return <Redirect href="/welcome" />;
}
