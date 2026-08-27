import React from 'react';
import { StyleSheet, Text, View, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { useCareStore } from '@/lib/store';

const OPTIONS = [
  { id: 10, label: 'Under 20 hours', subtitle: 'A few hours here and there', color: COLORS.green },
  { id: 30, label: '20 to 40 hours', subtitle: 'Regular daily help', color: COLORS.teal },
  { id: 50, label: '40 to 60 hours', subtitle: 'Most of your day', color: COLORS.amber },
  { id: 70, label: 'More than 60 hours', subtitle: 'Almost all of your time', color: COLORS.coral },
];

export default function HoursPerWeekScreen() {
  const router = useRouter();
  const hoursPerWeek = useCareStore((state) => state.hoursPerWeek);
  const setHoursPerWeek = useCareStore((state) => state.setHoursPerWeek);

  const handleSelect = (hoursValue: number) => {
    setHoursPerWeek(hoursValue);
  };

  const handleContinue = () => {
    if (hoursPerWeek === null) return;
    router.push('/onboarding/wearable');
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
            accessibilityLabel="Go back to previous step"
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPri} />
          </Pressable>
          <Text style={styles.stepText}>Step 2 of 3</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Bar (66% filled) */}
        <View style={styles.progressBarBg}>
          <View style={styles.progressBarFill} />
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        <Text style={styles.questionText}>
          About how many hours a week do you spend caregiving?
        </Text>
        <Text style={styles.subtext}>
          Include helping with tasks, driving, and worrying too.
        </Text>

        {/* Options List */}
        <View style={styles.optionsContainer}>
          {OPTIONS.map((option) => {
            const isSelected = hoursPerWeek === option.id;
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
                accessibilityHint="Double tap to select this duration"
              >
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>{option.label}</Text>
                  <Text style={styles.cardSubtitle}>{option.subtitle}</Text>
                </View>

                {/* Right Side Indicators: Color dot + Checkmark */}
                <View style={styles.indicators}>
                  <View 
                    style={[styles.colorDot, { backgroundColor: option.color }]} 
                    accessibilityElementsHidden={true}
                    importantForAccessibility="no"
                  />
                  <View style={styles.iconContainer}>
                    {isSelected ? (
                      <Ionicons name="checkmark-circle" size={24} color={COLORS.teal} />
                    ) : (
                      <View style={styles.checkboxPlaceholder} />
                    )}
                  </View>
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
          disabled={hoursPerWeek === null}
          style={({ pressed }) => [
            styles.button,
            hoursPerWeek === null && styles.buttonDisabled,
            hoursPerWeek !== null && pressed && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Continue to the next onboarding question"
          accessibilityState={{ disabled: hoursPerWeek === null }}
          accessibilityHint="Goes to the final step of onboarding"
        >
          <Text style={[styles.buttonText, hoursPerWeek === null && styles.buttonTextDisabled]}>
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
    width: '66%',
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
    justifyContent: 'space-between',
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
  cardTextContainer: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONT_SIZES.md, // 15px - satisfies minimum font size rule
    fontWeight: 'bold',
    color: COLORS.textPri,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.md, // 15px - satisfies minimum font size rule
    color: COLORS.textSec,
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.md,
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
