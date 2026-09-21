import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const [todayScore, setTodayScore] = useState<number | null>(42);
  const [todayLevel, setTodayLevel] = useState<string>('moderate');
  const [phq2Due, setPhq2Due] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);

  const [alerts, setAlerts] = useState<any[]>([
    { id: '1', severity: 'critical', message: 'Senior Mary: Missed scheduled check-in call today.' },
  ]);

  const [seniors, setSeniors] = useState<any[]>([
    { id: 'sen_1', name: 'Mary Smith', status: 'answered-green', lastWellbeing: 8, time: '10:00 AM' },
    { id: 'sen_2', name: 'John Doe', status: 'missed', time: '10:30 AM' },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.teal} />}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>Caregiver Dashboard</Text>
          </View>
          <Pressable style={styles.iconBtn} onPress={() => router.push('/resources' as any)}>
            <Ionicons name="book-outline" size={24} color={COLORS.teal} />
          </Pressable>
        </View>

        {/* Alerts Banner */}
        {alerts.map((alert) => (
          <Pressable
            key={alert.id}
            style={[styles.alertBanner, alert.severity === 'critical' ? styles.alertRed : styles.alertAmber]}
            onPress={() => router.push(`/alerts/${alert.id}` as any)}
          >
            <Ionicons
              name={alert.severity === 'critical' ? 'alert-circle' : 'warning'}
              size={24}
              color={COLORS.bg}
            />
            <Text style={styles.alertText}>{alert.message}</Text>
            <Text style={styles.alertAction}>View</Text>
          </Pressable>
        ))}

        {/* PHQ-2 Weekly Prompt Banner */}
        {phq2Due && (
          <View style={styles.phqBox}>
            <View style={styles.phqTextGroup}>
              <Text style={styles.phqTitle}>Weekly Wellbeing Assessment Due</Text>
              <Text style={styles.phqSub}>Take 30 seconds to answer 2 short questions about your mood.</Text>
            </View>
            <Pressable style={styles.phqBtn} onPress={() => router.push('/checkin' as any)}>
              <Text style={styles.phqBtnText}>Start PHQ-2</Text>
            </Pressable>
          </View>
        )}

        {/* CareLoad Score Card */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreCardTitle}>Your CareLoad Today</Text>

          {todayScore !== null ? (
            <View style={styles.scoreRow}>
              <View style={styles.scoreNumberBox}>
                <Text style={styles.scoreNumber}>{todayScore}</Text>
                <Text style={styles.scoreMax}>/100</Text>
              </View>
              <View style={styles.scoreMeta}>
                <View style={[styles.levelBadge, (styles as any)[`level_${todayLevel}`]]}>
                  <Text style={styles.levelBadgeText}>{todayLevel.toUpperCase()}</Text>
                </View>
                <Text style={styles.scoreDesc}>
                  {todayLevel === 'low'
                    ? 'Burnout risk is currently low.'
                    : todayLevel === 'moderate'
                    ? 'Moderate load. Take a short break today.'
                    : 'Elevated stress detected. Reach out for help.'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.noCheckinBox}>
              <Text style={styles.noCheckinText}>You haven't checked in today yet.</Text>
            </View>
          )}

          <Pressable style={styles.checkinBtn} onPress={() => router.push('/checkin' as any)}>
            <Text style={styles.checkinBtnText}>
              {todayScore !== null ? 'Update Today\'s Check-in' : 'Complete Daily Check-in'}
            </Text>
          </Pressable>
        </View>

        {/* Seniors Overview Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Senior Voice Check-ins</Text>
          <Pressable onPress={() => router.push('/senior/add' as any)}>
            <Text style={styles.addSeniorText}>+ Add Senior</Text>
          </Pressable>
        </View>

        {seniors.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📞</Text>
            <Text style={styles.emptyTitle}>No Seniors Added Yet</Text>
            <Text style={styles.emptySub}>Add a senior loved one to enable daily automated voice check-in calls.</Text>
          </View>
        ) : (
          seniors.map((senior) => (
            <Pressable
              key={senior.id}
              style={styles.seniorCard}
              onPress={() => router.push(`/senior/${senior.id}` as any)}
            >
              <View style={styles.seniorInfo}>
                <Text style={styles.seniorName}>{senior.name}</Text>
                <Text style={styles.seniorTime}>Scheduled: {senior.time}</Text>
              </View>
              <View style={styles.seniorStatusBox}>
                <View
                  style={[
                    styles.statusBadge,
                    senior.status === 'answered-green' && styles.bgGreen,
                    senior.status === 'missed' && styles.bgRed,
                    senior.status === 'amber' && styles.bgAmber,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {senior.status === 'answered-green'
                      ? 'Answered (OK)'
                      : senior.status === 'missed'
                      ? 'Missed Call'
                      : 'Pending'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textSec} />
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: SPACING.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  greeting: { fontSize: FONT_SIZES.sm, color: COLORS.textSec },
  name: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.textPri },
  iconBtn: { padding: 10, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  alertBanner: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.md },
  alertRed: { backgroundColor: COLORS.coral },
  alertAmber: { backgroundColor: COLORS.amber },
  alertText: { flex: 1, color: COLORS.bg, fontSize: FONT_SIZES.sm, fontWeight: '600', marginLeft: 10 },
  alertAction: { color: COLORS.bg, fontWeight: 'bold', fontSize: FONT_SIZES.xs, textTransform: 'uppercase', paddingHorizontal: 8 },
  phqBox: { backgroundColor: 'rgba(20, 184, 166, 0.1)', borderWidth: 1, borderColor: COLORS.teal, borderRadius: 14, padding: SPACING.md, marginBottom: SPACING.lg },
  phqTextGroup: { marginBottom: 10 },
  phqTitle: { fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.teal },
  phqSub: { fontSize: FONT_SIZES.xs, color: COLORS.textSec, marginTop: 2 },
  phqBtn: { backgroundColor: COLORS.teal, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  phqBtnText: { color: COLORS.bg, fontWeight: 'bold', fontSize: FONT_SIZES.sm },
  scoreCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xl },
  scoreCardTitle: { fontSize: FONT_SIZES.xs, color: COLORS.textSec, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.md },
  scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
  scoreNumberBox: { flexDirection: 'row', alignItems: 'baseline', marginRight: SPACING.lg },
  scoreNumber: { fontSize: 48, fontWeight: 'bold', color: COLORS.textPri },
  scoreMax: { fontSize: FONT_SIZES.md, color: COLORS.textSec, marginLeft: 2 },
  scoreMeta: { flex: 1 },
  levelBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  level_low: { backgroundColor: COLORS.green },
  level_moderate: { backgroundColor: COLORS.teal },
  level_elevated: { backgroundColor: COLORS.amber },
  level_high: { backgroundColor: COLORS.coral },
  levelBadgeText: { color: COLORS.bg, fontSize: FONT_SIZES.xs, fontWeight: 'bold' },
  scoreDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textSec, lineHeight: 16 },
  noCheckinBox: { marginBottom: SPACING.md },
  noCheckinText: { color: COLORS.textSec, fontSize: FONT_SIZES.md },
  checkinBtn: { backgroundColor: COLORS.teal, height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  checkinBtnText: { color: COLORS.bg, fontSize: FONT_SIZES.md, fontWeight: 'bold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.textPri },
  addSeniorText: { color: COLORS.teal, fontSize: FONT_SIZES.sm, fontWeight: 'bold' },
  emptyCard: { backgroundColor: COLORS.surface, padding: SPACING.xl, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  emptyIcon: { fontSize: 40, marginBottom: SPACING.sm },
  emptyTitle: { fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.textPri, marginBottom: 4 },
  emptySub: { fontSize: FONT_SIZES.xs, color: COLORS.textSec, textAlign: 'center' },
  seniorCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  seniorInfo: { flex: 1 },
  seniorName: { fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.textPri },
  seniorTime: { fontSize: FONT_SIZES.xs, color: COLORS.textSec, marginTop: 2 },
  seniorStatusBox: { flexDirection: 'row', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 6 },
  bgGreen: { backgroundColor: COLORS.green },
  bgRed: { backgroundColor: COLORS.coral },
  bgAmber: { backgroundColor: COLORS.amber },
  statusText: { color: COLORS.bg, fontSize: 10, fontWeight: 'bold' },
});
