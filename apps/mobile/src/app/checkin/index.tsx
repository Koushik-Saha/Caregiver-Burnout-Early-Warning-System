import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const EMOJI_MOODS = [
  { value: 0, emoji: '😁', label: 'Great' },
  { value: 1, emoji: '🙂', label: 'Good' },
  { value: 2, emoji: '😐', label: 'Okay' },
  { value: 3, emoji: '🙁', label: 'Tired' },
  { value: 4, emoji: '😣', label: 'Stressed' },
  { value: 5, emoji: '😩', label: 'Exhausted' },
  { value: 6, emoji: '😭', label: 'Overwhelmed' },
];

export default function CheckInScreen() {
  const router = useRouter();
  const [mood, setMood] = useState(2);
  const [stress, setStress] = useState(5);
  const [sleepHours, setSleepHours] = useState(7);
  const [careHours, setCareHours] = useState(20);
  const [personalTime, setPersonalTime] = useState(true);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const todayStr = new Date().toISOString().split('T')[0];

      const res = await fetch(`${apiBaseUrl}/api/checkins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          localDate: todayStr,
          mood,
          stress,
          sleepHours,
          careHours,
          personalTime,
          note,
        }),
      });

      const data = await res.json();
      router.push({
        pathname: '/checkin/result' as any,
        params: {
          score: data.scoreResult?.score || 45,
          level: data.scoreResult?.level || 'moderate',
          breakdown: JSON.stringify(data.scoreResult?.breakdown || {}),
          triggered: data.earlyWarning?.triggered ? 'true' : 'false',
          reason: data.earlyWarning?.reason || '',
        },
      });
    } catch (err) {
      router.push('/checkin/result' as any);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={COLORS.textPri} />
          </Pressable>
          <Text style={styles.title}>Daily CareLoad Check-in</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Question 1: Emoji Mood */}
        <View style={styles.questionCard}>
          <Text style={styles.questionTitle}>1. How are you feeling overall today?</Text>
          <View style={styles.emojiGrid}>
            {EMOJI_MOODS.map((item) => (
              <Pressable
                key={item.value}
                style={[styles.emojiItem, mood === item.value && styles.emojiSelected]}
                onPress={() => setMood(item.value)}
              >
                <Text style={styles.emojiText}>{item.emoji}</Text>
                <Text style={styles.emojiLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Question 2: Stress Level Stepper */}
        <View style={styles.questionCard}>
          <Text style={styles.questionTitle}>2. Stress Level (0 to 10)</Text>
          <View style={styles.stepperRow}>
            <Pressable style={styles.stepBtn} onPress={() => setStress(Math.max(0, stress - 1))}>
              <Text style={styles.stepBtnText}>-</Text>
            </Pressable>
            <Text style={styles.stepperVal}>{stress} / 10</Text>
            <Pressable style={styles.stepBtn} onPress={() => setStress(Math.min(10, stress + 1))}>
              <Text style={styles.stepBtnText}>+</Text>
            </Pressable>
          </View>
        </View>

        {/* Question 3: Sleep Hours */}
        <View style={styles.questionCard}>
          <Text style={styles.questionTitle}>3. Hours of sleep last night</Text>
          <View style={styles.stepperRow}>
            <Pressable style={styles.stepBtn} onPress={() => setSleepHours(Math.max(0, sleepHours - 1))}>
              <Text style={styles.stepBtnText}>-</Text>
            </Pressable>
            <Text style={styles.stepperVal}>{sleepHours} hrs</Text>
            <Pressable style={styles.stepBtn} onPress={() => setSleepHours(Math.min(24, sleepHours + 1))}>
              <Text style={styles.stepBtnText}>+</Text>
            </Pressable>
          </View>
        </View>

        {/* Question 4: Caregiving Hours */}
        <View style={styles.questionCard}>
          <Text style={styles.questionTitle}>4. Caregiving hours this week</Text>
          <View style={styles.stepperRow}>
            <Pressable style={styles.stepBtn} onPress={() => setCareHours(Math.max(0, careHours - 5))}>
              <Text style={styles.stepBtnText}>-5</Text>
            </Pressable>
            <Text style={styles.stepperVal}>{careHours} hrs/wk</Text>
            <Pressable style={styles.stepBtn} onPress={() => setCareHours(careHours + 5)}>
              <Text style={styles.stepBtnText}>+5</Text>
            </Pressable>
          </View>
        </View>

        {/* Question 5: Personal Time Toggle */}
        <View style={styles.questionCard}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.questionTitle}>5. Did you take personal time today?</Text>
              <Text style={styles.subText}>At least 30 minutes for rest or self-care</Text>
            </View>
            <Switch
              value={personalTime}
              onValueChange={setPersonalTime}
              trackColor={{ false: COLORS.border, true: COLORS.teal }}
            />
          </View>
        </View>

        {/* Optional Note */}
        <View style={styles.questionCard}>
          <Text style={styles.questionTitle}>6. Optional Notes</Text>
          <TextInput
            style={styles.inputNote}
            placeholder="Add any notes about your day..."
            placeholderTextColor={COLORS.textSec}
            multiline
            value={note}
            onChangeText={setNote}
          />
        </View>

        <Pressable
          style={[styles.submitBtn, submitting && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.bg} />
          ) : (
            <Text style={styles.submitBtnText}>Calculate CareLoad Score</Text>
          )}
        </Pressable>
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
  questionCard: { backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md },
  questionTitle: { fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.textPri, marginBottom: SPACING.md },
  subText: { fontSize: FONT_SIZES.xs, color: COLORS.textSec, marginTop: 2 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiItem: { minWidth: 72, flex: 1, flexBasis: '28%', backgroundColor: COLORS.bg, paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginBottom: 4, borderWidth: 1.5, borderColor: COLORS.border },
  emojiSelected: { borderColor: COLORS.teal, backgroundColor: 'rgba(20, 184, 166, 0.1)' },
  emojiText: { fontSize: 24, marginBottom: 4 },
  emojiLabel: { fontSize: 10, color: COLORS.textSec },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  stepBtn: { width: 44, height: 44, backgroundColor: COLORS.card, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  stepBtnText: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPri },
  stepperVal: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.teal, marginHorizontal: SPACING.xl },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inputNote: { backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: SPACING.md, color: COLORS.textPri, minHeight: 80 },
  submitBtn: { backgroundColor: COLORS.teal, height: 54, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: SPACING.md, marginBottom: SPACING.xl },
  btnDisabled: { opacity: 0.6 },
  submitBtnText: { color: COLORS.bg, fontSize: FONT_SIZES.lg, fontWeight: 'bold' },
});
