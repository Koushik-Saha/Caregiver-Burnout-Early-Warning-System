import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, StatusBar, Alert, ActivityIndicator } from 'react-native';
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

// Circle dimensions
const RADIUS = 70;
const STROKE_WIDTH = 12;
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

      {/* 1. Animated Circular Score Ring */}
      <Animated.View 
        entering={FadeIn.duration(800)} 
        style={styles.ringSection}
      >
        <View style={styles.ringWrapper}>
          <Svg width={180} height={180} style={styles.svg}>
            {/* Background Track Circle */}
            <Circle
              cx={90}
              cy={90}
              r={RADIUS}
              stroke={COLORS.border}
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
            />
            {/* Active Progress Circle */}
            <AnimatedCircle
              cx={90}
              cy={90}
              r={RADIUS}
              stroke={bandColor}
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
              strokeDasharray={CIRCUMFERENCE}
              animatedProps={animatedCircleProps}
              strokeLinecap="round"
              transform={`rotate(-90 90 90)`} // Start at the top (12 o'clock)
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

      {/* 3. Action Section */}
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

        {/* 4. History Navigation Link */}
        <Pressable
          onPress={handleHistoryAction}
          style={styles.linkButton}
          accessibilityRole="link"
          accessibilityLabel="View your past check-in scores and history"
        >
          <Text style={styles.linkLabel}>View score history</Text>
        </Pressable>
      </Animated.View>
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
    width: 180,
    height: 180,
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
    marginVertical: SPACING.lg,
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
  actionContainer: {
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
