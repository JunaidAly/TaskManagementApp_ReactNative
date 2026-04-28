import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Animated, StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import Toast from 'react-native-toast-message';
import { Loading, ErrorMessage, Button } from '../../components';
import { useTaskStore } from '../../store';
import { getTaskById, updateTask, deleteTask as deleteTaskApi, toggleSubtask } from '../../services/task.service';

const PRIORITY_CONFIG = {
  low:    { color: '#10B981', label: 'Low',    icon: 'arrow-down-circle-outline' as const },
  medium: { color: '#F59E0B', label: 'Medium', icon: 'remove-circle-outline' as const },
  high:   { color: '#EF4444', label: 'High',   icon: 'arrow-up-circle-outline' as const },
};

const CATEGORY_CONFIG: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  work:     { label: 'Work',     icon: 'briefcase-outline',           color: '#6366F1' },
  personal: { label: 'Personal', icon: 'heart-outline',               color: '#EC4899' },
  health:   { label: 'Health',   icon: 'fitness-outline',             color: '#10B981' },
  shopping: { label: 'Shopping', icon: 'cart-outline',                color: '#F59E0B' },
  finance:  { label: 'Finance',  icon: 'wallet-outline',              color: '#3B82F6' },
  other:    { label: 'Other',    icon: 'ellipsis-horizontal-outline', color: '#94A3B8' },
};

const STATUS_CONFIG = {
  'todo':        { color: '#6366F1', label: 'To Do',       icon: 'ellipse-outline' as const },
  'in-progress': { color: '#F59E0B', label: 'In Progress', icon: 'time-outline' as const },
  'done':        { color: '#10B981', label: 'Done',        icon: 'checkmark-circle-outline' as const },
};

