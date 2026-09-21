import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, StatusBar, ScrollView, Clipboard, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { getEvents, clearEvents, LoggedEvent } from '@/lib/analytics';

export default function DebugScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<LoggedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const logs = await getEvents();
      // Keep newest first for easy viewing
      setEvents(logs.reverse());
    } catch (error) {
      console.error('Failed to load debug events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleCopyAll = () => {
    if (events.length === 0) {
      Alert.alert('Empty Logs', 'There are no logged events to copy.');
      return;
    }
    const jsonString = JSON.stringify(events, null, 2);
    Clipboard.setString(jsonString);
    Alert.alert('Copied to Clipboard', 'Full event logs JSON has been copied to your clipboard.');
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to clear all analytics events from this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            await clearEvents();
            fetchEvents();
            Alert.alert('Cleared', 'Event logs have been purged.');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.teal} />
        <Text style={styles.loadingText}>Loading debug logs...</Text>
      </SafeAreaView>
    );
  }

  // Slice the last 20 events (which are the first 20 in our reversed array)
  const displayEvents = events.slice(0, 20);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header Row */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back to the previous screen"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPri} />
        </Pressable>
        <Text style={styles.headerTitle}>Debug Analytics</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Total Count Display Card */}
        <View style={styles.metaCard}>
          <Text style={styles.metaLabel}>TOTAL EVENTS STORED</Text>
          <Text style={styles.metaCount}>{events.length}</Text>
        </View>

        {/* Action Controls */}
        <View style={styles.actionsRow}>
          <Pressable 
            style={[styles.actionBtn, styles.copyBtn]}
            onPress={handleCopyAll}
            accessibilityRole="button"
            accessibilityLabel="Copy all recorded events in JSON format to clipboard"
          >
            <Ionicons name="copy-outline" size={20} color={COLORS.bg} style={{ marginRight: 6 }} />
            <Text style={styles.copyBtnText}>Copy JSON</Text>
          </Pressable>

          <Pressable 
            style={[styles.actionBtn, styles.clearBtn]}
            onPress={handleClearAll}
            accessibilityRole="button"
            accessibilityLabel="Clear all analytics events from device storage"
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.coral} style={{ marginRight: 6 }} />
            <Text style={styles.clearBtnText}>Clear Logs</Text>
          </Pressable>
        </View>

        {/* Recent Events List */}
        <Text style={styles.sectionTitle}>Recent Logs (Last 20)</Text>
        {displayEvents.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No events recorded yet.</Text>
          </View>
        ) : (
          displayEvents.map((item, idx) => {
            const timeString = new Date(item.timestamp).toLocaleTimeString();
            const dateString = new Date(item.timestamp).toLocaleDateString();
            return (
              <View key={idx} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventName}>{item.event}</Text>
                  <Text style={styles.eventTime}>{dateString} {timeString}</Text>
                </View>
                {item.props && Object.keys(item.props).length > 0 && (
                  <Text style={styles.eventProps}>
                    {JSON.stringify(item.props, null, 2)}
                  </Text>
                )}
              </View>
            );
          })
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSec,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPri,
  },
  placeholder: {
    width: 48,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  metaCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  metaLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSec,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  metaCount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.teal,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyBtn: {
    backgroundColor: COLORS.teal,
  },
  copyBtnText: {
    color: COLORS.bg,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.md,
  },
  clearBtn: {
    borderWidth: 1,
    borderColor: COLORS.coral,
    backgroundColor: 'rgba(248, 113, 113, 0.05)',
  },
  clearBtnText: {
    color: COLORS.coral,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textSec,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: SPACING.md,
  },
  eventCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: SPACING.sm,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPri,
  },
  eventTime: {
    fontSize: 12,
    color: COLORS.textSec,
  },
  eventProps: {
    fontSize: 13,
    color: COLORS.teal,
    fontFamily: 'SpaceMono',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 6,
    borderRadius: 6,
    marginTop: 6,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSec,
  },
});
