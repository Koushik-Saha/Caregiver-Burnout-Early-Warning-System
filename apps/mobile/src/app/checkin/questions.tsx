import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { useCareStore } from '@/lib/store';
import { saveCheckin } from '@/lib/checkin';
import { computeCareLoad } from '@/lib/score';
import { trackEvent } from '@/lib/analytics';

const OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'A few days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Almost every day' },
];

export default function CheckinQuestionsScreen() {
  const router = useRouter();
  const setWeeklyScore = useCareStore((state) => state.setWeeklyScore);

  const [currentStep, setCurrentStep] = useState<0 | 1>(0); // 0 = Q1, 1 = Q2
  const [q1Score, setQ1Score] = useState<number | null>(null);
  const [selectedVal, setSelectedVal] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Log checkin started locally
    trackEvent('checkin_started');
  }, []);

  const questions = [
    'Over the past 2 weeks, how often have you felt little interest or pleasure in doing things?',
    'Over the past 2 weeks, how often have you felt down, depressed, or hopeless?',
  ];

  const handleSelectOption = (value: number) => {
    if (isTransitioning) return;
    
    setSelectedVal(value);
    setIsTransitioning(true);

    setTimeout(async () => {
      if (currentStep === 0) {
        setQ1Score(value);
        setCurrentStep(1);
        setSelectedVal(null);
        setIsTransitioning(false);
      } else {
        // We are on Q2. Calculate total score and save.
        const q1 = q1Score ?? 0;
        const q2 = value;
        const total = q1 + q2;

        try {
          // Save locally to AsyncStorage
          await saveCheckin(q1, q2);
          
          // Update Zustand store
          setWeeklyScore(total);
          
          // Calculate score details for analytics props
          const storeState = useCareStore.getState();
          const careHrs = storeState.hoursPerWeek !== null ? storeState.hoursPerWeek : 50;
          const result = computeCareLoad({
            phq2Score: total,
            careHours: careHrs,
          });

          // Log checkin completed locally
          await trackEvent('checkin_completed', {
            phq2Score: total,
            band: result.band,
            score: result.score,
          });
          
          // Navigate to score screen
          router.push('/score');
        } catch (error) {
          console.error('Error saving check-in:', error);
        } finally {
          setIsTransitioning(false);
        }
      }
    }, 300); // 300ms transition delay to feel intentional but not rushed
  };

  const handleBack = () => {
    if (currentStep === 1) {
      // Go back to Q1, reset selection
      setCurrentStep(0);
      setSelectedVal(q1Score);
    } else {
      // Go back to previous screen
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header with Back Button */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={currentStep === 1 ? 'Go back to the first check-in question' : 'Go back to the previous setup screen'}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPri} />
        </Pressable>
        <Text style={styles.progressText}>Question {currentStep + 1} of 2</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Main Questionnaire Area */}
      <View style={styles.content}>
        <Text style={styles.questionText}>
          {questions[currentStep]}
        </Text>

        {/* Options List */}
        <View style={styles.optionsContainer}>
          {OPTIONS.map((option) => {
            const isSelected = selectedVal === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => handleSelectOption(option.value)}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                ]}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`${option.label}, option score value ${option.value}`}
                accessibilityHint="Double tap to select this answer"
              >
                {/* Score Number Box on Left */}
                <View style={[styles.numberBox, isSelected && styles.numberBoxSelected]}>
                  <Text style={[styles.numberText, isSelected && styles.numberTextSelected]}>
                    {option.value}
                  </Text>
                </View>

                {/* Option Label */}
                <Text style={styles.cardText}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Bottom Medical Disclosure Info */}
      <View style={styles.footer}>
        <Text style={styles.disclosureText}>
          Mood check-in (PHQ-2) · Used by doctors worldwide · Your answers stay private
        </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  backButton: {
    width: 48, // Minimum 48px touch target
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  progressText: {
    fontSize: FONT_SIZES.md, // 15px - satisfies minimum font size rule
    color: COLORS.textSec,
    fontWeight: '600',
  },
  placeholder: {
    width: 48,
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
    lineHeight: 34,
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
    height: 60, // Satisfies 60px tall card requirement
    marginBottom: SPACING.md,
  },
  cardSelected: {
    borderColor: COLORS.teal,
    backgroundColor: COLORS.card,
  },
  numberBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  numberBoxSelected: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  numberText: {
    fontSize: FONT_SIZES.md, // 15px
    fontWeight: 'bold',
    color: COLORS.textSec,
  },
  numberTextSelected: {
    color: COLORS.bg,
  },
  cardText: {
    flex: 1,
    fontSize: FONT_SIZES.md, // 15px - satisfies minimum font size rule
    color: COLORS.textPri,
    fontWeight: '600',
  },
  footer: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  disclosureText: {
    fontSize: FONT_SIZES.md, // 15px - satisfies minimum font size rule
    color: COLORS.textSec,
    textAlign: 'center',
    opacity: 0.8,
  },
});
