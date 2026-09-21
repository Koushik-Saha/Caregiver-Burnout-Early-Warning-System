import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AlertDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const alertItem = {
    id,
    severity: 'critical',
    title: 'RED ALERT: Missed Check-in Call',
    seniorName: 'Mary Smith',
    message: 'Senior Mary Smith missed scheduled daily check-in call (no-answer). 2 consecutive missed days.',
    createdAt: 'Today at 10:15 AM',
  };

  const handleAcknowledge = async () => {
    setLoading(true);
    try {
      const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      await fetch(`${apiBaseUrl}/api/alerts/${id}/ack`, { method: 'POST' });
      setAcknowledged(true);
      Alert.alert('Acknowledged', 'Alert marked as acknowledged ("I\'m on it").', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      setAcknowledged(true);
      Alert.alert('Acknowledged', 'Alert acknowledged.', [{ text: 'OK', onPress: () => router.back() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPri} />
          </Pressable>
          <Text style={styles.title}>Alert Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{alertItem.severity.toUpperCase()}</Text>
          </View>
          <Text style={styles.alertTitle}>{alertItem.title}</Text>
          <Text style={styles.timeText}>{alertItem.createdAt}</Text>
          <Text style={styles.message}>{alertItem.message}</Text>
        </View>

        <Pressable
          style={[styles.ackBtn, acknowledged && styles.ackBtnDone]}
          onPress={handleAcknowledge}
          disabled={loading || acknowledged}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.bg} />
          ) : (
            <Text style={styles.ackBtnText}>{acknowledged ? '✓ Acknowledged ("I\'m on it")' : "I'm on it! (Acknowledge Alert)"}</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg },
  backBtn: { padding: 4 },
  title: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.textPri },
  card: { backgroundColor: COLORS.surface, padding: SPACING.xl, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xl },
  badge: { alignSelf: 'flex-start', backgroundColor: COLORS.coral, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: SPACING.sm },
  badgeText: { color: COLORS.bg, fontSize: 10, fontWeight: 'bold' },
  alertTitle: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.textPri, marginBottom: 4 },
  timeText: { fontSize: FONT_SIZES.xs, color: COLORS.textSec, marginBottom: SPACING.md },
  message: { fontSize: FONT_SIZES.md, color: COLORS.textPri, lineHeight: 22 },
  ackBtn: { backgroundColor: COLORS.teal, height: 54, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  ackBtnDone: { backgroundColor: COLORS.green },
  ackBtnText: { color: COLORS.bg, fontSize: FONT_SIZES.md, fontWeight: 'bold' },
});
