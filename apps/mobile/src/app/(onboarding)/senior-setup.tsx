import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';

export default function SeniorSetupScreen() {
  const router = useRouter();
  const [seniorName, setSeniorName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleNext = () => {
    router.push('/(onboarding)/notifications' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepText}>Step 3 of 4 (Optional)</Text>
        <Text style={styles.title}>Senior Voice Check-in</Text>
        <Text style={styles.subtitle}>
          Set up automated daily voice calls for your senior loved one to check on their wellbeing.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Senior Full Name</Text>
        <TextInput style={styles.input} placeholder="e.g. Mary Smith" placeholderTextColor={COLORS.textSec} value={seniorName} onChangeText={setSeniorName} />

        <Text style={styles.label}>Phone Number (for Automated Calls)</Text>
        <TextInput style={styles.input} placeholder="+1 (512) 555-0199" placeholderTextColor={COLORS.textSec} keyboardType="phone-pad" value={phoneNumber} onChangeText={setPhoneNumber} />

        <Pressable style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>

        <Pressable style={styles.skipBtn} onPress={handleNext}>
          <Text style={styles.skipText}>Skip for now</Text>
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
  form: { backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  label: { fontSize: FONT_SIZES.sm, color: COLORS.textPri, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: SPACING.md, paddingVertical: 12, color: COLORS.textPri, fontSize: FONT_SIZES.md, marginBottom: SPACING.md },
  button: { backgroundColor: COLORS.teal, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: SPACING.md },
  buttonText: { color: COLORS.bg, fontSize: FONT_SIZES.lg, fontWeight: 'bold' },
  skipBtn: { alignItems: 'center', marginTop: SPACING.md },
  skipText: { color: COLORS.textSec, fontSize: FONT_SIZES.sm },
});
