/**
 * Loading Spinner Component
 * Full-screen or inline loading indicator
 */

import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingProps {
  fullscreen?: boolean;
  message?: string;
  size?: 'small' | 'large';
}

export const Loading: React.FC<LoadingProps> = ({
  fullscreen = false,
  message,
  size = 'large',
}) => {
  if (fullscreen) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size={size} color="#3B82F6" />
        {message && (
          <Text className="mt-4 text-gray-600 dark:text-gray-400">{message}</Text>
        )}
      </View>
    );
  }

  return (
    <View className="items-center justify-center py-8">
      <ActivityIndicator size={size} color="#3B82F6" />
      {message && (
        <Text className="mt-2 text-gray-600 dark:text-gray-400 text-sm">{message}</Text>
      )}
    </View>
  );
};
