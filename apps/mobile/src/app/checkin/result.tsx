import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';

export default function CheckInResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const score = parseInt((params.score as string) || '45', 10);
  const level = (params.level as string) || 'moderate';
  const isTriggered = params.triggered === 'true';
  const warningReason = (params.reason as string) || 'Sustained elevated load detected.';

  let breakdown: any = {};
  try {
    breakdown = JSON.parse((params.breakdown as string) || '{}');
  } catch (e) {
    breakdown = { moodPoints: 12, careHoursPoints: 14, sleepPoints: 8, stressPoints: 8, personalTimePoints: 3 };
  }

  // Sample 30-day score history data for SVG chart
  const historyData = [32, 35, 38, 40, 42, 45, 48, 52, 50, 48, 45, 42, 40, 39, 41, 45, 48, 55, 58, 60, 62, 59, 54, 48, 46, 45, 44, 45, score];

  // SVG Chart layout calculation
  const chartWidth = 300;
  const chartHeight = 120;
  const points = historyData.map((val, idx) => {
    const x = (idx / (historyData.length - 1)) * chartWidth;
    const y = chartHeight - (val / 100) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Your CareLoad Results</Text>

        {/* Early Warning Trigger Card */}
        {isTriggered && (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠️ Early Warning Triggered</Text>
            <Text style={styles.warningReason}>{warningReason}</Text>
          </View>
        )}

        {/* Score Summary Box */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>CareLoad Score</Text>
          <Text style={styles.scoreVal}>{score}</Text>
          <View style={[styles.badge, (styles as any)[`badge_${level}`]]}>
            <Text style={styles.badgeText}>{level.toUpperCase()}</Text>
          </View>
        </View>

        {/* Point Breakdown */}
        <Text style={styles.sectionTitle}>Point Breakdown</Text>
        <View style={styles.breakdownCard}>
          <View style={styles.breakRow}>
            <Text style={styles.breakLabel}>Mood & Spirits (28%)</Text>
            <Text style={styles.breakVal}>{breakdown.moodPoints || 0} pts</Text>
          </View>
          <View style={styles.breakRow}>
            <Text style={styles.breakLabel}>Caregiving Hours (24%)</Text>
            <Text style={styles.breakVal}>{breakdown.careHoursPoints || 0} pts</Text>
          </View>
          <View style={styles.breakRow}>
            <Text style={styles.breakLabel}>Sleep Quality (18%)</Text>
            <Text style={styles.breakVal}>{breakdown.sleepPoints || 0} pts</Text>
          </View>
          <View style={styles.breakRow}>
            <Text style={styles.breakLabel}>Stress Level (20%)</Text>
            <Text style={styles.breakVal}>{breakdown.stressPoints || 0} pts</Text>
          </View>
          <View style={[styles.breakRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.breakLabel}>Personal Time (10%)</Text>
            <Text style={styles.breakVal}>{breakdown.personalTimePoints || 0} pts</Text>
          </View>
        </View>

        {/* 30-Day History SVG Chart */}
        <Text style={styles.sectionTitle}>30-Day CareLoad Trend</Text>
        <View style={styles.chartCard}>
          <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ overflow: 'visible' }}>
            <Line x1="0" y1={chartHeight - (34/100)*chartHeight} x2={chartWidth} y2={chartHeight - (34/100)*chartHeight} stroke={COLORS.green} strokeDasharray="4 4" strokeWidth="1" />
            <Line x1="0" y1={chartHeight - (59/100)*chartHeight} x2={chartWidth} y2={chartHeight - (59/100)*chartHeight} stroke={COLORS.amber} strokeDasharray="4 4" strokeWidth="1" />
            <Polyline points={points} fill="none" stroke={COLORS.teal} strokeWidth="3" />
            <Circle cx={chartWidth} cy={chartHeight - (score / 100) * chartHeight} r="5" fill={COLORS.teal} />
          </Svg>
          <View style={styles.chartLegend}>
            <Text style={styles.legendText}>Low (&le;34)</Text>
            <Text style={styles.legendText}>Moderate (35-59)</Text>
            <Text style={styles.legendText}>Elevated (60+)</Text>
          </View>
        </View>

        <Pressable style={styles.doneBtn} onPress={() => router.replace('/(tabs)/home' as any)}>
          <Text style={styles.doneBtnText}>Back to Dashboard</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: SPACING.lg },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: 'bold', color: COLORS.textPri, marginBottom: SPACING.lg },
  warningCard: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: COLORS.coral, padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.lg },
  warningTitle: { fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.coral, marginBottom: 4 },
  warningReason: { fontSize: FONT_SIZES.xs, color: COLORS.textPri },
  scoreCard: { backgroundColor: COLORS.surface, padding: SPACING.xl, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xl },
  scoreLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSec, textTransform: 'uppercase', letterSpacing: 1 },
  scoreVal: { fontSize: 64, fontWeight: 'bold', color: COLORS.textPri, marginVertical: 4 },
  badge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  badge_low: { backgroundColor: COLORS.green },
  badge_moderate: { backgroundColor: COLORS.teal },
  badge_elevated: { backgroundColor: COLORS.amber },
  badge_high: { backgroundColor: COLORS.coral },
  badgeText: { color: COLORS.bg, fontWeight: 'bold', fontSize: FONT_SIZES.sm },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.textPri, marginBottom: SPACING.md },
  breakdownCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xl },
  breakRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  breakLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textPri },
  breakVal: { fontSize: FONT_SIZES.sm, color: COLORS.teal, fontWeight: 'bold' },
  chartCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', marginBottom: SPACING.xl },
  chartLegend: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: SPACING.md },
  legendText: { fontSize: 10, color: COLORS.textSec },
  doneBtn: { backgroundColor: COLORS.teal, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xl },
  doneBtnText: { color: COLORS.bg, fontSize: FONT_SIZES.lg, fontWeight: 'bold' },
});
