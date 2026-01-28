/**
 * Task Details Screen
 * View and manage a single task
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Loading, ErrorMessage, Button } from '../../components';
import { useTaskStore } from '../../store';
import {
  getTaskById,
  updateTask,
  deleteTask as deleteTaskApi,
} from '../../services/task.service';
import {
  formatDate,
  formatDateTime,
  getPriorityColor,
  getStatusLabel,
  isOverdue,
} from '../../utils/helpers';

export default function TaskDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updateTask: updateTaskStore, deleteTask: deleteTaskStore } = useTaskStore();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTaskById(id);
      setTask(response.data.task);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch task');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const handleStatusChange = async (newStatus: 'todo' | 'in-progress' | 'done') => {
    try {
      const response = await updateTask(id, { status: newStatus });
      setTask(response.data.task);
      updateTaskStore(id, response.data.task);
      
      Toast.show({
        type: 'success',
        text1: 'Status Updated',
        text2: `Task marked as ${getStatusLabel(newStatus)}`,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update status',
      });
    }
  };

  const handleArchive = async () => {
    try {
      const response = await updateTask(id, { isArchived: !task.isArchived });
      setTask(response.data.task);
      updateTaskStore(id, response.data.task);
      
      Toast.show({
        type: 'success',
        text1: task.isArchived ? 'Task Unarchived' : 'Task Archived',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to archive task',
      });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTaskApi(id);
              deleteTaskStore(id);
              
              Toast.show({
                type: 'success',
                text1: 'Task Deleted',
              });
              
              router.back();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete task',
              });
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <Loading fullscreen message="Loading task..." />;
  }

  if (error || !task) {
    return <ErrorMessage message={error || 'Task not found'} onRetry={fetchTask} />;
  }

  const priorityColor = getPriorityColor(task.priority);
  const isDue = task.dueDate && isOverdue(task.dueDate) && task.status !== 'done';

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="px-4 py-6">
        {/* Title */}
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {task.title}
        </Text>

        {/* Meta Info */}
        <View className="flex-row flex-wrap mb-6">
          <View
            className="px-3 py-1 rounded-full mr-2 mb-2"
            style={{ backgroundColor: priorityColor + '20' }}
          >
            <Text
              className="text-sm font-medium capitalize"
              style={{ color: priorityColor }}
            >
              {task.priority} Priority
            </Text>
          </View>

          <View
            className={`px-3 py-1 rounded-full mr-2 mb-2 ${
              task.status === 'done'
                ? 'bg-green-100 dark:bg-green-900'
                : task.status === 'in-progress'
                ? 'bg-blue-100 dark:bg-blue-900'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                task.status === 'done'
                  ? 'text-green-700 dark:text-green-300'
                  : task.status === 'in-progress'
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {getStatusLabel(task.status)}
            </Text>
          </View>

          {task.isArchived && (
            <View className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 mb-2">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                📦 Archived
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        {task.description && (
          <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </Text>
            <Text className="text-base text-gray-900 dark:text-white">
              {task.description}
            </Text>
          </View>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Due Date
            </Text>
            <Text
              className={`text-base ${
                isDue
                  ? 'text-red-600 dark:text-red-400 font-semibold'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {isDue && '⚠️ '}
              {formatDateTime(task.dueDate)}
              {isDue && ' (Overdue)'}
            </Text>
          </View>
        )}

        {/* Timestamps */}
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
          <View className="mb-2">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Created: {formatDateTime(task.createdAt)}
            </Text>
          </View>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            Updated: {formatDateTime(task.updatedAt)}
          </Text>
        </View>

        {/* Quick Actions - Status */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Update Status
          </Text>
          <View className="flex-row">
            <TouchableOpacity
              className={`flex-1 py-3 px-4 rounded-l-lg ${
                task.status === 'todo'
                  ? 'bg-primary-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
              onPress={() => handleStatusChange('todo')}
            >
              <Text
                className={`text-center font-medium text-sm ${
                  task.status === 'todo'
                    ? 'text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                To Do
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 px-4 ${
                task.status === 'in-progress'
                  ? 'bg-primary-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
              onPress={() => handleStatusChange('in-progress')}
            >
              <Text
                className={`text-center font-medium text-sm ${
                  task.status === 'in-progress'
                    ? 'text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                In Progress
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 px-4 rounded-r-lg ${
                task.status === 'done'
                  ? 'bg-primary-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
              onPress={() => handleStatusChange('done')}
            >
              <Text
                className={`text-center font-medium text-sm ${
                  task.status === 'done'
                    ? 'text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="space-y-3">
          <Button
            title="Edit Task"
            onPress={() => router.push(`/tasks/edit/${id}`)}
            variant="primary"
          />
          
          <Button
            title={task.isArchived ? 'Unarchive Task' : 'Archive Task'}
            onPress={handleArchive}
            variant="secondary"
          />
          
          <Button
            title="Delete Task"
            onPress={handleDelete}
            variant="danger"
          />
        </View>
      </View>
    </ScrollView>
  );
}
