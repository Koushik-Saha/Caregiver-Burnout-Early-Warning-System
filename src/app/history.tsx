import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, StatusBar, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { getCheckinHistory, CheckinData } from '@/lib/checkin';
import { computeCareLoad } from '@/lib/score';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - (SPACING.lg * 2);
const CHART_HEIGHT = 220;

// Y coordinate calculation helper for absolute overlays
const GRAPH_TOP = 15;
const GRAPH_BOTTOM = 180;
const GRAPH_HEIGHT = GRAPH_BOTTOM - GRAPH_TOP;

function getYCoord(score: number): number {
  return GRAPH_BOTTOM - (score / 100) * GRAPH_HEIGHT;
}

export default function HistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<CheckinData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Controls the display of the preview sample chart
  const [showSample, setShowSample] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<{ value: number; x: number; y: number } | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const storedHistory = await getCheckinHistory();
        
        // Map stored items to friendly display dates
        const formattedHistory = storedHistory.map((item) => {
          const date = new Date(item.date);
          const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          return {
            ...item,
            date: dateString,
          };
        });

        setHistory(formattedHistory);
      } catch (err) {
        console.error('Error loading check-in history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const hasEnoughData = history.length >= 2;

  // Extract scores and labels for the real chart
  const lastEight = history.slice(-8);
  const chartScores = lastEight.map((h) => h.totalScore);
  const chartLabels = lastEight.map((h) => h.date.split(',')[0]);

  // Calculate current risk band and color from the latest score
  const latestScore = chartScores[chartScores.length - 1] ?? 50;
  const currentDetails = computeCareLoad({ phq2Score: 0, careHours: 0 }, latestScore);
  const currentLineColor = currentDetails.bandColor;

  /**
   * Helper function to render the line chart with reference lines and custom styles.
   */
  const renderChart = (scores: number[], labels: string[], lineColor: string) => {
    return (
      <View style={styles.chartContainer}>
        {/* Reference Lines - Absolute Overlays */}
        <View style={styles.refLineContainer} pointerEvents="none">
          {/* High Reference Line (y = 80) */}
          <View style={[styles.refLine, { top: getYCoord(80), borderColor: COLORS.coral }]}>
            <Text style={[styles.refLabel, { color: COLORS.coral }]}>High</Text>
          </View>
          
          {/* Elevated Reference Line (y = 65) */}
          <View style={[styles.refLine, { top: getYCoord(65), borderColor: COLORS.amber }]}>
            <Text style={[styles.refLabel, { color: COLORS.amber }]}>Elevated</Text>
          </View>
          
          {/* Moderate Reference Line (y = 45) */}
          <View style={[styles.refLine, { top: getYCoord(45), borderColor: COLORS.teal }]}>
            <Text style={[styles.refLabel, { color: COLORS.teal }]}>Moderate</Text>
          </View>
        </View>

        <LineChart
          data={{
            labels: labels,
            datasets: [{ data: scores }],
          }}
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          fromZero={true}
          withInnerLines={false}
          withOuterLines={false}
          withHorizontalLabels={true}
          withVerticalLabels={true}
          chartConfig={{
            backgroundColor: COLORS.bg,
            backgroundGradientFrom: COLORS.bg,
            backgroundGradientTo: COLORS.bg,
            decimalPlaces: 0,
            color: (opacity = 1) => lineColor,
            labelColor: (opacity = 1) => COLORS.textSec,
            propsForBackgroundLines: {
              strokeWidth: 0, // Hides standard grid lines
            },
            propsForDots: {
              r: '8', // Larger touch target
              strokeWidth: '2',
              stroke: COLORS.bg,
            },
            propsForLabels: {
              fontSize: 15, // Minimum accessibility font size
            },
          }}
          onDataPointClick={(data) => {
            setSelectedPoint({
              value: data.value,
              x: data.x,
              y: data.y,
            });
          }}
          bezier
          style={styles.chart}
        />

        {/* Tooltip Overlay */}
        {selectedPoint && (
          <Pressable 
            style={StyleSheet.absoluteFill} 
            onPress={() => setSelectedPoint(null)}
          >
            <View 
              style={[
                styles.tooltip, 
                { 
                  top: selectedPoint.y - 35, 
                  left: selectedPoint.x - 22 
                }
              ]}
            >
              <Text style={styles.tooltipText}>{selectedPoint.value}</Text>
            </View>
          </Pressable>
        )}
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>Score History</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.teal} style={{ marginBottom: SPACING.md }} />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : !hasEnoughData ? (
        /* Empty State */
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Sample Chart rendered ABOVE empty state details if toggled */}
          {showSample && (
            <View style={styles.chartSection}>
              <Text style={styles.sectionTitle}>Sample Trend</Text>
              {renderChart([42, 48, 51, 55, 59, 64, 61, 60], ['Wk1','Wk2','Wk3','Wk4','Wk5','Wk6','Wk7','Wk8'], '#2DD4BF')}
            </View>
          )}

          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Your score history will appear here</Text>
            <Text style={styles.emptySubtitle}>
              Come back after your first two check-ins to see your trend
            </Text>

            {!showSample && (
              <Pressable
                onPress={() => setShowSample(true)}
                style={styles.demoButton}
                accessibilityRole="button"
                accessibilityLabel="Show sample chart and check-in trend for preview"
              >
                <Text style={styles.demoButtonText}>View sample chart</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      ) : (
        /* Chart & Historical Cards list */
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Section: Chart */}
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Trend over time</Text>
            {renderChart(chartScores, chartLabels, currentLineColor)}
          </View>

          {/* Section: Historical check-in cards */}
          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>Past check-ins</Text>
            
            {/* Last 4 entries, newest first */}
            {history.slice().reverse().slice(0, 4).map((entry, index) => {
              const details = computeCareLoad({ phq2Score: 0, careHours: 0 }, entry.totalScore);
              return (
                <View key={index} style={styles.historyCard}>
                  <View style={styles.cardLeft}>
                    <Text style={styles.cardDate}>{entry.date}</Text>
                    <Text style={styles.cardSubtitle}>
                      {details.band.charAt(0).toUpperCase() + details.band.slice(1)} Risk
                    </Text>
                  </View>
                  <View style={styles.cardRight}>
                    <View style={[styles.badge, { backgroundColor: details.bandColor }]}>
                      <Text style={styles.badgeText}>{entry.totalScore}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSec,
  },
  scrollContent: {
    paddingTop: 48, // Moved all content to paddingTop: 48, not centered
    paddingBottom: SPACING.xxl,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 24, // Flows naturally from the top of ScrollView
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg, // 18px
    fontWeight: 'bold',
    color: COLORS.textPri,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    lineHeight: 26,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md, // 15px - satisfies minimum font size rule
    color: COLORS.textSec,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xxl,
  },
  demoButton: {
    backgroundColor: COLORS.teal,
    height: 56, // Satisfies minimum 56px touch target constraint
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  demoButtonText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.bg,
    fontWeight: 'bold',
  },
  chartSection: {
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md, // 15px
    fontWeight: 'bold',
    color: COLORS.textPri,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: SPACING.md,
  },
  chartContainer: {
    position: 'relative',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  chart: {
    marginLeft: -10, // Adjust chart kit left margin
  },
  refLineContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  refLine: {
    position: 'absolute',
    left: 45, // Align with graph grid start
    right: 15,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  refLabel: {
    fontSize: FONT_SIZES.md, // 15px - satisfies minimum font size rule
    fontWeight: 'bold',
    opacity: 0.8,
    marginTop: -20,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 4,
  },
  tooltip: {
    position: 'absolute',
    width: 54, // Wider to fit larger text
    height: 32, // Taller to fit larger text
    backgroundColor: COLORS.textPri,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tooltipText: {
    color: COLORS.bg,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.md, // 15px - satisfies minimum font size rule
  },
  listSection: {
    marginTop: SPACING.lg,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 68, // 2 lines tall, satisfies height rules
    marginBottom: SPACING.sm,
  },
  cardLeft: {
    flex: 1,
  },
  cardDate: {
    fontSize: FONT_SIZES.md, // 15px
    fontWeight: 'bold',
    color: COLORS.textPri,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.md, // 15px
    color: COLORS.textSec,
  },
  cardRight: {},
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: FONT_SIZES.md, // 15px
    fontWeight: 'bold',
    color: COLORS.bg,
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
});
