import React from 'react';
import { StyleSheet, Text, View, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { useCareStore } from '@/lib/store';

const OPTIONS = [
  { id: 'parent', label: 'An aging parent or grandparent', emoji: '👴' },
  { id: 'spouse', label: 'My spouse or partner', emoji: '💑' },
  { id: 'child', label: 'A child with a disability or illness', emoji: '👶' },
  { id: 'other', label: 'Another family member or friend', emoji: '🤝' },
];

export default function WhoYouCareForScreen() {
  const router = useRouter();
  const caringFor = useCareStore((state) => state.caringFor);
  const setCaringFor = useCareStore((state) => state.setCaringFor);

  const handleSelect = (optionId: string) => {
    setCaringFor(optionId);
  };

  const handleContinue = () => {
    if (!caringFor) return;
    router.push({
      pathname: '/onboarding/hours-per-week',
      params: { selection: caringFor },
    });
  };

  const handleBack = () => {
    router.push('/welcome');
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
            accessibilityLabel="Go back to welcome screen"
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPri} />
          </Pressable>
          <Text style={styles.stepText}>Step 1 of 3</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Bar (33% filled) */}
        <View style={styles.progressBarBg}>
          <View style={styles.progressBarFill} />
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        <Text style={styles.questionText}>Who are you caring for?</Text>

        {/* Options List */}
        <View style={styles.optionsContainer}>
          {OPTIONS.map((option) => {
            const isSelected = caringFor === option.id;
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
                accessibilityLabel={option.label}
                accessibilityHint="Double tap to select this option"
              >
                <Text style={styles.emoji} accessibilityElementsHidden={true} importantForAccessibility="no">
                  {option.emoji}
                </Text>
                <Text style={styles.cardText}>{option.label}</Text>
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
      </View>

      {/* Bottom Footer Area */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleContinue}
          disabled={!caringFor}
          style={({ pressed }) => [
            styles.button,
            !caringFor && styles.buttonDisabled,
            caringFor && pressed && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Continue to the next onboarding question"
          accessibilityState={{ disabled: !caringFor }}
          accessibilityHint="Goes to the next step of onboarding"
        >
          <Text style={[styles.buttonText, !caringFor && styles.buttonTextDisabled]}>
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
    justifyContent: 'space-between',
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
    fontSize: FONT_SIZES.md, // 15px - satisfies minimum font size rule
    color: COLORS.textSec,
    fontWeight: '600',
  },
  placeholder: {
    width: 48, // To balance the back button layout
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
    width: '33%',
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
    marginBottom: SPACING.xl,
    lineHeight: 32,
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
  cardText: {
    flex: 1,
    fontSize: FONT_SIZES.md, // 15px - satisfies minimum font size rule
    color: COLORS.textPri,
    lineHeight: 22,
  },
  iconContainer: {
    marginLeft: SPACING.sm,
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