export default function TaskDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { updateTask: updateTaskStore, deleteTask: deleteTaskStore } = useTaskStore();

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingSubtask, setTogglingSubtask] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getTaskById(id);
      setTask(res.data.task);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 4 }),
      ]).start();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch task');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTask(); }, [id]);

  const handleStatusChange = async (newStatus: 'todo' | 'in-progress' | 'done') => {
    try {
      const res = await updateTask(id, { status: newStatus });
      setTask(res.data.task);
      updateTaskStore(id, res.data.task);
      Toast.show({ type: 'success', text1: 'Status Updated', text2: `Marked as ${STATUS_CONFIG[newStatus].label}` });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update status' });
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    if (togglingSubtask) return;
    try {
      setTogglingSubtask(subtaskId);
      const res = await toggleSubtask(id, subtaskId);
      setTask(res.data.task);
      updateTaskStore(id, res.data.task);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update subtask' });
    } finally {
      setTogglingSubtask(null);
    }
  };

  const handleArchive = async () => {
    try {
      const res = await updateTask(id, { isArchived: !task.isArchived });
      setTask(res.data.task);
      updateTaskStore(id, res.data.task);
      Toast.show({ type: 'success', text1: task.isArchived ? 'Task Unarchived' : 'Task Archived' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to archive task' });
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteTaskApi(id);
            deleteTaskStore(id);
            Toast.show({ type: 'success', text1: 'Task Deleted' });
            router.back();
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to delete task' });
          }
        },
      },
    ]);
  };

  if (loading) return <Loading fullscreen message="Loading task..." />;
  if (error || !task) return <ErrorMessage message={error || 'Task not found'} onRetry={fetchTask} />;

  const priCfg = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.medium;
  const catCfg = CATEGORY_CONFIG[task.category] ?? CATEGORY_CONFIG.other;
  const stsCfg = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.todo;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
  const completedSubs = (task.subtasks ?? []).filter((s: any) => s.completed).length;
  const totalSubs = (task.subtasks ?? []).length;

  const gradColors: [string, string] = task.status === 'done'
    ? ['#059669', '#10B981']
    : isOverdue
    ? ['#DC2626', '#EF4444']
    : ['#4F46E5', '#7C3AED'];

  return (
    <View style={[styles.screen, isDark && styles.screenDark]}>
      <StatusBar barStyle="light-content" />

      {/* Hero header */}
      <LinearGradient colors={gradColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 12 }]}>
        <View style={styles.heroDeco1} /><View style={styles.heroDeco2} />

        <View style={styles.heroNav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push(`/tasks/edit/${id}`)} style={styles.navBtn}>
            <Ionicons name="create-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.heroBadges}>
          <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name={catCfg.icon} size={12} color="#fff" />
            <Text style={styles.badgeText}>{catCfg.label}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name={priCfg.icon} size={12} color="#fff" />
            <Text style={styles.badgeText}>{priCfg.label} Priority</Text>
          </View>
          {task.isArchived && (
            <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Ionicons name="archive-outline" size={12} color="#fff" />
              <Text style={styles.badgeText}>Archived</Text>
            </View>
          )}
        </View>

        <Text style={styles.heroTitle} numberOfLines={3}>{task.title}</Text>

        {totalSubs > 0 && (
          <View style={styles.subProgress}>
            <View style={styles.subProgressTrack}>
              <View style={[styles.subProgressFill, { width: `${(completedSubs / totalSubs) * 100}%` }]} />
            </View>
            <Text style={styles.subProgressText}>{completedSubs}/{totalSubs} subtasks</Text>
          </View>
        )}
      </LinearGradient>

      <Animated.ScrollView
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
      >
        {/* Status row */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>Status</Text>
          <View style={styles.statusRow}>
            {(['todo', 'in-progress', 'done'] as const).map((s) => {
              const cfg = STATUS_CONFIG[s];
              const active = task.status === s;
              return (
                <TouchableOpacity key={s} onPress={() => handleStatusChange(s)} activeOpacity={0.8}
                  style={[styles.statusBtn, active && { backgroundColor: cfg.color, borderColor: cfg.color }, !active && (isDark ? styles.statusBtnInactiveDark : styles.statusBtnInactive)]}>
                  <Ionicons name={cfg.icon} size={14} color={active ? '#fff' : isDark ? '#475569' : '#94A3B8'} />
                  <Text style={[styles.statusBtnText, active && styles.statusBtnTextActive, !active && (isDark ? styles.statusBtnTextDark : {})]}>{cfg.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Description */}
        {task.description ? (
          <View style={[styles.card, isDark && styles.cardDark]}>
            <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>Description</Text>
            <Text style={[styles.descText, isDark && styles.descTextDark]}>{task.description}</Text>
          </View>
        ) : null}

        {/* Due date */}
        {task.dueDate ? (
          <View style={[styles.card, isDark && styles.cardDark, isOverdue && styles.overdueCard]}>
            <View style={styles.dueDateRow}>
              <Ionicons name={isOverdue ? 'warning-outline' : 'calendar-outline'} size={18} color={isOverdue ? '#EF4444' : isDark ? '#94A3B8' : '#6366F1'} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.cardTitle, isDark && styles.cardTitleDark, isOverdue && { color: '#EF4444' }]}>
                  {isOverdue ? 'Overdue' : 'Due Date'}
                </Text>
                <Text style={[styles.dueDateText, isDark && styles.dueDateTextDark, isOverdue && { color: '#EF4444' }]}>
                  {new Date(task.dueDate).toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Subtasks checklist */}
        {totalSubs > 0 && (
          <View style={[styles.card, isDark && styles.cardDark]}>
            <View style={styles.subtaskHeader}>
              <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>Subtasks</Text>
              <View style={[styles.subtaskBadge, { backgroundColor: stsCfg.color + '20' }]}>
                <Text style={[styles.subtaskBadgeText, { color: stsCfg.color }]}>{completedSubs}/{totalSubs}</Text>
              </View>
            </View>
            {(task.subtasks as any[]).map((sub: any) => (
              <TouchableOpacity key={sub._id} onPress={() => handleToggleSubtask(sub._id)}
                activeOpacity={0.7} style={[styles.subtaskRow, isDark && styles.subtaskRowDark]}
                disabled={togglingSubtask === sub._id}>
                <View style={[styles.subtaskCheck, sub.completed && styles.subtaskCheckDone]}>
                  {sub.completed && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
                <Text style={[styles.subtaskText, isDark && styles.subtaskTextDark, sub.completed && styles.subtaskTextDone]}>{sub.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recurrence */}
        {task.recurrence?.enabled && (
          <View style={[styles.card, isDark && styles.cardDark]}>
            <View style={styles.dueDateRow}>
              <Ionicons name="repeat-outline" size={18} color="#6366F1" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>Recurring</Text>
                <Text style={[styles.dueDateText, isDark && styles.dueDateTextDark, { color: '#6366F1' }]}>
                  Repeats {task.recurrence.type ?? 'daily'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Meta */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>Details</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, isDark && styles.metaLabelDark]}>Created</Text>
            <Text style={[styles.metaValue, isDark && styles.metaValueDark]}>
              {new Date(task.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
          {task.completedAt && (
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, isDark && styles.metaLabelDark]}>Completed</Text>
              <Text style={[styles.metaValue, { color: '#10B981' }]}>
                {new Date(task.completedAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
          )}
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, isDark && styles.metaLabelDark]}>Last updated</Text>
            <Text style={[styles.metaValue, isDark && styles.metaValueDark]}>
              {new Date(task.updatedAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleArchive} style={[styles.actionBtn, isDark && styles.actionBtnDark]}>
            <Ionicons name={task.isArchived ? 'arrow-up-circle-outline' : 'archive-outline'} size={20} color={isDark ? '#94A3B8' : '#64748B'} />
            <Text style={[styles.actionBtnText, isDark && styles.actionBtnTextDark]}>
              {task.isArchived ? 'Unarchive' : 'Archive'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={[styles.actionBtn, styles.actionBtnDelete]}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  screenDark: { backgroundColor: '#0F172A' },
  hero: { paddingHorizontal: 20, paddingBottom: 28, overflow: 'hidden' },
  heroDeco1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.06)', top: -60, right: -50 },
  heroDeco2: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: 30 },
  heroNav: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  navBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  heroBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#fff' },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff', lineHeight: 28, marginBottom: 14 },
  subProgress: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  subProgressTrack: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 2, overflow: 'hidden' },
  subProgressFill: { height: 4, backgroundColor: '#fff', borderRadius: 2 },
  subProgressText: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  body: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardDark: { backgroundColor: '#1E293B' },
  overdueCard: { borderWidth: 1.5, borderColor: '#FCA5A5' },
  cardTitle: { fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  cardTitleDark: { color: '#475569' },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0' },
  statusBtnInactive: { backgroundColor: '#F8FAFC' },
  statusBtnInactiveDark: { backgroundColor: '#0F172A', borderColor: '#334155' },
  statusBtnText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  statusBtnTextActive: { color: '#fff' },
  statusBtnTextDark: { color: '#475569' },
  descText: { fontSize: 15, color: '#334155', lineHeight: 22 },
  descTextDark: { color: '#CBD5E1' },
  dueDateRow: { flexDirection: 'row', alignItems: 'center' },
  dueDateText: { fontSize: 14, color: '#334155', fontWeight: '500', marginTop: 2 },
  dueDateTextDark: { color: '#CBD5E1' },
  subtaskHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  subtaskBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  subtaskBadgeText: { fontSize: 11, fontWeight: '700' },
  subtaskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 12 },
  subtaskRowDark: { borderBottomColor: '#334155' },
  subtaskCheck: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
  subtaskCheckDone: { backgroundColor: '#10B981', borderColor: '#10B981' },
  subtaskText: { flex: 1, fontSize: 14, color: '#0F172A', fontWeight: '500' },
  subtaskTextDark: { color: '#F1F5F9' },
  subtaskTextDone: { textDecorationLine: 'line-through', color: '#94A3B8' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  metaLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
  metaLabelDark: { color: '#475569' },
  metaValue: { fontSize: 13, color: '#334155', fontWeight: '600' },
  metaValueDark: { color: '#94A3B8' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#fff' },
  actionBtnDark: { backgroundColor: '#1E293B', borderColor: '#334155' },
  actionBtnDelete: { borderColor: '#FCA5A5', backgroundColor: '#FFF5F5' },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  actionBtnTextDark: { color: '#94A3B8' },
});
