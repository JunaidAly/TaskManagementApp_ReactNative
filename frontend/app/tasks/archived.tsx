/**
 * Archived Tasks Screen
 * Shows all archived tasks
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Loading, ErrorMessage, TaskCard, EmptyState } from '../../components';
import { getTasks } from '../../services/task.service';
import { Task } from '../../services/task.service';

export default function ArchivedTasksScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArchivedTasks = async () => {
    try {
      setError(null);
      const response = await getTasks({
        isArchived: true,
        sortBy: 'updatedAt',
        order: 'desc',
      });
      setTasks(response.data.tasks);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch archived tasks');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load archived tasks',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchArchivedTasks();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchArchivedTasks();
  };

  if (loading && !refreshing) {
    return <Loading fullscreen message="Loading archived tasks..." />;
  }

  if (error && !refreshing) {
    return <ErrorMessage message={error} onRetry={fetchArchivedTasks} />;
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="px-4 py-6">
        {tasks.length === 0 ? (
          <EmptyState
            title="No archived tasks"
            description="Tasks you archive will appear here"
            icon="📦"
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
  );
}
