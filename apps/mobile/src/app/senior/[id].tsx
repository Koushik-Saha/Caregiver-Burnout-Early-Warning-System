import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function SeniorDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  const senior = {
    id,
    name: 'Mary Smith',
    phone: '+1 (512) 555-0199',
    consentStatus: 'granted', // 'granted' | 'pending' | 'declined' | 'revoked'
    nextCallAt: 'Tomorrow at 10:00 AM',
    timezone: 'America/Chicago',
  };

  const reports = [
    { id: 'rep_1', date: 'Sept 20, 2026', wellbeingScore: 9, alertLevel: 'green', summary: 'Feeling great, slept well, no pain reported.' },
    { id: 'rep_2', date: 'Sept 19, 2026', wellbeingScore: 7, alertLevel: 'amber', summary: 'Physical pain reported in knee. Low sleep.' },
    { id: 'rep_3', date: 'Sept 18, 2026', wellbeingScore: 10, alertLevel: 'green', summary: 'All daily check-in responses were positive.' },
  ];

  const handleTestCall = async (type: 'consent' | 'test') => {
    setLoading(true);
    try {
      const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiBaseUrl}/api/seniors/${id}/test-call`, { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        Alert.alert('Call Initiated', `Outbound ${type} call placed to ${senior.name}. SID: ${data.twilioSid || 'simulated'}`);
      } else {
        Alert.alert('Call Failed', data.message || 'Failed to place call');
      }
    } catch (err: any) {
      Alert.alert('Call Initiated', `Simulated ${type} call placed to ${senior.name}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPri} />
          </Pressable>
          <Text style={styles.title}>{senior.name}</Text>
          <Pressable onPress={() => router.push({ pathname: '/senior/edit' as any, params: { id: senior.id, name: senior.name, phone: senior.phone } })}>
            <Ionicons name="create-outline" size={22} color={COLORS.teal} />
          </Pressable>
        </View>

        {/* Profile Details Box */}
        <View style={styles.profileCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Consent Status</Text>
            <View style={[styles.badge, senior.consentStatus === 'granted' ? styles.bgGreen : styles.bgAmber]}>
              <Text style={styles.badgeText}>{senior.consentStatus.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone Number</Text>
            <Text style={styles.val}>{senior.phone}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Next Call Scheduled</Text>
            <Text style={styles.val}>{senior.nextCallAt}</Text>
          </View>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={styles.label}>Timezone</Text>
            <Text style={styles.val}>{senior.timezone}</Text>
          </View>
        </View>

        {/* Call Action Buttons */}
        <View style={styles.btnRow}>
          <Pressable
            style={[styles.callBtn, styles.consentBtn]}
            onPress={() => handleTestCall('consent')}
            disabled={loading}
          >
            <Text style={styles.consentBtnText}>Send Consent Call</Text>
          </Pressable>
          <Pressable style={styles.callBtn} onPress={() => handleTestCall('test')} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.bg} /> : <Text style={styles.callBtnText}>Test Call Now</Text>}
          </Pressable>
        </View>

        {/* 14-Day Call Report History */}
        <Text style={styles.sectionTitle}>14-Day Call Reports History</Text>
        {reports.map((rep) => (
          <Pressable key={rep.id} style={styles.reportCard} onPress={() => router.push(`/reports/${rep.id}` as any)}>
            <View style={styles.reportHeader}>
              <Text style={styles.reportDate}>{rep.date}</Text>
              <View
                style={[
                  styles.levelTag,
                  rep.alertLevel === 'green' && styles.bgGreen,
                  rep.alertLevel === 'amber' && styles.bgAmber,
                  rep.alertLevel === 'red' && styles.bgRed,
                ]}
              >
                <Text style={styles.levelTagText}>{rep.wellbeingScore}/10 ({rep.alertLevel.toUpperCase()})</Text>
              </View>
            </View>
            <Text style={styles.reportSummary}>{rep.summary}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: SPACING.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg },
  backBtn: { padding: 4 },
  title: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.textPri },
  profileCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  label: { fontSize: FONT_SIZES.sm, color: COLORS.textSec },
  val: { fontSize: FONT_SIZES.sm, color: COLORS.textPri, fontWeight: '600' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  bgGreen: { backgroundColor: COLORS.green },
  bgAmber: { backgroundColor: COLORS.amber },
  bgRed: { backgroundColor: COLORS.coral },
  badgeText: { color: COLORS.bg, fontSize: 10, fontWeight: 'bold' },
  btnRow: { flexDirection: 'row', marginBottom: SPACING.xl },
  callBtn: { flex: 1, backgroundColor: COLORS.teal, height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  callBtnText: { color: COLORS.bg, fontWeight: 'bold', fontSize: FONT_SIZES.sm },
  consentBtn: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, marginRight: 4, marginLeft: 0 },
  consentBtnText: { color: COLORS.textPri, fontWeight: '600', fontSize: FONT_SIZES.sm },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.textPri, marginBottom: SPACING.md },
  reportCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.sm },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  reportDate: { fontSize: FONT_SIZES.sm, fontWeight: 'bold', color: COLORS.textPri },
  levelTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  levelTagText: { color: COLORS.bg, fontSize: 10, fontWeight: 'bold' },
  reportSummary: { fontSize: FONT_SIZES.xs, color: COLORS.textSec, lineHeight: 18 },
});
