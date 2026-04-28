import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, RefreshControl, StyleSheet,
  Animated, StatusBar, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Loading, TaskCard, EmptyState, QuickAddSheet } from '../../components';
import { useTaskStore, useAuthStore, Task } from '../../store';
import { getTasks, updateTask, deleteTask as deleteApi } from '../../services/task.service';
import { Alert } from 'react-native';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isWithinDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);
  return d > now && d <= future;
}

interface SectionProps { title: string; color: string; icon: keyof typeof Ionicons.glyphMap; tasks: Task[]; onPress: (id: string) => void; onComplete: (id: string) => void; onDelete: (id: string) => void }

function TaskSection({ title, color, icon, tasks, onPress, onComplete, onDelete }: SectionProps) {
  if (tasks.length === 0) return null;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionDot, { backgroundColor: color }]}>
          <Ionicons name={icon} size={14} color="#fff" />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={[styles.sectionBadge, { backgroundColor: color + '20' }]}>
          <Text style={[styles.sectionCount, { color }]}>{tasks.length}</Text>
        </View>
      </View>
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onPress={() => onPress(task._id)}
          onSwipeComplete={task.status !== 'done' ? () => onComplete(task._id) : undefined}
          onSwipeDelete={() => onDelete(task._id)}
        />
      ))}
    </View>
  );
}

export default function TodayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tasks, setTasks, setLoading, isLoading, updateTask: updateStore, deleteTask: deleteStore } = useTaskStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await getTasks({ isArchived: false, sortBy: 'dueDate', order: 'asc' });
      setTasks(res.data.tasks);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData();
    Animated.timing(headerAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, []);

  const handleComplete = async (id: string) => {
    try {
      const res = await updateTask(id, { status: 'done' });
      updateStore(id, res.data.task);
      Toast.show({ type: 'success', text1: '✅ Completed!', text2: 'Great work!' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update' });
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteApi(id);
            deleteStore(id);
            Toast.show({ type: 'success', text1: 'Task deleted' });
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to delete' });
          }
        },
      },
    ]);
  };

  const now = new Date();
  const today = tasks.filter(
    (t) => t.dueDate && isSameDay(new Date(t.dueDate), now) && t.status !== 'done' && !t.isArchived
  );
  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now && !isSameDay(new Date(t.dueDate), now) && t.status !== 'done' && !t.isArchived
  );
  const upcoming = tasks.filter(
    (t) => t.dueDate && isWithinDays(t.dueDate, 7) && !isSameDay(new Date(t.dueDate), now) && !t.isArchived
  );
  const noDate = tasks.filter((t) => !t.dueDate && t.status !== 'done' && !t.isArchived).slice(0, 5);

  const todayDone = tasks.filter(
    (t) => t.dueDate && isSameDay(new Date(t.dueDate), now) && t.status === 'done'
  ).length;
  const todayTotal = today.length + todayDone;
  const pct = todayTotal > 0 ? (todayDone / todayTotal) * 100 : 0;

  if (isLoading && !refreshing) return <Loading fullscreen message="Loading today's tasks..." />;

  const goTo = (id: string) => router.push(`/tasks/${id}`);

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#6366F1" />
      }
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={['#4F46E5', '#7C3AED', '#9333EA']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.deco1} /><View style={styles.deco2} /><View style={styles.deco3} />

        <Animated.View style={{ opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }] }}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{user?.name || 'there'} 👋</Text>

          {/* Today's date */}
          <Text style={styles.dateStr}>
            {now.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>

          {/* Today's progress */}
          {todayTotal > 0 && (
            <View style={styles.progressWrap}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>{todayDone}/{todayTotal} tasks done today</Text>
                <Text style={styles.progressPct}>{Math.round(pct)}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, { width: `${pct}%` }]} />
              </View>
            </View>
          )}
        </Animated.View>
      </LinearGradient>

      {/* Quick stats row */}
      <View style={styles.statsRow}>
        {[
          { label: 'Overdue', count: overdue.length, color: '#EF4444', icon: 'warning-outline' as const },
          { label: 'Today',   count: today.length,   color: '#6366F1', icon: 'today-outline' as const },
          { label: 'Upcoming',count: upcoming.length, color: '#10B981', icon: 'calendar-outline' as const },
        ].map((s) => (
          <View key={s.label} style={[styles.statChip, { borderColor: s.color + '40' }]}>
            <Ionicons name={s.icon} size={14} color={s.color} />
            <Text style={[styles.statChipCount, { color: s.color }]}>{s.count}</Text>
            <Text style={styles.statChipLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Task sections */}
      <View style={styles.body}>
        <TaskSection title="Overdue" color="#EF4444" icon="warning-outline" tasks={overdue} onPress={goTo} onComplete={handleComplete} onDelete={handleDelete} />
        <TaskSection title="Today" color="#6366F1" icon="today-outline" tasks={today} onPress={goTo} onComplete={handleComplete} onDelete={handleDelete} />
        <TaskSection title="Upcoming (7 days)" color="#10B981" icon="calendar-outline" tasks={upcoming} onPress={goTo} onComplete={handleComplete} onDelete={handleDelete} />
        <TaskSection title="Inbox (no date)" color="#94A3B8" icon="inbox-outline" tasks={noDate} onPress={goTo} onComplete={handleComplete} onDelete={handleDelete} />

        {overdue.length === 0 && today.length === 0 && upcoming.length === 0 && noDate.length === 0 && (
          <EmptyState
            title="All clear!"
            description="No tasks yet. Add one to get started."
            actionLabel="Create Task"
            onAction={() => router.push('/tasks/create')}
            icon="🎉"
          />
        )}
      </View>

      {/* FAB — tap: create screen, long press: quick add */}
      <TouchableOpacity
        onPress={() => router.push('/tasks/create')}
        onLongPress={() => setQuickAddVisible(true)}
        activeOpacity={0.9}
        style={styles.fab}
      >
        <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.fabGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      <QuickAddSheet visible={quickAddVisible} onClose={() => setQuickAddVisible(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 24, paddingBottom: 32, overflow: 'hidden' },
  deco1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -40 },
  deco2: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.05)', bottom: 0, right: 80 },
  deco3: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -10, left: 40 },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  userName: { fontSize: 24, color: '#fff', fontWeight: '800', marginBottom: 4 },
  dateStr: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 16 },
  progressWrap: { marginTop: 4 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  progressPct: { fontSize: 12, color: '#fff', fontWeight: '700' },
  progressTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: '#fff', borderRadius: 3 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  statChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 10, borderWidth: 1, backgroundColor: '#fff' },
  statChipCount: { fontSize: 14, fontWeight: '800' },
  statChipLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  body: { paddingHorizontal: 16, paddingBottom: 100 },
  section: { marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  sectionDot: { width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#0F172A' },
  sectionBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  sectionCount: { fontSize: 12, fontWeight: '700' },
  fab: { position: 'absolute', bottom: 24, right: 20, borderRadius: 28, overflow: 'hidden', shadowColor: '#6366F1', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 14 },
  fabGradient: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
});
