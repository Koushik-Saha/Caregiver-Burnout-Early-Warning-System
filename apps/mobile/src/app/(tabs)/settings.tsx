import React, { useState } from 'react';
import { StyleSheet, Text, View, Switch, Pressable, ScrollView, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { authClient } from '@/lib/auth-client';

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [pauseCalls, setPauseCalls] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleExportData = async () => {
    Alert.alert('Export Data', 'Your CareLoad data export request has been initiated. A JSON file will be downloaded.');
  };

  const handleSendTestPush = async () => {
    try {
      const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiBaseUrl}/api/test-push`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Test Push Sent', 'A test push notification has been sent to your device.');
      } else {
        Alert.alert('Push Error', data.message || 'Failed to send test push.');
      }
    } catch (err: any) {
      Alert.alert('Error', 'Failed to reach API server.');
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      await fetch(`${apiBaseUrl}/api/me`, { method: 'DELETE' });
      await authClient.signOut();
      setDeleteModal(false);
      router.replace('/(auth)/sign-in' as any);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to delete account.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.replace('/(auth)/sign-in' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Settings</Text>

        {/* Account & Preferences */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notifications & Calls</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingSub}>Alerts for red/amber warnings & care circle updates</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: COLORS.border, true: COLORS.teal }}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Pause Senior Check-in Calls</Text>
              <Text style={styles.settingSub}>Temporarily suspend daily automated voice calls</Text>
            </View>
            <Switch
              value={pauseCalls}
              onValueChange={setPauseCalls}
              trackColor={{ false: COLORS.border, true: COLORS.coral }}
            />
          </View>
        </View>

        {/* Data & Privacy */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Data & Account Privacy</Text>

          <Pressable style={styles.menuRow} onPress={handleExportData}>
            <Text style={styles.menuText}>Export My Data (JSON)</Text>
            <Text style={styles.arrow}>→</Text>
          </Pressable>

          <Pressable style={styles.menuRow} onPress={() => router.push('/resources' as any)}>
            <Text style={styles.menuText}>Caregiver Support Resources</Text>
            <Text style={styles.arrow}>→</Text>
          </Pressable>

          <Pressable style={[styles.menuRow, { borderBottomWidth: 0 }]} onPress={() => setDeleteModal(true)}>
            <Text style={styles.deleteText}>Delete Account</Text>
          </Pressable>
        </View>

        {/* Developer Tools */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Developer Tools</Text>
          <Pressable style={styles.devBtn} onPress={handleSendTestPush}>
            <Text style={styles.devBtnText}>🚀 Send Test Push Notification</Text>
          </Pressable>
        </View>

        {/* Sign Out Button */}
        <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        {/* Medical Disclaimer Notice */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>Medical Disclaimer</Text>
          <Text style={styles.disclaimerBody}>
            CareLoad is an early-warning communication and caregiver burnout monitoring tool. It is not a medical device, diagnostic system, or emergency dispatch service. In an emergency, always dial 911 immediately.
          </Text>
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal visible={deleteModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete Account?</Text>
            <Text style={styles.modalSub}>
              This action is permanent and will remove all your data, check-ins, and circle memberships.
            </Text>
            <View style={styles.modalBtns}>
              <Pressable style={styles.cancelBtn} onPress={() => setDeleteModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirmDeleteBtn} onPress={handleDeleteAccount} disabled={loading}>
                {loading ? <ActivityIndicator color={COLORS.bg} /> : <Text style={styles.confirmDeleteText}>Delete</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: SPACING.lg },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: 'bold', color: COLORS.textPri, marginBottom: SPACING.lg },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg },
  cardTitle: { fontSize: FONT_SIZES.xs, color: COLORS.teal, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.md },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  settingInfo: { flex: 1, marginRight: SPACING.md },
  settingLabel: { fontSize: FONT_SIZES.md, color: COLORS.textPri, fontWeight: '600' },
  settingSub: { fontSize: FONT_SIZES.xs, color: COLORS.textSec, marginTop: 2 },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuText: { fontSize: FONT_SIZES.md, color: COLORS.textPri },
  arrow: { color: COLORS.textSec, fontSize: FONT_SIZES.md },
  deleteText: { fontSize: FONT_SIZES.md, color: COLORS.coral, fontWeight: 'bold' },
  devBtn: { backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: 10, alignItems: 'center' },
  devBtnText: { color: COLORS.textPri, fontWeight: '600', fontSize: FONT_SIZES.sm },
  signOutBtn: { backgroundColor: COLORS.surface, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg },
  signOutText: { color: COLORS.coral, fontWeight: 'bold', fontSize: FONT_SIZES.md },
  disclaimerCard: { backgroundColor: 'rgba(255,255,255,0.03)', padding: SPACING.md, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  disclaimerTitle: { fontSize: FONT_SIZES.xs, fontWeight: 'bold', color: COLORS.textSec, marginBottom: 4 },
  disclaimerBody: { fontSize: 11, color: COLORS.textSec, lineHeight: 16 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: SPACING.lg },
  modalCard: { backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.textPri, marginBottom: 6 },
  modalSub: { fontSize: FONT_SIZES.xs, color: COLORS.textSec, lineHeight: 18, marginBottom: SPACING.lg },
  modalBtns: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, marginRight: 8 },
  cancelText: { color: COLORS.textSec },
  confirmDeleteBtn: { backgroundColor: COLORS.coral, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  confirmDeleteText: { color: COLORS.bg, fontWeight: 'bold' },
});
