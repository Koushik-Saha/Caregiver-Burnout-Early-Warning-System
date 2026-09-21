import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';

const RELATIONSHIPS = [
  { id: 'parent', label: 'Aging parent or grandparent', emoji: '👴' },
  { id: 'spouse', label: 'Spouse or partner', emoji: '💑' },
  { id: 'child', label: 'Child with special needs', emoji: '👶' },
  { id: 'other', label: 'Other family member or friend', emoji: '🤝' },
];

export default function WhoYouCareForScreen() {
  const router = useRouter();
  const [relationship, setRelationship] = useState('parent');
  const [firstName, setFirstName] = useState('');
  const [weeklyHours, setWeeklyHours] = useState('20');
  const autoTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Chicago';

  const handleContinue = () => {
    router.push('/(onboarding)/circle-setup' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.stepText}>Step 1 of 4</Text>
          <Text style={styles.title}>Who are you caring for?</Text>
          <Text style={styles.subtitle}>
            Tell us about your caregiving role so CareLoad can tailor your support.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Relationship</Text>
          <View style={styles.optionsContainer}>
            {RELATIONSHIPS.map((item) => {
              const isSelected = relationship === item.id;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  onPress={() => setRelationship(item.id)}
                >
                  <Text style={styles.emoji}>{item.emoji}</Text>
                  <Text style={styles.optionText}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Recipient First Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Mary"
            placeholderTextColor={COLORS.textSec}
            value={firstName}
            onChangeText={setFirstName}
          />

          <Text style={styles.label}>Estimated Weekly Care Hours</Text>
          <TextInput
            style={styles.input}
            placeholder="20"
            placeholderTextColor={COLORS.textSec}
            keyboardType="number-pad"
            value={weeklyHours}
            onChangeText={setWeeklyHours}
          />

          <View style={styles.tzBox}>
            <Text style={styles.tzLabel}>Auto-detected Timezone:</Text>
            <Text style={styles.tzValue}>{autoTimezone}</Text>
          </View>
        </View>

        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            ℹ️ <strong>Disclaimer:</strong> CareLoad is an early-warning tool and does not provide medical diagnosis or emergency dispatch.
          </Text>
        </View>

        <Pressable style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: SPACING.lg },
  header: { marginBottom: SPACING.lg },
  stepText: { fontSize: FONT_SIZES.xs, color: COLORS.teal, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: 'bold', color: COLORS.textPri, marginBottom: 6 },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSec, lineHeight: 22 },
  form: { marginBottom: SPACING.lg },
  label: { fontSize: FONT_SIZES.sm, color: COLORS.textPri, fontWeight: '600', marginBottom: 8, marginTop: SPACING.md },
  optionsContainer: { marginBottom: SPACING.sm },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.xs },
  optionCardSelected: { borderColor: COLORS.teal, backgroundColor: 'rgba(20, 184, 166, 0.08)' },
  emoji: { fontSize: 22, marginRight: SPACING.md },
  optionText: { fontSize: FONT_SIZES.md, color: COLORS.textPri, fontWeight: '500' },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: SPACING.md, paddingVertical: 12, color: COLORS.textPri, fontSize: FONT_SIZES.md },
  tzBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: 10, marginTop: SPACING.md },
  tzLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSec },
  tzValue: { fontSize: FONT_SIZES.xs, color: COLORS.teal, fontWeight: 'bold' },
  disclaimerBox: { backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: SPACING.md, borderRadius: 10, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  disclaimerText: { fontSize: FONT_SIZES.xs, color: COLORS.textSec, lineHeight: 18 },
  button: { backgroundColor: COLORS.teal, height: 54, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: COLORS.bg, fontSize: FONT_SIZES.lg, fontWeight: 'bold' },
});
