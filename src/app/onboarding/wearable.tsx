import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { trackEvent } from '@/lib/analytics';

const OPTIONS = [
  { id: 'connect', label: 'Connect my watch or phone', subtitle: 'Imports sleep and daily steps automatically', emoji: '⌚' },
  { id: 'skip', label: 'Skip this step', subtitle: 'You can always connect this later', emoji: '➡️' },
];

export default function WearableScreen() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>('skip');

  const handleSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleContinue = async () => {
    if (!selectedOption) return;
    
    // Log onboarding completed locally
    await trackEvent('onboarding_completed', { connectedWearable: selectedOption === 'connect' });

    if (selectedOption === 'connect') {
      Alert.alert(
        'Connection Simulated',
        'Activity connection completed. We will check your activity data to help spot trends.',
        [
          {
            text: 'Continue',
            onPress: () => router.push('/checkin/questions'),
          }
        ]
      );
    } else {
      router.push('/checkin/questions');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Top Header Row with Back Button and Progress Bar */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable
            onPress={handleBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back to the caregiving hours step"
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPri} />
          </Pressable>
          <Text style={styles.stepText}>Step 3 of 3</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Bar (100% filled) */}
        <View style={styles.progressBarBg}>
          <View style={styles.progressBarFill} />
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        <Text style={styles.questionText}>
          Would you like to connect your activity data?
        </Text>
        <Text style={styles.subtext}>
          We can look at changes in your sleep and daily steps to help spot when your stress is rising.
        </Text>

        {/* Options List */}
        <View style={styles.optionsContainer}>
          {OPTIONS.map((option) => {
            const isSelected = selectedOption === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => handleSelect(option.id)}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                ]}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`${option.label}. ${option.subtitle}`}
                accessibilityHint="Double tap to choose this connection preference"
              >
                <Text style={styles.emoji} accessibilityElementsHidden={true} importantForAccessibility="no">
                  {option.emoji}
                </Text>
                
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>{option.label}</Text>
                  <Text style={styles.cardSubtitle}>{option.subtitle}</Text>
                </View>

                <View style={styles.iconContainer}>
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.teal} />
                  ) : (
                    <View style={styles.checkboxPlaceholder} />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Continue Button placed right below cards */}
        <Pressable
          onPress={handleContinue}
          disabled={!selectedOption}
          style={({ pressed }) => [
            styles.button,
            !selectedOption && styles.buttonDisabled,
            selectedOption && pressed && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Continue to the weekly check-in"
          accessibilityState={{ disabled: !selectedOption }}
          accessibilityHint="Goes to the first weekly questions screen"
        >
          <Text style={[styles.buttonText, !selectedOption && styles.buttonTextDisabled]}>
            Continue
          </Text>
        </Pressable>
      </View>
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
    marginTop: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  backButton: {
    width: 48, // Minimum 48px touch target
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  stepText: {
    fontSize: FONT_SIZES.md, // 15px
    color: COLORS.textSec,
    fontWeight: '600',
  },
  placeholder: {
    width: 48,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.card,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.teal,
    width: '100%',
    borderRadius: 3,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: SPACING.lg,
  },
  questionText: {
    fontSize: FONT_SIZES.xl, // 24px
    fontWeight: 'bold',
    color: COLORS.textPri,
    marginBottom: SPACING.xs,
    lineHeight: 32,
  },
  subtext: {
    fontSize: FONT_SIZES.md, // 15px
    color: COLORS.textSec,
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  optionsContainer: {
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    minHeight: 64, // Satisfies minimum 64px card height constraint
    marginBottom: SPACING.md,
  },
  cardSelected: {
    borderColor: COLORS.teal,
  },
  emoji: {
    fontSize: FONT_SIZES.xl, // 24px
    marginRight: SPACING.md,
  },
  cardTextContainer: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONT_SIZES.md, // 15px
    fontWeight: 'bold',
    color: COLORS.textPri,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.md, // 15px
    color: COLORS.textSec,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  footer: {
    marginBottom: SPACING.xl,
  },
  button: {
    backgroundColor: COLORS.teal,
    width: '100%',
    height: 56, // Satisfies minimum 56px touch target constraint
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32, // Sit exactly below the cards
  },
  buttonDisabled: {
    backgroundColor: COLORS.card,
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg, // 18px
    color: COLORS.bg,
    fontWeight: 'bold',
  },
  buttonTextDisabled: {
    color: COLORS.textSec,
  },
});
