import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ReportDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const report = {
    id,
    seniorName: 'Mary Smith',
    date: 'Sept 20, 2026',
    wellbeingScore: 9,
    alertLevel: 'green',
    summary: 'Check-in completed with a wellbeing score of 9/10 (GREEN). All daily check-in responses were positive.',
    flags: [],
    answers: {
      q1_wellbeing: 5,
      q2_pain: false,
      q3_sleep: 5,
      q4_mood: 4,
      q5_meals: true,
      q6_callback_requested: false,
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPri} />
          </Pressable>
          <Text style={styles.title}>Daily Check-in Report</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.dateText}>{report.date} - {report.seniorName}</Text>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreVal}>{report.wellbeingScore}/10</Text>
            <View style={[styles.badge, report.alertLevel === 'green' ? styles.bgGreen : styles.bgAmber]}>
              <Text style={styles.badgeText}>{report.alertLevel.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.summaryText}>{report.summary}</Text>
        </View>

        <Text style={styles.sectionTitle}>Question Answers</Text>
        <View style={styles.answersCard}>
          <View style={styles.ansRow}>
            <Text style={styles.ansQ}>1. Overall Wellbeing</Text>
            <Text style={styles.ansA}>{report.answers.q1_wellbeing} / 5</Text>
          </View>
          <View style={styles.ansRow}>
            <Text style={styles.ansQ}>2. Physical Pain</Text>
            <Text style={styles.ansA}>{report.answers.q2_pain ? 'Yes (Pain reported)' : 'No pain'}</Text>
          </View>
          <View style={styles.ansRow}>
            <Text style={styles.ansQ}>3. Sleep Quality</Text>
            <Text style={styles.ansA}>{report.answers.q3_sleep} / 5</Text>
          </View>
          <View style={styles.ansRow}>
            <Text style={styles.ansQ}>4. Spirits / Mood</Text>
            <Text style={styles.ansA}>{report.answers.q4_mood} / 5</Text>
          </View>
          <View style={styles.ansRow}>
            <Text style={styles.ansQ}>5. Regular Meals</Text>
            <Text style={styles.ansA}>{report.answers.q5_meals ? 'Yes' : 'No'}</Text>
          </View>
          <View style={[styles.ansRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.ansQ}>6. Caregiver Call Back</Text>
            <Text style={styles.ansA}>{report.answers.q6_callback_requested ? 'Requested' : 'Not requested'}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: SPACING.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg },
  backBtn: { padding: 4 },
  title: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.textPri },
  card: { backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg },
  dateText: { fontSize: FONT_SIZES.xs, color: COLORS.textSec, fontWeight: '600' },
  scoreBox: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.md },
  scoreVal: { fontSize: 36, fontWeight: 'bold', color: COLORS.textPri, marginRight: SPACING.md },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  bgGreen: { backgroundColor: COLORS.green },
  bgAmber: { backgroundColor: COLORS.amber },
  badgeText: { color: COLORS.bg, fontSize: FONT_SIZES.xs, fontWeight: 'bold' },
  summaryText: { fontSize: FONT_SIZES.sm, color: COLORS.textSec, lineHeight: 20 },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.textPri, marginBottom: SPACING.md },
  answersCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  ansRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  ansQ: { fontSize: FONT_SIZES.sm, color: COLORS.textPri },
  ansA: { fontSize: FONT_SIZES.sm, color: COLORS.teal, fontWeight: 'bold' },
});
