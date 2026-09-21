import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { authClient } from '@/lib/auth-client';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (res.error) {
        Alert.alert('Sign Up Failed', res.error.message || 'Registration failed');
      } else {
        router.replace('/(onboarding)/who-you-care-for' as any);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Create Account</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} placeholder="Jane Doe" placeholderTextColor={COLORS.textSec} value={name} onChangeText={setName} />

        <Text style={styles.label}>Email Address</Text>
        <TextInput style={styles.input} placeholder="name@example.com" placeholderTextColor={COLORS.textSec} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />

        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} placeholder="At least 8 characters" placeholderTextColor={COLORS.textSec} secureTextEntry value={password} onChangeText={setPassword} />

        <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSignUp} disabled={loading}>
          {loading ? <ActivityIndicator color={COLORS.bg} /> : <Text style={styles.buttonText}>Get Started</Text>}
        </Pressable>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => router.push('/(auth)/sign-in' as any)}>
            <Text style={styles.linkText}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: SPACING.lg, justifyContent: 'center' },
  form: { backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.textPri, marginBottom: SPACING.lg },
  label: { fontSize: FONT_SIZES.sm, color: COLORS.textPri, marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: SPACING.md, paddingVertical: 12, color: COLORS.textPri, fontSize: FONT_SIZES.md, marginBottom: SPACING.md },
  button: { backgroundColor: COLORS.teal, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: SPACING.md },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: COLORS.bg, fontSize: FONT_SIZES.lg, fontWeight: 'bold' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
  footerText: { color: COLORS.textSec, fontSize: FONT_SIZES.sm },
  linkText: { color: COLORS.teal, fontSize: FONT_SIZES.sm, fontWeight: 'bold' },
});
