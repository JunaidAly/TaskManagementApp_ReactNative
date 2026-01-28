/**
 * Edit Task Screen
 * Form to edit an existing task
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';
import { Input, Button, Loading, ErrorMessage } from '../../../components';
import { useTaskStore } from '../../../store';
import { getTaskById, updateTask } from '../../../services/task.service';
import {
  scheduleTaskNotification,
  cancelAllTaskNotifications,
} from '../../../services/notification.service';

const taskSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .max(100, 'Title must not exceed 100 characters'),
  description: Yup.string().max(500, 'Description must not exceed 500 characters'),
});

export default function EditTaskScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const updateTaskStore = useTaskStore((state) => state.updateTask);
  
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'todo' | 'in-progress' | 'done'>('todo');
  const [dueDate, setDueDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await getTaskById(id);
      const taskData = response.data.task;
      
      setTask(taskData);
      setPriority(taskData.priority);
      setStatus(taskData.status);
      setDueDate(taskData.dueDate ? new Date(taskData.dueDate) : null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch task');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: { title: string; description: string }) => {
    try {
      const taskData = {
        title: values.title,
        description: values.description || undefined,
        priority,
        status,
        dueDate: dueDate?.toISOString(),
      };

      const response = await updateTask(id, taskData);
      updateTaskStore(id, response.data.task);

      // Update notifications
      await cancelAllTaskNotifications(id);
      if (dueDate && status !== 'done') {
        await scheduleTaskNotification(id, response.data.task.title, dueDate);
      }

      Toast.show({
        type: 'success',
        text1: 'Task Updated',
        text2: 'Your changes have been saved',
      });

      router.back();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to update task',
      });
    }
  };

  if (loading) {
    return <Loading fullscreen message="Loading task..." />;
  }

  if (error || !task) {
    return <ErrorMessage message={error || 'Task not found'} onRetry={fetchTask} />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50 dark:bg-gray-900"
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <View className="px-4 py-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Edit Task
          </Text>

          <Formik
            initialValues={{
              title: task.title,
              description: task.description || '',
            }}
            validationSchema={taskSchema}
            onSubmit={handleSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
            }) => (
              <View>
                <Input
                  label="Title"
                  placeholder="Enter task title"
                  value={values.title}
                  onChangeText={handleChange('title')}
                  onBlur={handleBlur('title')}
                  error={touched.title && errors.title ? errors.title : undefined}
                />

                <Input
                  label="Description"
                  placeholder="Enter task description (optional)"
                  value={values.description}
                  onChangeText={handleChange('description')}
                  onBlur={handleBlur('description')}
                  error={
                    touched.description && errors.description
                      ? errors.description
                      : undefined
                  }
                  multiline
                  numberOfLines={4}
                  style={{ height: 100, textAlignVertical: 'top' }}
                />

                {/* Priority Selection */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </Text>
                  <View className="flex-row">
                    <TouchableOpacity
                      className={`flex-1 py-3 px-4 rounded-l-lg ${
                        priority === 'low'
                          ? 'bg-green-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      onPress={() => setPriority('low')}
                    >
                      <Text
                        className={`text-center font-medium ${
                          priority === 'low'
                            ? 'text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Low
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 py-3 px-4 ${
                        priority === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      onPress={() => setPriority('medium')}
                    >
                      <Text
                        className={`text-center font-medium ${
                          priority === 'medium'
                            ? 'text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Medium
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 py-3 px-4 rounded-r-lg ${
                        priority === 'high'
                          ? 'bg-red-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      onPress={() => setPriority('high')}
                    >
                      <Text
                        className={`text-center font-medium ${
                          priority === 'high'
                            ? 'text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        High
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Status Selection */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </Text>
                  <View className="flex-row">
                    <TouchableOpacity
                      className={`flex-1 py-3 px-4 rounded-l-lg ${
                        status === 'todo'
                          ? 'bg-primary-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      onPress={() => setStatus('todo')}
                    >
                      <Text
                        className={`text-center font-medium ${
                          status === 'todo'
                            ? 'text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        To Do
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 py-3 px-4 ${
                        status === 'in-progress'
                          ? 'bg-primary-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      onPress={() => setStatus('in-progress')}
                    >
                      <Text
                        className={`text-center font-medium ${
                          status === 'in-progress'
                            ? 'text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        In Progress
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 py-3 px-4 rounded-r-lg ${
                        status === 'done'
                          ? 'bg-primary-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      onPress={() => setStatus('done')}
                    >
                      <Text
                        className={`text-center font-medium ${
                          status === 'done'
                            ? 'text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Due Date */}
                <View className="mb-6">
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date (Optional)
                  </Text>
                  <TouchableOpacity
                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3"
                    onPress={() => {
                      // Simplified: Set to tomorrow. In production, show DateTimePicker
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      setDueDate(tomorrow);
                      Toast.show({
                        type: 'info',
                        text1: 'Due Date Updated',
                        text2: `Set to ${tomorrow.toLocaleDateString()}`,
                      });
                    }}
                  >
                    <Text className="text-gray-900 dark:text-white">
                      {dueDate ? dueDate.toLocaleDateString() : 'Select due date'}
                    </Text>
                  </TouchableOpacity>
                  {dueDate && (
                    <TouchableOpacity
                      className="mt-2"
                      onPress={() => setDueDate(null)}
                    >
                      <Text className="text-red-500 text-sm">Clear date</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Buttons */}
                <View className="flex-row space-x-3">
                  <Button
                    title="Cancel"
                    onPress={() => router.back()}
                    variant="outline"
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Save Changes"
                    onPress={handleSubmit}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
