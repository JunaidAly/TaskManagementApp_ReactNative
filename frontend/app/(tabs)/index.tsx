/**
 * Dashboard/Home Screen
 * Main screen showing task overview and statistics
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Loading, ErrorMessage, TaskCard, EmptyState } from '../../components';
import { useTaskStore } from '../../store';
import { getTasks, getTaskStats } from '../../services/task.service';

export default function DashboardScreen() {
  const router = useRouter();
  const { tasks, setTasks, setLoading, isLoading } = useTaskStore();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    doneTasks: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      
      // Fetch recent tasks and stats
      const [tasksResponse, statsResponse] = await Promise.all([
        getTasks({ isArchived: false, sortBy: 'createdAt', order: 'desc' }),
        getTaskStats(),
      ]);

      setTasks(tasksResponse.data.tasks);
      setStats(statsResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch data');
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
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (isLoading && !refreshing) {
    return <Loading fullscreen message="Loading your tasks..." />;
  }

  if (error && !refreshing) {
    return <ErrorMessage message={error} onRetry={fetchData} />;
  }

  // Get recent tasks (limit to 5 for dashboard)
  const recentTasks = tasks.slice(0, 5);

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="px-4 py-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's your task overview
          </Text>
        </View>

        {/* Stats Cards */}
        <View className="flex-row flex-wrap mb-6 -mx-2">
          <View className="w-1/2 px-2 mb-4">
            <View className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <Text className="text-3xl font-bold text-primary-500 mb-1">
                {stats.totalTasks}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Total Tasks
              </Text>
            </View>
          </View>

          <View className="w-1/2 px-2 mb-4">
            <View className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <Text className="text-3xl font-bold text-yellow-500 mb-1">
                {stats.todoTasks}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                To Do
              </Text>
            </View>
          </View>

          <View className="w-1/2 px-2 mb-4">
            <View className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <Text className="text-3xl font-bold text-blue-500 mb-1">
                {stats.inProgressTasks}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                In Progress
              </Text>
            </View>
          </View>

          <View className="w-1/2 px-2 mb-4">
            <View className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <Text className="text-3xl font-bold text-green-500 mb-1">
                {stats.doneTasks}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Completed
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Tasks Section */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Tasks
          </Text>
          {recentTasks.length > 0 && (
            <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')}>
              <Text className="text-primary-500 font-medium">View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentTasks.length === 0 ? (
          <EmptyState
            title="No tasks yet"
            description="Create your first task to get started"
            actionLabel="Create Task"
            onAction={() => router.push('/tasks/create')}
            icon="📝"
          />
        ) : (
          <View>
            {recentTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onPress={() => router.push(`/tasks/${task._id}`)}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
