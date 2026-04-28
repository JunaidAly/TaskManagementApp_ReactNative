import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { Task } from '../store';
import { formatDate, isOverdue } from '../utils/helpers';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onLongPress?: () => void;
  onSwipeComplete?: () => void;
  onSwipeDelete?: () => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
};

const CATEGORY_ICONS: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  work:     { icon: 'briefcase-outline',  color: '#6366F1' },
  personal: { icon: 'heart-outline',      color: '#EC4899' },
  health:   { icon: 'fitness-outline',    color: '#10B981' },
  shopping: { icon: 'cart-outline',       color: '#F59E0B' },
  finance:  { icon: 'wallet-outline',     color: '#3B82F6' },
  other:    { icon: 'ellipsis-horizontal-outline', color: '#94A3B8' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; darkBg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  todo:          { label: 'To Do',       color: '#64748B', bg: '#F1F5F9', darkBg: '#334155', icon: 'ellipse-outline' },
  'in-progress': { label: 'In Progress', color: '#6366F1', bg: '#EEF2FF', darkBg: '#312E81', icon: 'time-outline' },
  done:          { label: 'Done',        color: '#10B981', bg: '#ECFDF5', darkBg: '#064E3B', icon: 'checkmark-circle-outline' },
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task, onPress, onLongPress, onSwipeComplete, onSwipeDelete,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const swipeableRef = useRef<Swipeable>(null);

  const priorityColor = PRIORITY_COLORS[task.priority] ?? '#64748B';
  const statusCfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.todo;
  const catCfg = CATEGORY_ICONS[task.category ?? 'other'] ?? CATEGORY_ICONS.other;
  const isDue = task.dueDate && isOverdue(task.dueDate) && task.status !== 'done';

  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length ?? 0;
  const totalSubtasks = task.subtasks?.length ?? 0;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  const renderLeftActions = () => (
    <TouchableOpacity
      style={styles.swipeComplete}
      onPress={() => { swipeableRef.current?.close(); onSwipeComplete?.(); }}
    >
      <Ionicons name="checkmark-circle" size={28} color="#fff" />
      <Text style={styles.swipeText}>Done</Text>
    </TouchableOpacity>
  );

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.swipeDelete}
      onPress={() => { swipeableRef.current?.close(); onSwipeDelete?.(); }}
    >
      <Ionicons name="trash-outline" size={24} color="#fff" />
      <Text style={styles.swipeText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={onSwipeComplete ? renderLeftActions : undefined}
      renderRightActions={onSwipeDelete ? renderRightActions : undefined}
      friction={2}
      leftThreshold={60}
      rightThreshold={60}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          style={[styles.card, isDark && styles.cardDark]}
          onPress={onPress}
          onLongPress={onLongPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={1}
        >
          {/* Priority accent */}
          <View style={[styles.accent, { backgroundColor: priorityColor }]} />

          <View style={styles.body}>
            {/* Title row */}
            <View style={styles.titleRow}>
              <Text
                style={[styles.title, isDark && styles.titleDark, task.status === 'done' && styles.titleDone]}
                numberOfLines={2}
              >
                {task.title}
              </Text>
              <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '22' }]}>
                <Text style={[styles.priorityText, { color: priorityColor }]}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </Text>
              </View>
            </View>

            {/* Description */}
            {task.description ? (
              <Text style={[styles.description, isDark && styles.descriptionDark]} numberOfLines={2}>
                {task.description}
              </Text>
            ) : null}

            {/* Subtasks progress */}
            {totalSubtasks > 0 && (
              <View style={styles.subtaskRow}>
                <View style={[styles.subtaskTrack, isDark && styles.subtaskTrackDark]}>
                  <View
                    style={[
                      styles.subtaskFill,
                      { width: `${(completedSubtasks / totalSubtasks) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={[styles.subtaskCount, isDark && styles.subtaskCountDark]}>
                  {completedSubtasks}/{totalSubtasks}
                </Text>
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.footerLeft}>
                <View style={[styles.statusBadge, { backgroundColor: isDark ? statusCfg.darkBg : statusCfg.bg }]}>
                  <Ionicons name={statusCfg.icon} size={11} color={statusCfg.color} />
                  <Text style={[styles.statusText, { color: statusCfg.color }]}> {statusCfg.label}</Text>
                </View>
                <View style={[styles.catBadge]}>
                  <Ionicons name={catCfg.icon} size={11} color={catCfg.color} />
                </View>
              </View>

              {task.dueDate ? (
                <View style={styles.dueRow}>
                  <Ionicons name={isDue ? 'warning-outline' : 'calendar-outline'} size={11} color={isDue ? '#EF4444' : '#94A3B8'} />
                  <Text style={[styles.dueText, isDue && styles.dueOverdue]}> {formatDate(task.dueDate)}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
  },
  cardDark: { backgroundColor: '#1E293B', shadowColor: '#000' },
  accent: { width: 4 },
  body: { flex: 1, padding: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  title: { flex: 1, fontSize: 15, fontWeight: '600', color: '#0F172A', marginRight: 8, lineHeight: 22 },
  titleDark: { color: '#F1F5F9' },
  titleDone: { color: '#94A3B8', textDecorationLine: 'line-through' },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  priorityText: { fontSize: 11, fontWeight: '700' },
  description: { fontSize: 13, color: '#64748B', lineHeight: 19, marginBottom: 8 },
  descriptionDark: { color: '#94A3B8' },
  subtaskRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  subtaskTrack: { flex: 1, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, overflow: 'hidden' },
  subtaskTrackDark: { backgroundColor: '#334155' },
  subtaskFill: { height: 4, backgroundColor: '#6366F1', borderRadius: 2 },
  subtaskCount: { fontSize: 11, color: '#94A3B8', fontWeight: '600', width: 28, textAlign: 'right' },
  subtaskCountDark: { color: '#475569' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '600' },
  catBadge: { width: 22, height: 22, borderRadius: 6, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  dueRow: { flexDirection: 'row', alignItems: 'center' },
  dueText: { fontSize: 11, color: '#94A3B8' },
  dueOverdue: { color: '#EF4444', fontWeight: '600' },
  swipeComplete: {
    backgroundColor: '#10B981', width: 80, justifyContent: 'center', alignItems: 'center',
    borderRadius: 16, marginBottom: 12,
  },
  swipeDelete: {
    backgroundColor: '#EF4444', width: 80, justifyContent: 'center', alignItems: 'center',
    borderRadius: 16, marginBottom: 12,
  },
  swipeText: { color: '#fff', fontSize: 11, fontWeight: '700', marginTop: 4 },
});
