import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import resourcesData from '../../assets/data/resources.json';

export default function ResourcesScreen() {
  const router = useRouter();

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleOpenWeb = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPri} />
          </Pressable>
          <Text style={styles.title}>Support Resources</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.subtitle}>
          Helpful support lifelines, government programs, and community services for caregivers.
        </Text>

        {resourcesData.map((res) => (
          <View key={res.id} style={styles.card}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{res.category}</Text>
            </View>
            <Text style={styles.resName}>{res.name}</Text>
            <Text style={styles.resDesc}>{res.description}</Text>

            <View style={styles.btnRow}>
              <Pressable style={styles.callBtn} onPress={() => handleCall(res.phone)}>
                <Ionicons name="call" size={16} color={COLORS.bg} style={{ marginRight: 6 }} />
                <Text style={styles.callBtnText}>Call {res.phone}</Text>
              </Pressable>
              <Pressable style={styles.webBtn} onPress={() => handleOpenWeb(res.website)}>
                <Text style={styles.webBtnText}>Website</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPri,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSec,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoryText: {
    color: COLORS.teal,
    fontSize: 10,
    fontWeight: 'bold',
  },
  resName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPri,
    marginBottom: 4,
  },
  resDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSec,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  btnRow: {
    flexDirection: 'row',
  },
  callBtn: {
    backgroundColor: COLORS.teal,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  callBtnText: {
    color: COLORS.bg,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.xs,
  },
  webBtn: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  webBtnText: {
    color: COLORS.textPri,
    fontWeight: '600',
    fontSize: FONT_SIZES.xs,
  },
});
