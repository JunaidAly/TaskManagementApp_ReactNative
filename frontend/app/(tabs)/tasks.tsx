import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, RefreshControl,
  TouchableOpacity, TextInput, StyleSheet, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'nativewind';
import Toast from 'react-native-toast-message';
import { Loading, ErrorMessage, TaskCard, EmptyState } from '../../components';
import { useTaskStore, Task } from '../../store';
import { getTasks, updateTask, deleteTask as deleteApi, TaskFilters } from '../../services/task.service';
import { debounce } from '../../utils/helpers';

const STATUS_FILTERS = [
  { key: undefined,     label: 'All',    icon: 'layers-outline' as const },
  { key: 'todo',        label: 'To Do',  icon: 'ellipse-outline' as const },
  { key: 'in-progress', label: 'Active', icon: 'time-outline' as const },
  { key: 'done',        label: 'Done',   icon: 'checkmark-circle-outline' as const },
] as const;

const CATEGORY_FILTERS = [
  { key: undefined,  label: 'All',      icon: 'grid-outline' as const,      color: '#6366F1' },
  { key: 'work',     label: 'Work',     icon: 'briefcase-outline' as const,  color: '#6366F1' },
  { key: 'personal', label: 'Personal', icon: 'heart-outline' as const,      color: '#EC4899' },
  { key: 'health',   label: 'Health',   icon: 'fitness-outline' as const,    color: '#10B981' },
  { key: 'shopping', label: 'Shopping', icon: 'cart-outline' as const,       color: '#F59E0B' },
  { key: 'finance',  label: 'Finance',  icon: 'wallet-outline' as const,     color: '#3B82F6' },
  { key: 'other',    label: 'Other',    icon: 'ellipsis-horizontal-outline' as const, color: '#94A3B8' },
] as const;

