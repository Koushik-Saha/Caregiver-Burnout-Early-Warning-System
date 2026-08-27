import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, StatusBar, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  // Animation values using useRef to maintain stability
  const logoFade = useRef(new Animated.Value(0)).current;
  const labelFade = useRef(new Animated.Value(0)).current;
  
  const headlineAnim = useRef(new Animated.Value(0)).current;
  
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const card3Anim = useRef(new Animated.Value(0)).current;
  
  const buttonFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Run animations in parallel with their specified delays
    Animated.parallel([
      Animated.timing(logoFade, {
        toValue: 1,
        duration: 400,
        delay: 0,
        useNativeDriver: true,
      }),
      Animated.timing(labelFade, {
        toValue: 1,
        duration: 300,
        delay: 150,
        useNativeDriver: true,
      }),
      Animated.timing(headlineAnim, {
        toValue: 1,
        duration: 400,
        delay: 250,
        useNativeDriver: true,
      }),
      Animated.timing(card1Anim, {
        toValue: 1,
        duration: 300,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(card2Anim, {
        toValue: 1,
        duration: 300,
        delay: 500,
        useNativeDriver: true,
      }),
      Animated.timing(card3Anim, {
        toValue: 1,
        duration: 300,
        delay: 600,
        useNativeDriver: true,
      }),
      Animated.timing(buttonFade, {
        toValue: 1,
        duration: 300,
        delay: 750,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = () => {
    router.push('/onboarding/who-you-care-for');
  };

  // Interpolate translate offsets for the sliding movements
  const headlineTranslateY = headlineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  const card1TranslateY = card1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 0],
  });

  const card2TranslateY = card2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 0],
  });

  const card3TranslateY = card3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 0],
  });

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Section: Logo Mark, App Name & Header */}
        <View style={styles.logoAndHeaderContainer}>
          {/* Logo Mark: Fade in */}
          <Animated.View style={{ opacity: logoFade }}>
            <View style={styles.logoMark}>
              <Text style={styles.logoEmoji}>🌿</Text>
            </View>
          </Animated.View>
          
          {/* App Label: Fade in */}
          <Animated.View style={{ opacity: labelFade }}>
            <Text style={styles.appName}>CareLoad</Text>
          </Animated.View>
          
          {/* Headline: Fade in + Slide up 12px */}
          <Animated.View style={{ 
            opacity: headlineAnim, 
            transform: [{ translateY: headlineTranslateY }] 
          }}>
            <Text style={styles.headline}>
              You take care of everyone. Who's watching out for you?
            </Text>
          </Animated.View>
        </View>

        {/* Middle Section: 3 Benefit Cards */}
        <View style={styles.benefitContainer}>
          
          {/* Benefit Card 1: Fade in + Slide up 8px */}
          <Animated.View style={{ 
            opacity: card1Anim, 
            transform: [{ translateY: card1TranslateY }] 
          }}>
            <View style={styles.card}>
              <Text style={styles.cardIcon} accessibilityElementsHidden={true} importantForAccessibility="no">🌱</Text>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>Your weekly score</Text>
                <Text style={styles.cardDescription}>
                  One number that shows if your care load is getting too heavy.
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Benefit Card 2: Fade in + Slide up 8px */}
          <Animated.View style={{ 
            opacity: card2Anim, 
            transform: [{ translateY: card2TranslateY }] 
          }}>
            <View style={styles.card}>
              <Text style={styles.cardIcon} accessibilityElementsHidden={true} importantForAccessibility="no">⏱️</Text>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>2 minutes a week</Text>
                <Text style={styles.cardDescription}>
                  Just two questions. That's it.
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Benefit Card 3: Fade in + Slide up 8px */}
          <Animated.View style={{ 
            opacity: card3Anim, 
            transform: [{ translateY: card3TranslateY }] 
          }}>
            <View style={styles.card}>
              <Text style={styles.cardIcon} accessibilityElementsHidden={true} importantForAccessibility="no">🧭</Text>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>Help when you need it</Text>
                <Text style={styles.cardDescription}>
                  We show you real support options nearby when your score rises.
                </Text>
              </View>
            </View>
          </Animated.View>

        </View>

        {/* Bottom Section: Call to Action pinned to bottom - Fade in */}
        <Animated.View style={{ opacity: buttonFade, marginTop: 'auto' }}>
          <View style={styles.footerContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed
              ]}
              onPress={handlePress}
              accessibilityRole="button"
              accessibilityLabel="Get started and begin the onboarding setup"
              accessibilityHint="Starts the caregiver onboarding process"
            >
              <Text style={styles.buttonText}>Get started</Text>
            </Pressable>
            <Text style={styles.hintText}>
              No account needed to try it
            </Text>
          </View>
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
    paddingBottom: SPACING.lg,
  },
  logoAndHeaderContainer: {
    paddingTop: 48,
    alignItems: 'center',
    marginBottom: 32,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(45,212,191,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(45,212,191,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  logoEmoji: {
    fontSize: 32,
  },
  appName: {
    fontSize: FONT_SIZES.md, // 15px - satisfies minimum font size rule
    color: COLORS.teal,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  headline: {
    fontSize: FONT_SIZES.xl, // 24px
    color: COLORS.textPri,
    fontWeight: 'bold',
    lineHeight: 32,
    textAlign: 'center',
  },
  benefitContainer: {
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: '#1C2333',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#2D3748',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 10,
  },
  cardIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FONT_SIZES.md, // 15px - satisfies minimum font size rule
    fontWeight: 'bold',
    color: COLORS.textPri,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: FONT_SIZES.md, // 15px - satisfies minimum font size rule
    color: COLORS.textSec,
    lineHeight: 22,
  },
  footerContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  button: {
    backgroundColor: COLORS.teal,
    width: '100%',
    height: 56, // Satisfies minimum 56px touch target constraint
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg, // 18px
    color: COLORS.bg,
    fontWeight: '700',
  },
  hintText: {
    fontSize: FONT_SIZES.md, // 15px - satisfies minimum font size rule
    color: COLORS.textSec,
  },
});
