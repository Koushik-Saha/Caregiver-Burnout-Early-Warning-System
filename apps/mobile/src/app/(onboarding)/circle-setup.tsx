import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';

export default function CircleSetupScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [circleName, setCircleName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const handleContinue = () => {
    router.push('/(onboarding)/senior-setup' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepText}>Step 2 of 4</Text>
        <Text style={styles.title}>Care Circle Setup</Text>
        <Text style={styles.subtitle}>
          Care Circles let family members share updates, delegate tasks, and receive alerts.
        </Text>
      </View>

      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggleBtn, mode === 'create' && styles.toggleBtnActive]}
          onPress={() => setMode('create')}
        >
          <Text style={[styles.toggleText, mode === 'create' && styles.toggleTextActive]}>
            Create New Circle
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleBtn, mode === 'join' && styles.toggleBtnActive]}
          onPress={() => setMode('join')}
        >
          <Text style={[styles.toggleText, mode === 'join' && styles.toggleTextActive]}>
            Join Existing Circle
          </Text>
        </Pressable>
      </View>

      <View style={styles.form}>
        {mode === 'create' ? (
          <>
            <Text style={styles.label}>Care Circle Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Smith Family Care Circle"
              placeholderTextColor={COLORS.textSec}
              value={circleName}
              onChangeText={setCircleName}
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>6-Character Invite Code</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. ABC123"
              placeholderTextColor={COLORS.textSec}
              autoCapitalize="characters"
              maxLength={6}
              value={inviteCode}
              onChangeText={setInviteCode}
            />
          </>
        )}

        <Pressable style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: SPACING.lg, justifyContent: 'center' },
  header: { marginBottom: SPACING.lg },
  stepText: { fontSize: FONT_SIZES.xs, color: COLORS.teal, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: 'bold', color: COLORS.textPri, marginBottom: 6 },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSec, lineHeight: 22 },
  toggleRow: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 12, padding: 4, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  toggleBtnActive: { backgroundColor: COLORS.teal },
  toggleText: { fontSize: FONT_SIZES.sm, color: COLORS.textSec, fontWeight: '600' },
  toggleTextActive: { color: COLORS.bg },
  form: { backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  label: { fontSize: FONT_SIZES.sm, color: COLORS.textPri, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: SPACING.md, paddingVertical: 12, color: COLORS.textPri, fontSize: FONT_SIZES.md, marginBottom: SPACING.lg },
  button: { backgroundColor: COLORS.teal, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: COLORS.bg, fontSize: FONT_SIZES.lg, fontWeight: 'bold' },
});
