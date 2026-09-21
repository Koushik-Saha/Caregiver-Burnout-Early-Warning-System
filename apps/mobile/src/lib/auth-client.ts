import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const authClient = createAuthClient({
  baseURL: apiBaseUrl,
  async storage() {
    return {
      getItem: (key: string) => SecureStore.getItemAsync(key),
      setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
      removeItem: (key: string) => SecureStore.deleteItemAsync(key),
    };
  },
});
