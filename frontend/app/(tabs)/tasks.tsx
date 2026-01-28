/**
 * Tasks List Screen
 * Shows all tasks with filtering and search
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Loading, ErrorMessage, TaskCard, EmptyState } from '../../components';
import { useTaskStore } from '../../store';
import { getTasks, TaskFilters } from '../../services/task.service';
import { debounce } from '../../utils/helpers';

export default function TasksScreen() {
  const router = useRouter();
  const { tasks, setTasks, setLoading, isLoading } = useTaskStore();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    isArchived: false,
    sortBy: 'createdAt',
    order: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTasks = async (customFilters?: TaskFilters) => {
    try {
      setError(null);
      const response = await getTasks(customFilters || filters);
      setTasks(response.data.tasks);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load tasks',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchTasks();
  }, [filters]);

  // Debounced search
  const handleSearch = debounce((text: string) => {
    const newFilters = { ...filters, search: text || undefined };
    fetchTasks(newFilters);
  }, 500);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const updateFilter = (key: keyof TaskFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading && !refreshing) {
    return <Loading fullscreen message="Loading tasks..." />;
  }

  if (error && !refreshing) {
    return <ErrorMessage message={error} onRetry={fetchTasks} />;
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header with Search */}
      <View className="bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <TextInput
          className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg text-gray-900 dark:text-white"
          placeholder="Search tasks..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            handleSearch(text);
          }}
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
      >
        <TouchableOpacity
          className={`px-4 py-2 rounded-full mr-2 ${
            !filters.status
              ? 'bg-primary-500'
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
          onPress={() => updateFilter('status', undefined)}
        >
          <Text
            className={`font-medium ${
              !filters.status ? 'text-white' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`px-4 py-2 rounded-full mr-2 ${
            filters.status === 'todo'
              ? 'bg-primary-500'
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
          onPress={() => updateFilter('status', 'todo')}
        >
          <Text
            className={`font-medium ${
              filters.status === 'todo'
                ? 'text-white'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            To Do
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`px-4 py-2 rounded-full mr-2 ${
            filters.status === 'in-progress'
              ? 'bg-primary-500'
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
          onPress={() => updateFilter('status', 'in-progress')}
        >
          <Text
            className={`font-medium ${
              filters.status === 'in-progress'
                ? 'text-white'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            In Progress
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`px-4 py-2 rounded-full ${
            filters.status === 'done'
              ? 'bg-primary-500'
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
          onPress={() => updateFilter('status', 'done')}
        >
          <Text
            className={`font-medium ${
              filters.status === 'done'
                ? 'text-white'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            Done
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Tasks List */}
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="py-4">
          {tasks.length === 0 ? (
            <EmptyState
              title="No tasks found"
              description="Create a new task or adjust your filters"
              actionLabel="Create Task"
              onAction={() => router.push('/tasks/create')}
            />
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onPress={() => router.push(`/tasks/${task._id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-primary-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push('/tasks/create')}
        activeOpacity={0.8}
      >
        <Text className="text-white text-3xl font-light">+</Text>
      </TouchableOpacity>
    </View>
  );
}
