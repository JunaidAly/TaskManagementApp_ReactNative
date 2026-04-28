import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  ScrollView, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboardingStore } from '../../store';

const { width: SCREEN_W } = Dimensions.get('window');

const SLIDES = [
  {
    key: 'organize',
    gradient: ['#4F46E5', '#7C3AED'] as [string, string],
    icon: 'layers-outline' as const,
    emoji: '🗂️',
    title: 'Stay Organized',
    subtitle: 'Create tasks with priorities, categories, and due dates — everything in one place.',
  },
  {
    key: 'track',
    gradient: ['#0891B2', '#6366F1'] as [string, string],
    icon: 'bar-chart-outline' as const,
    emoji: '📊',
    title: 'Track Your Progress',
    subtitle: 'See streaks, completion rates, and weekly activity to stay on top of your goals.',
  },
  {
    key: 'achieve',
    gradient: ['#059669', '#10B981'] as [string, string],
    icon: 'trophy-outline' as const,
    emoji: '🏆',
    title: 'Achieve Every Day',
    subtitle: 'Break big goals into subtasks, set recurring habits, and celebrate your wins.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setHasSeenOnboarding } = useOnboardingStore();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const dotAnim = useRef(SLIDES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;

  // Animate dots when index changes
  const animateDots = (idx: number) => {
    SLIDES.forEach((_, i) => {
      Animated.spring(dotAnim[i], {
        toValue: i === idx ? 1 : 0,
        useNativeDriver: false,
        speed: 18,
        bounciness: 6,
      }).start();
    });
  };

  const goTo = (idx: number) => {
    scrollRef.current?.scrollTo({ x: idx * SCREEN_W, animated: true });
    setCurrentIndex(idx);
    animateDots(idx);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      goTo(currentIndex + 1);
    } else {
      finish();
    }
  };

  const finish = async () => {
    await setHasSeenOnboarding(true);
    router.replace('/auth/login');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, index) => (
          <LinearGradient
            key={slide.key}
            colors={slide.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.slide, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}
          >
            {/* Background decorations */}
            <View style={styles.deco1} />
            <View style={styles.deco2} />
            <View style={styles.deco3} />

            {/* Skip */}
            {index < SLIDES.length - 1 && (
              <TouchableOpacity onPress={finish} style={styles.skipBtn}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            )}

            {/* Illustration */}
            <View style={styles.illustrationWrap}>
              <View style={styles.illustrationOuter}>
                <View style={styles.illustrationInner}>
                  <Text style={styles.emoji}>{slide.emoji}</Text>
                </View>
              </View>
            </View>

            {/* Text */}
            <View style={styles.textWrap}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.subtitle}>{slide.subtitle}</Text>
            </View>

            {/* Dots */}
            <View style={styles.dotsRow}>
              {SLIDES.map((_, i) => {
                const width = dotAnim[i].interpolate({ inputRange: [0, 1], outputRange: [8, 28] });
                const opacity = dotAnim[i].interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });
                return (
                  <Animated.View
                    key={i}
                    style={[styles.dot, { width, opacity }]}
                  />
                );
              })}
            </View>

            {/* CTA */}
            <TouchableOpacity onPress={handleNext} style={styles.ctaWrap} activeOpacity={0.9}>
              <View style={styles.ctaBtn}>
                <Text style={styles.ctaText}>
                  {index < SLIDES.length - 1 ? 'Continue' : 'Get Started'}
                </Text>
                <Ionicons
                  name={index < SLIDES.length - 1 ? 'arrow-forward' : 'checkmark'}
                  size={18}
                  color={slide.gradient[0]}
                />
              </View>
            </TouchableOpacity>
          </LinearGradient>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    width: SCREEN_W,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    overflow: 'hidden',
  },
  deco1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(255,255,255,0.06)', top: -80, right: -80 },
  deco2: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.05)', bottom: 60, left: -40 },
  deco3: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.07)', top: '35%', left: -20 },
  skipBtn: { alignSelf: 'flex-end', paddingHorizontal: 4, paddingVertical: 2 },
  skipText: { fontSize: 14, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
  illustrationWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  illustrationOuter: {
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  illustrationInner: {
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  emoji: { fontSize: 64 },
  textWrap: { alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 12, lineHeight: 34 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 22, maxWidth: 280 },
  dotsRow: { flexDirection: 'row', gap: 6, marginBottom: 24 },
  dot: { height: 8, borderRadius: 4, backgroundColor: '#fff' },
  ctaWrap: { width: '100%' },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8,
  },
  ctaText: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
});
