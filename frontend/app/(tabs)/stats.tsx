import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { Loading } from '../../components';
import { getAnalytics, AnalyticsResponse, getTaskStats } from '../../services/task.service';

const CATEGORY_CONFIG: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  work:     { label: 'Work',     icon: 'briefcase-outline',           color: '#6366F1' },
  personal: { label: 'Personal', icon: 'heart-outline',               color: '#EC4899' },
  health:   { label: 'Health',   icon: 'fitness-outline',             color: '#10B981' },
  shopping: { label: 'Shopping', icon: 'cart-outline',                 color: '#F59E0B' },
  finance:  { label: 'Finance',  icon: 'wallet-outline',               color: '#3B82F6' },
  other:    { label: 'Other',    icon: 'ellipsis-horizontal-outline',  color: '#94A3B8' },
};

function BarChart({ data, isDark }: { data: AnalyticsResponse['data']['weeklyData']; isDark: boolean }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <View style={chartStyles.container}>
      {data.map((d, i) => {
        const heightPct = (d.count / max) * 100;
        const isToday = i === data.length - 1;
        return (
          <View key={d.date} style={chartStyles.barWrap}>
            <Text style={[chartStyles.barCount, isDark && chartStyles.barCountDark, isToday && { color: '#6366F1' }]}>{d.count || ''}</Text>
            <View style={[chartStyles.barTrack, isDark && chartStyles.barTrackDark]}>
              <LinearGradient
                colors={isToday ? ['#6366F1', '#8B5CF6'] : isDark ? ['#334155', '#475569'] : ['#C7D2FE', '#A5B4FC']}
                style={[chartStyles.bar, { height: `${Math.max(heightPct, 5)}%` }]}
                start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }}
              />
            </View>
            <Text style={[chartStyles.barLabel, isDark && chartStyles.barLabelDark, isToday && { color: '#6366F1', fontWeight: '700' }]}>{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 4 },
  barWrap: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barCount: { fontSize: 10, fontWeight: '600', color: '#94A3B8', marginBottom: 3, height: 14 },
  barCountDark: { color: '#475569' },
  barTrack: { width: '100%', flex: 1, borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: '#F1F5F9' },
  barTrackDark: { backgroundColor: '#283548' },
  bar: { width: '100%', borderRadius: 4 },
  barLabel: { fontSize: 10, color: '#94A3B8', marginTop: 4 },
  barLabelDark: { color: '#475569' },
});

export default function StatsScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [analytics, setAnalytics] = useState<AnalyticsResponse['data'] | null>(null);
  const [stats, setStats] = useState({ totalTasks: 0, todoTasks: 0, inProgressTasks: 0, doneTasks: 0, archivedTasks: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const streakAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchAll = async () => {
    try {
      const [analyticsRes, statsRes] = await Promise.all([getAnalytics(), getTaskStats()]);
      setAnalytics(analyticsRes.data);
      setStats(statsRes.data);
      Animated.parallel([
        Animated.spring(streakAnim, { toValue: 1, useNativeDriver: true, speed: 6, bounciness: 8 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();
    } catch { /* show stale data */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  if (loading) return <Loading fullscreen message="Loading stats..." />;

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.doneTasks / stats.totalTasks) * 100) : 0;

  return (
    <ScrollView
      style={[styles.screen, isDark && styles.screenDark]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} tintColor="#6366F1" />}
    >
      {/* Streak hero */}
      <LinearGradient colors={['#4F46E5', '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.streakHero}>
        <View style={styles.deco1} /><View style={styles.deco2} />
        <Animated.View style={{ transform: [{ scale: streakAnim }], alignItems: 'center' }}>
          <Text style={styles.streakFire}>🔥</Text>
          <Text style={styles.streakNumber}>{analytics?.streak ?? 0}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </Animated.View>
        <Text style={styles.streakSub}>
          {analytics?.streak === 0 ? 'Complete a task today to start your streak!' : "Keep going! You're on a roll."}
        </Text>
      </LinearGradient>

      <Animated.View style={{ opacity: fadeAnim, padding: 16 }}>
        {/* Quick stats */}
        <View style={styles.quickStats}>
          {[
            { label: 'Total',       value: stats.totalTasks,      color: '#6366F1', icon: 'layers-outline' as const },
            { label: 'Done',        value: stats.doneTasks,       color: '#10B981', icon: 'checkmark-circle-outline' as const },
            { label: 'Active',      value: stats.inProgressTasks, color: '#F59E0B', icon: 'time-outline' as const },
            { label: 'On Time',     value: `${analytics?.onTimeRate ?? 0}%`, color: '#3B82F6', icon: 'timer-outline' as const },
          ].map((s) => (
            <View key={s.label} style={[styles.quickStat, isDark && styles.quickStatDark]}>
              <View style={[styles.quickStatIcon, { backgroundColor: s.color + '18' }]}>
                <Ionicons name={s.icon} size={18} color={s.color} />
              </View>
              <Text style={[styles.quickStatValue, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.quickStatLabel, isDark && styles.quickStatLabelDark]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Completion rate */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>Completion Rate</Text>
          <View style={styles.rateRow}>
            <Text style={styles.rateValue}>{completionRate}%</Text>
            <Text style={[styles.rateSub, isDark && styles.rateSubDark]}>{stats.doneTasks} of {stats.totalTasks} tasks done</Text>
          </View>
          <View style={[styles.rateTrack, isDark && styles.rateTrackDark]}>
            <LinearGradient colors={['#6366F1', '#10B981']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.rateFill, { width: `${completionRate}%` }]} />
          </View>
        </View>

        {/* Weekly chart */}
        {analytics?.weeklyData && (
          <View style={[styles.card, isDark && styles.cardDark]}>
            <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>This Week</Text>
            <Text style={[styles.cardSub, isDark && styles.cardSubDark]}>Tasks completed per day</Text>
            <View style={{ marginTop: 16 }}>
              <BarChart data={analytics.weeklyData} isDark={isDark} />
            </View>
            <Text style={[styles.cardFooter, isDark && styles.cardFooterDark]}>
              {analytics.totalCompletedLast30Days} tasks completed in last 30 days
            </Text>
          </View>
        )}

        {/* Category breakdown */}
        {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 && (
          <View style={[styles.card, isDark && styles.cardDark]}>
            <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>By Category</Text>
            {analytics.categoryBreakdown.map((cat) => {
              const cfg = CATEGORY_CONFIG[cat._id] ?? CATEGORY_CONFIG.other;
              const pct = cat.total > 0 ? (cat.done / cat.total) * 100 : 0;
              return (
                <View key={cat._id} style={styles.catRow}>
                  <View style={[styles.catIcon, { backgroundColor: cfg.color + '18' }]}>
                    <Ionicons name={cfg.icon} size={16} color={cfg.color} />
                  </View>
                  <View style={styles.catInfo}>
                    <View style={styles.catInfoRow}>
                      <Text style={[styles.catName, isDark && styles.catNameDark]}>{cfg.label}</Text>
                      <Text style={[styles.catCount, isDark && styles.catCountDark]}>{cat.done}/{cat.total}</Text>
                    </View>
                    <View style={[styles.catTrack, isDark && styles.catTrackDark]}>
                      <View style={[styles.catFill, { width: `${pct}%`, backgroundColor: cfg.color }]} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  screenDark: { backgroundColor: '#0F172A' },
  streakHero: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24, overflow: 'hidden' },
  deco1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.07)', top: -40, right: -30 },
  deco2: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)', bottom: 0, left: 20 },
  streakFire: { fontSize: 48, marginBottom: 4 },
  streakNumber: { fontSize: 56, fontWeight: '900', color: '#fff' },
  streakLabel: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  streakSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 10, textAlign: 'center' },
  quickStats: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  quickStat: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  quickStatDark: { backgroundColor: '#1E293B' },
  quickStatIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickStatValue: { fontSize: 20, fontWeight: '800' },
  quickStatLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '500', marginTop: 2 },
  quickStatLabelDark: { color: '#475569' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  cardDark: { backgroundColor: '#1E293B' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  cardTitleDark: { color: '#F1F5F9' },
  cardSub: { fontSize: 12, color: '#94A3B8' },
  cardSubDark: { color: '#475569' },
  cardFooter: { fontSize: 11, color: '#94A3B8', marginTop: 12, textAlign: 'center' },
  cardFooterDark: { color: '#475569' },
  rateRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 10 },
  rateValue: { fontSize: 32, fontWeight: '800', color: '#6366F1' },
  rateSub: { fontSize: 13, color: '#94A3B8' },
  rateSubDark: { color: '#475569' },
  rateTrack: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  rateTrackDark: { backgroundColor: '#334155' },
  rateFill: { height: 8, borderRadius: 4 },
  catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  catIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  catInfo: { flex: 1 },
  catInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  catName: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  catNameDark: { color: '#F1F5F9' },
  catCount: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  catCountDark: { color: '#475569' },
  catTrack: { height: 5, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  catTrackDark: { backgroundColor: '#334155' },
  catFill: { height: 5, borderRadius: 3 },
});
