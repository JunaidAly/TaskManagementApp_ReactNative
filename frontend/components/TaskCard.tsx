/**
 * Task Card Component
 * Displays a single task in a card format
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Task } from '../services/task.service';
import { formatDate, getPriorityColor, getStatusLabel, isOverdue } from '../utils/helpers';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onLongPress?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, onLongPress }) => {
  const priorityColor = getPriorityColor(task.priority);
  const isDue = task.dueDate && isOverdue(task.dueDate) && task.status !== 'done';

  return (
    <TouchableOpacity
      className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 border border-gray-200 dark:border-gray-700 shadow-sm"
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-2">
          <Text 
            className={`text-base font-semibold ${
              task.status === 'done' 
                ? 'text-gray-400 dark:text-gray-500 line-through' 
                : 'text-gray-900 dark:text-white'
            }`}
            numberOfLines={2}
          >
            {task.title}
          </Text>
        </View>
        
        {/* Priority Badge */}
        <View 
          className="px-2 py-1 rounded"
          style={{ backgroundColor: priorityColor + '20' }}
        >
          <Text 
            className="text-xs font-medium capitalize"
            style={{ color: priorityColor }}
          >
            {task.priority}
          </Text>
        </View>
      </View>

      {/* Description */}
      {task.description && (
        <Text 
          className="text-sm text-gray-600 dark:text-gray-400 mb-2"
          numberOfLines={2}
        >
          {task.description}
        </Text>
      )}

      {/* Footer */}
      <View className="flex-row items-center justify-between mt-2">
        {/* Status */}
        <View className="flex-row items-center">
          <View 
            className={`px-2 py-1 rounded ${
              task.status === 'done' 
                ? 'bg-green-100 dark:bg-green-900' 
                : task.status === 'in-progress'
                ? 'bg-blue-100 dark:bg-blue-900'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            <Text 
              className={`text-xs font-medium ${
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
        </View>

        {/* Due Date */}
        {task.dueDate && (
          <Text 
            className={`text-xs ${
              isDue 
                ? 'text-red-600 dark:text-red-400 font-semibold' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {isDue ? '⚠️ ' : '📅 '}
            {formatDate(task.dueDate)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
