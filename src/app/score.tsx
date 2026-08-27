import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, StatusBar, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedProps, 
  withTiming, 
  Easing, 
  FadeIn, 
  FadeInDown 
} from 'react-native-reanimated';
import { requestPermission, scheduleWeeklyReminder } from '@/lib/notifications';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { useCareStore } from '@/lib/store';
import { computeCareLoad, CareLoadResult } from '@/lib/score';
import { getCheckinHistory } from '@/lib/checkin';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Circle dimensions for a bigger score ring
const RADIUS = 80;
const STROKE_WIDTH = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const INSIGHTS = {
  manageable: "Your care load is in a healthy range this week. Keep protecting your own time.",
  moderate: "You're carrying a real load. Worth keeping an eye on over the next few weeks.",
  elevated: "Your score has been rising. This is the pattern that often leads to burnout.",
  high: "Your care load is in a zone most people can't sustain for long. Please look at the options below.",
};

const TIPS = {
  manageable: "Even low weeks benefit from one hour that's just for you.",
  moderate: "Try reaching out to one person in your support network this week.",
  elevated: "A single 4-hour break can reset your baseline — we can help you find one.",
  high: "Please don't do this alone. Even one conversation with a support line helps.",
};

export default function ScoreScreen() {
  const router = useRouter();
  
  // Read state from Zustand store
  const weeklyScore = useCareStore((state) => state.weeklyScore);
  const hoursPerWeek = useCareStore((state) => state.hoursPerWeek);

  const [loading, setLoading] = useState(true);
  const [scoreResult, setScoreResult] = useState<CareLoadResult | null>(null);

  // Breakdown contribution values
  const [moodVal, setMoodVal] = useState(0);
  const [careVal, setCareVal] = useState(0);
  const [otherVal, setOtherVal] = useState(0);

  // Reanimated shared value for the ring animation
  const ringProgress = useSharedValue(0);

  useEffect(() => {
    async function loadRealData() {
      try {
        const history = await getCheckinHistory();
        const latest = history[history.length - 1];
        
        // Use real values if available, otherwise fallback to mock values
        const phq2 = latest ? (latest.q1 + latest.q2) : (weeklyScore !== null ? weeklyScore : 4);
        const careHrs = hoursPerWeek !== null ? hoursPerWeek : 50;

        const result = computeCareLoad({
          phq2Score: phq2,
          careHours: careHrs,
        });
        
        setScoreResult(result);

        // Calculate breakdown values:
        let phq2ScoreScaled = 0.5;
        if (phq2 === 0) phq2ScoreScaled = 0.0;
        else if (phq2 === 1) phq2ScoreScaled = 0.12;
        else if (phq2 === 2) phq2ScoreScaled = 0.30;
        else if (phq2 === 3) phq2ScoreScaled = 0.52;
        else if (phq2 === 4) phq2ScoreScaled = 0.72;
        else if (phq2 === 5) phq2ScoreScaled = 0.88;
        else if (phq2 === 6) phq2ScoreScaled = 1.0;
        const moodContribution = Math.round(phq2ScoreScaled * 28);

        let careHoursScaled = 0.5;
        if (careHrs < 20) careHoursScaled = 0.15;
        else if (careHrs >= 20 && careHrs <= 40) careHoursScaled = 0.38;
        else if (careHrs > 40 && careHrs <= 60) careHoursScaled = 0.68;
        else if (careHrs > 60) careHoursScaled = 1.0;
        const careContribution = Math.round(careHoursScaled * 24);

        // Remainder aligns with final rounded score
        const remainingContribution = Math.max(0, result.score - moodContribution - careContribution);

        setMoodVal(moodContribution);
        setCareVal(careContribution);
        setOtherVal(remainingContribution);
        
        // Trigger the ring animation after loading completes
        ringProgress.value = 0;
        ringProgress.value = withTiming(result.score, {
          duration: 1200,
          easing: Easing.out(Easing.quad),
        });
      } catch (err) {
        console.error('Error loading score details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRealData();
  }, [weeklyScore, hoursPerWeek]);

  // Animated props for the SVG Circle
  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = CIRCUMFERENCE - (ringProgress.value / 100) * CIRCUMFERENCE;
    return {
      strokeDashoffset,
    };
  });

  if (loading || !scoreResult) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.teal} />
        <Text style={styles.loadingText}>Loading your score...</Text>
      </SafeAreaView>
    );
  }

  const { score, band, bandColor } = scoreResult;

  const handlePrimaryAction = async () => {
    if (score < 65) {
      try {
        const granted = await requestPermission();
        if (granted) {
          await scheduleWeeklyReminder();
          Alert.alert('Success', 'Reminder set for every Tuesday at 8pm');
        } else {
          Alert.alert(
            'Reminders Optional',
            'You can turn on reminders in your phone settings anytime'
          );
        }
      } catch (error) {
        console.error('Error setting up reminders:', error);
      }
    } else {
      router.push('/resources');
    }
  };

  const handleHistoryAction = () => {
    router.push('/history');
  };

  // Capitalize band name for UI display
  const displayBand = band.charAt(0).toUpperCase() + band.slice(1);

  // Card background color uses bandColor with 15% opacity
  const cardBgColor = `${bandColor}1F`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Animated Circular Score Ring */}
        <Animated.View 
          entering={FadeIn.duration(800)} 
          style={styles.ringSection}
        >
          <View style={styles.ringWrapper}>
            <Svg width={200} height={200} style={styles.svg}>
              {/* Background Track Circle */}
              <Circle
                cx={100}
                cy={100}
                r={RADIUS}
                stroke={COLORS.border}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
              />
              {/* Active Progress Circle */}
              <AnimatedCircle
                cx={100}
                cy={100}
                r={RADIUS}
                stroke={bandColor}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
                strokeDasharray={CIRCUMFERENCE}
                animatedProps={animatedCircleProps}
                strokeLinecap="round"
                transform={`rotate(-90 100 100)`} // Start at 12 o'clock centered at 100,100
              />
            </Svg>
            
            {/* Central Text Label */}
            <View style={styles.centerTextContainer}>
              <Text style={styles.scoreNumber}>{score}</Text>
              <Text style={[styles.bandLabel, { color: bandColor }]}>{displayBand}</Text>
            </View>
          </View>
        </Animated.View>

        {/* 2. "This Week" Insight Card */}
        <Animated.View 
          entering={FadeInDown.delay(400).duration(800)} 
          style={[styles.card, { backgroundColor: cardBgColor }]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>This week</Text>
            <View style={[styles.statusIndicator, { backgroundColor: bandColor }]} />
          </View>
          
          <Text style={styles.insightText}>{INSIGHTS[band]}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.tipContainer}>
            <Text style={styles.tipLabel}>Suggestion</Text>
            <Text style={styles.tipText}>{TIPS[band]}</Text>
          </View>
        </Animated.View>

        {/* 3. Score Breakdown Card */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(800)}
          style={styles.breakdownCard}
        >
          <Text style={styles.breakdownTitle}>Burnout Risk Breakdown</Text>
          
          {/* Row 1: Mood check-in */}
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownHeaderRow}>
              <Text style={styles.breakdownLabel}>Mood check-in</Text>
              <Text style={[styles.breakdownValue, { color: bandColor }]}>{moodVal} / 28</Text>
            </View>
            <View style={styles.breakdownProgressBg}>
              <View style={[styles.breakdownProgressFill, { width: `${(moodVal / 28) * 100}%`, backgroundColor: bandColor }]} />
            </View>
          </View>

          {/* Row 2: Care hours */}
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownHeaderRow}>
              <Text style={styles.breakdownLabel}>Care hours</Text>
              <Text style={[styles.breakdownValue, { color: bandColor }]}>{careVal} / 24</Text>
            </View>
            <View style={styles.breakdownProgressBg}>
              <View style={[styles.breakdownProgressFill, { width: `${(careVal / 24) * 100}%`, backgroundColor: bandColor }]} />
            </View>
          </View>

          {/* Row 3: Other signals */}
          <View style={styles.breakdownRowNoMargin}>
            <View style={styles.breakdownHeaderRow}>
              <Text style={styles.breakdownLabel}>Other signals</Text>
              <Text style={[styles.breakdownValue, { color: bandColor }]}>{otherVal} / 48</Text>
            </View>
            <View style={styles.breakdownProgressBg}>
              <View style={[styles.breakdownProgressFill, { width: `${(otherVal / 48) * 100}%`, backgroundColor: bandColor }]} />
            </View>
          </View>
        </Animated.View>

        {/* 4. Action Section */}
        <Animated.View 
          entering={FadeInDown.delay(800).duration(800)} 
          style={styles.actionContainer}
        >
          <Pressable
            onPress={handlePrimaryAction}
            style={styles.button}
            accessibilityRole="button"
            accessibilityLabel={
              score < 65 
                ? "Set a weekly check-in reminder on your device" 
                : "Find support resources near you"
            }
          >
            <Text style={styles.buttonText}>
              {score < 65 ? "Set a weekly reminder" : "Find help near me →"}
            </Text>
          </Pressable>

          {/* History Navigation Link */}
          <Pressable
            onPress={handleHistoryAction}
            style={styles.linkButton}
            accessibilityRole="link"
            accessibilityLabel="View your past check-in scores and history"
          >
            <Text style={styles.linkLabel}>View score history</Text>
          </Pressable>
        </Animated.View>
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
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md, // 15px
    color: COLORS.textSec,
    fontWeight: '500',
  },
  ringSection: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  ringWrapper: {
    width: 200, // Increased size
    height: 200, // Increased size
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  centerTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: FONT_SIZES.xxl, // 32px
    fontWeight: 'bold',
    color: COLORS.textPri,
  },
  bandLabel: {
    fontSize: FONT_SIZES.md, // 15px
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 4,
    letterSpacing: 1.2,
  },
  card: {
    borderRadius: 16,
    padding: SPACING.lg,
    marginTop: 32, // Closed the gap: fixed at 32px from the ring
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONT_SIZES.md, // 15px
    fontWeight: 'bold',
    color: COLORS.textPri,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  insightText: {
    fontSize: FONT_SIZES.md, // 15px - satisfies minimum font size rule
    color: COLORS.textPri,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: SPACING.md,
  },
  tipContainer: {},
  tipLabel: {
    fontSize: FONT_SIZES.md, // 15px
    fontWeight: 'bold',
    color: COLORS.textSec,
    marginBottom: 4,
  },
  tipText: {
    fontSize: FONT_SIZES.md, // 15px - satisfies minimum font size rule
    color: COLORS.textSec,
    lineHeight: 22,
  },
  breakdownCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  breakdownTitle: {
    fontSize: FONT_SIZES.md, // 15px
    fontWeight: 'bold',
    color: COLORS.textPri,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
  },
  breakdownRow: {
    marginBottom: 12,
  },
  breakdownRowNoMargin: {
    marginBottom: 0,
  },
  breakdownHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  breakdownLabel: {
    fontSize: FONT_SIZES.md, // 15px
    color: COLORS.textPri,
  },
  breakdownValue: {
    fontSize: FONT_SIZES.md, // 15px
    fontWeight: 'bold',
  },
  breakdownProgressBg: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  breakdownProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionContainer: {
    marginTop: 'auto',
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  button: {
    backgroundColor: COLORS.teal,
    width: '100%',
    height: 56, // Satisfies minimum 56px touch target constraint
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg, // 18px
    color: COLORS.bg,
    fontWeight: 'bold',
  },
  linkButton: {
    height: 48, // Satisfies minimum 48px touch target
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  linkLabel: {
    fontSize: FONT_SIZES.md, // 15px - satisfies minimum font size rule
    color: COLORS.textSec,
    textDecorationLine: 'underline',
  },
});
