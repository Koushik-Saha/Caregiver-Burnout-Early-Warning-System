import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleReset = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    setSent(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Reset Password</Text>

        {sent ? (
          <View style={styles.successContainer}>
            <Text style={styles.icon}>✉️</Text>
            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.subtitle}>
              We sent password reset instructions to {email}.
            </Text>
            <Pressable style={styles.button} onPress={() => router.push('/(auth)/sign-in' as any)}>
              <Text style={styles.buttonText}>Back to Sign In</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you instructions to reset your password.
            </Text>

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor={COLORS.textSec}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Pressable style={styles.button} onPress={handleReset}>
              <Text style={styles.buttonText}>Send Reset Link</Text>
            </Pressable>

            <Pressable style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backText}>Cancel</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: SPACING.lg, justifyContent: 'center' },
  form: { backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.textPri, marginBottom: SPACING.sm },
  subtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSec, marginBottom: SPACING.lg, lineHeight: 20 },
  label: { fontSize: FONT_SIZES.sm, color: COLORS.textPri, marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: SPACING.md, paddingVertical: 12, color: COLORS.textPri, fontSize: FONT_SIZES.md, marginBottom: SPACING.lg },
  button: { backgroundColor: COLORS.teal, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: COLORS.bg, fontSize: FONT_SIZES.lg, fontWeight: 'bold' },
  backBtn: { alignItems: 'center', marginTop: SPACING.md },
  backText: { color: COLORS.textSec, fontSize: FONT_SIZES.sm },
  successContainer: { alignItems: 'center', paddingVertical: SPACING.md },
  icon: { fontSize: 40, marginBottom: SPACING.sm },
  successTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.textPri, marginBottom: SPACING.xs },
});
