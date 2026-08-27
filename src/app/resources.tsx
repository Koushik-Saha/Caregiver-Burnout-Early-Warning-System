import React from 'react';
import { StyleSheet, Text, View, Pressable, StatusBar, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { useCareStore } from '@/lib/store';
import { AUSTIN_RESOURCES, ResourceItem } from '@/constants/resources';

export default function ResourcesScreen() {
  const router = useRouter();
  const weeklyScore = useCareStore((state) => state.weeklyScore);

  // If score is not set yet, default to the mock checkin score (60)
  const score = weeklyScore !== null ? weeklyScore : 60;
  const isHighRisk = score >= 65;

  const handleBack = () => {
    router.back();
  };

  const handleAction = async (resource: ResourceItem) => {
    if (resource.type === 'phone' && resource.contact) {
      const telUrl = `tel:${resource.contact.replace(/[^0-9+]/g, '')}`;
      const canOpen = await Linking.canOpenURL(telUrl);
      if (canOpen) {
        Linking.openURL(telUrl);
      } else {
        Alert.alert('Unable to Call', `Your device cannot make calls directly. Please dial ${resource.contact} manually.`);
      }
    } else if (resource.url) {
      const canOpen = await Linking.canOpenURL(resource.url);
      if (canOpen) {
        Linking.openURL(resource.url);
      } else {
        Alert.alert('Unable to Open Link', 'Your device could not open this website link.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.headerTitle}>Support Options</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Adaptive Score Banner */}
        <View 
          style={[
            styles.banner, 
            isHighRisk ? styles.bannerHighRisk : styles.bannerLowRisk
          ]}
          accessibilityRole="text"
        >
          <Ionicons 
            name={isHighRisk ? "warning" : "information-circle"} 
            size={24} 
            color={isHighRisk ? COLORS.coral : COLORS.teal} 
            style={styles.bannerIcon}
          />
          <Text style={styles.bannerText}>
            {isHighRisk 
              ? "Your score suggests you could use some support. These are real options, nearby."
              : "Here are some options if you ever need a break."
            }
          </Text>
        </View>

        {/* Resources Listing */}
        <View style={styles.listContainer}>
          {AUSTIN_RESOURCES.map((resource) => {
            const isPhone = resource.type === 'phone';
            return (
              <View key={resource.id} style={styles.card}>
                
                {/* Header: Icon + Name */}
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon} accessibilityElementsHidden={true} importantForAccessibility="no">
                    {resource.icon}
                  </Text>
                  <Text style={styles.cardName}>{resource.name}</Text>
                </View>

                {/* Description */}
                <Text style={styles.cardDescription}>{resource.description}</Text>

                {/* Info Badges */}
                <View style={styles.badgeRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Cost: {resource.cost}</Text>
                  </View>
                  {resource.contact && (
                    <View style={[styles.badge, styles.contactBadge]}>
                      <Text style={styles.badgeText}>{resource.contact}</Text>
                    </View>
                  )}
                </View>

                {/* Action Button */}
                <Pressable
                  onPress={() => handleAction(resource)}
                  style={({ pressed }) => [
                    styles.actionButton,
                    isPhone ? styles.actionButtonPhone : styles.actionButtonUrl,
                    pressed && styles.actionButtonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isPhone 
                      ? `Call ${resource.name} at ${resource.contact}` 
                      : `Learn more about ${resource.name}`
                  }
                >
                  <Text 
                    style={[
                      styles.actionButtonText, 
                      isPhone ? styles.actionButtonTextPhone : styles.actionButtonTextUrl
                    ]}
                  >
                    {isPhone ? "Call" : "Learn more →"}
                  </Text>
                </Pressable>

              </View>
            );
          })}
        </View>

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
    fontSize: FONT_SIZES.lg, // 18px
    fontWeight: 'bold',
    color: COLORS.textPri,
  },
  placeholder: {
    width: 48,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: SPACING.lg,
  },
  bannerLowRisk: {
    backgroundColor: 'rgba(45, 212, 191, 0.08)',
    borderColor: 'rgba(45, 212, 191, 0.3)',
  },
  bannerHighRisk: {
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
  bannerIcon: {
    marginRight: SPACING.md,
  },
  bannerText: {
    flex: 1,
    fontSize: FONT_SIZES.md, // 15px - satisfies minimum font size rule
    color: COLORS.textPri,
    lineHeight: 22,
  },
  listContainer: {
    width: '100%',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  cardIcon: {
    fontSize: FONT_SIZES.xl, // 24px
    marginRight: SPACING.md,
    marginTop: 2,
  },
  cardName: {
    flex: 1,
    fontSize: FONT_SIZES.lg, // 18px - bold, easy to read at arm's length
    fontWeight: 'bold',
    color: COLORS.textPri,
    lineHeight: 24,
  },
  cardDescription: {
    fontSize: FONT_SIZES.md, // 15px - satisfies minimum font size rule
    color: COLORS.textSec,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  badge: {
    backgroundColor: COLORS.card,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contactBadge: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeText: {
    fontSize: FONT_SIZES.md, // 15px - satisfies minimum font size rule
    color: COLORS.textPri,
    fontWeight: '500',
  },
  actionButton: {
    height: 48, // Satisfies touch target requirements
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  actionButtonPhone: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonUrl: {
    backgroundColor: COLORS.teal,
  },
  actionButtonPressed: {
    opacity: 0.85,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.md, // 15px
    fontWeight: 'bold',
  },
  actionButtonTextPhone: {
    color: COLORS.teal,
  },
  actionButtonTextUrl: {
    color: COLORS.bg,
  },
});
