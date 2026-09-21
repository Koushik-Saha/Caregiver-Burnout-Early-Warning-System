import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';

export default function NotificationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Request notification permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        const tokenData = await Notifications.getExpoPushTokenAsync().catch(() => null);
        if (tokenData?.data) {
          // Register token with backend
          const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
          await fetch(`${apiBaseUrl}/api/push-tokens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: tokenData.data, platform: 'expo' }),
          }).catch(() => null);
        }
      }

      // Update caregiver profile onboardingCompleted state
      const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      await fetch(`${apiBaseUrl}/api/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboardingCompleted: true }),
      }).catch(() => null);

      router.replace('/(tabs)/home' as any);
    } catch (err) {
      router.replace('/(tabs)/home' as any);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.stepText}>Step 4 of 4</Text>
        <Text style={styles.icon}>🔔</Text>
        <Text style={styles.title}>Enable Push Notifications</Text>
        <Text style={styles.subtitle}>
          Stay informed with immediate alerts when senior check-ins detect red/amber warnings or when family members need assistance.
        </Text>

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleFinish}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.bg} />
          ) : (
            <Text style={styles.buttonText}>Enable Notifications & Finish</Text>
          )}
        </Pressable>

        <Pressable style={styles.skipBtn} onPress={handleFinish}>
          <Text style={styles.skipText}>Maybe later</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: SPACING.lg, justifyContent: 'center' },
  content: { backgroundColor: COLORS.surface, padding: SPACING.xl, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  stepText: { fontSize: FONT_SIZES.xs, color: COLORS.teal, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  icon: { fontSize: 56, marginBottom: SPACING.md },
  title: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.textPri, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSec, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl },
  button: { backgroundColor: COLORS.teal, width: '100%', height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: COLORS.bg, fontSize: FONT_SIZES.md, fontWeight: 'bold' },
  skipBtn: { marginTop: SPACING.md },
  skipText: { color: COLORS.textSec, fontSize: FONT_SIZES.sm },
});