export default function TasksScreen() {
  const router = useRouter();
  const { tasks, setTasks, setLoading, isLoading, updateTask: updateStore, deleteTask: deleteStore } = useTaskStore();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({ isArchived: false, sortBy: 'createdAt', order: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const fetchTasks = async (customFilters?: TaskFilters) => {
    try {
      setError(null);
      const response = await getTasks(customFilters ?? filters);
      setTasks(response.data.tasks);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load tasks' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { setLoading(true); fetchTasks(); }, [filters]);

  const handleSearch = debounce((text: string) => {
    fetchTasks({ ...filters, search: text || undefined });
  }, 500);

  const handleComplete = async (id: string) => {
    try {
      const res = await updateTask(id, { status: 'done' });
      updateStore(id, res.data.task);
      Toast.show({ type: 'success', text1: '✅ Completed!' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update' });
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Task', 'This cannot be undone.', [
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

  const activeStatus = filters.status;
  const activeCategory = filters.category;

  if (isLoading && !refreshing) return <Loading fullscreen message="Loading tasks..." />;
  if (error && !refreshing) return <ErrorMessage message={error} onRetry={fetchTasks} />;

  return (
    <View style={[styles.screen, isDark && styles.screenDark]}>
      {/* Search */}
      <View style={[styles.searchSection, isDark && styles.searchSectionDark]}>
        <View style={[styles.searchBar, isDark && styles.searchBarDark, searchFocused && styles.searchBarFocused]}>
          <Ionicons name="search-outline" size={17} color={searchFocused ? '#6366F1' : '#94A3B8'} />
          <TextInput
            style={[styles.searchInput, isDark && styles.searchInputDark]}
            placeholder="Search tasks..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={(t) => { setSearchQuery(t); handleSearch(t); }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => { setSearchQuery(''); handleSearch(''); }}>
              <Ionicons name="close-circle" size={17} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Status filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={[styles.filterBar, isDark && styles.filterBarDark]}
        contentContainerStyle={styles.filterContent}
      >
        {STATUS_FILTERS.map((f) => {
          const active = activeStatus === f.key || (!activeStatus && f.key === undefined);
          return (
            <TouchableOpacity key={String(f.key)} onPress={() => setFilters((p) => ({ ...p, status: f.key as any }))} style={styles.chipWrap} activeOpacity={0.8}>
              {active ? (
                <LinearGradient colors={['#6366F1', '#8B5CF6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.chip}>
                  <Ionicons name={f.icon} size={12} color="#fff" style={styles.chipIcon} />
                  <Text style={styles.chipTextActive}>{f.label}</Text>
                </LinearGradient>
              ) : (
                <View style={[styles.chip, isDark ? styles.chipInactiveDark : styles.chipInactive]}>
                  <Ionicons name={f.icon} size={12} color={isDark ? '#94A3B8' : '#64748B'} style={styles.chipIcon} />
                  <Text style={[styles.chipTextInactive, isDark && styles.chipTextInactiveDark]}>{f.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Category filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={[styles.filterBar, isDark && styles.filterBarDark, { borderTopWidth: 0 }]}
        contentContainerStyle={styles.filterContent}
      >
        {CATEGORY_FILTERS.map((f) => {
          const active = activeCategory === f.key || (!activeCategory && f.key === undefined);
          return (
            <TouchableOpacity key={String(f.key)} onPress={() => setFilters((p) => ({ ...p, category: f.key as any }))} style={styles.catChipWrap} activeOpacity={0.8}>
              <View style={[styles.catChip, active && { borderColor: f.color, backgroundColor: f.color + '15' }, !active && (isDark ? styles.catChipInactiveDark : styles.catChipInactive)]}>
                <Ionicons name={f.icon} size={13} color={active ? f.color : isDark ? '#475569' : '#94A3B8'} />
                <Text style={[styles.catChipText, active && { color: f.color }, !active && (isDark ? styles.catChipTextDark : styles.catChipTextInactive)]}>{f.label}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Count bar */}
      <View style={[styles.countBar, isDark && styles.countBarDark]}>
        <Text style={[styles.countText, isDark && styles.countTextDark]}>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Task list */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTasks(); }} tintColor="#6366F1" />}
        showsVerticalScrollIndicator={false}
      >
        {tasks.length === 0 ? (
          <EmptyState title="No tasks found" description="Create a new task or adjust your filters" actionLabel="Create Task" onAction={() => router.push('/tasks/create')} icon="📋" />
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onPress={() => router.push(`/tasks/${task._id}`)}
              onSwipeComplete={task.status !== 'done' ? () => handleComplete(task._id) : undefined}
              onSwipeDelete={() => handleDelete(task._id)}
            />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity onPress={() => router.push('/tasks/create')} activeOpacity={0.9} style={styles.fab}>
        <LinearGradient colors={['#6366F1', '#8B5CF6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fabGradient}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  screenDark: { backgroundColor: '#0F172A' },
  searchSection: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  searchSectionDark: { backgroundColor: '#1E293B', borderBottomColor: '#334155' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1.5, borderColor: '#E2E8F0', gap: 8 },
  searchBarDark: { backgroundColor: '#0F172A', borderColor: '#334155' },
  searchBarFocused: { borderColor: '#6366F1' },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A', padding: 0 },
  searchInputDark: { color: '#F1F5F9' },
  filterBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', flexGrow: 0 },
  filterBarDark: { backgroundColor: '#1E293B', borderBottomColor: '#334155' },
  filterContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 6, flexDirection: 'row', alignItems: 'center' },
  chipWrap: { borderRadius: 20, overflow: 'hidden' },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  chipInactive: { backgroundColor: '#F1F5F9' },
  chipInactiveDark: { backgroundColor: '#334155' },
  chipIcon: { marginRight: 4 },
  chipTextActive: { color: '#fff', fontSize: 12, fontWeight: '600' },
  chipTextInactive: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  chipTextInactiveDark: { color: '#94A3B8' },
  catChipWrap: { marginRight: 4 },
  catChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, borderWidth: 1.5, borderColor: '#E2E8F0', gap: 4 },
  catChipInactive: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  catChipInactiveDark: { backgroundColor: '#283548', borderColor: '#334155' },
  catChipText: { fontSize: 12, fontWeight: '600' },
  catChipTextInactive: { color: '#94A3B8' },
  catChipTextDark: { color: '#475569' },
  countBar: { paddingHorizontal: 20, paddingVertical: 6, backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  countBarDark: { backgroundColor: '#0F172A', borderBottomColor: '#1E293B' },
  countText: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  countTextDark: { color: '#475569' },
  list: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 100 },
  fab: { position: 'absolute', bottom: 24, right: 20, borderRadius: 28, overflow: 'hidden', shadowColor: '#6366F1', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 14 },
  fabGradient: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
});
