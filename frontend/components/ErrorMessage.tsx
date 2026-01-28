/**
 * Error Message Component
 * Displays error messages with retry option
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './Button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <Text className="text-5xl mb-4">⚠️</Text>
      <Text className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
        Oops! Something went wrong
      </Text>
      <Text className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
        {message}
      </Text>
      {onRetry && (
        <Button
          title="Try Again"
          onPress={onRetry}
          variant="primary"
          size="medium"
        />
      )}
    </View>
  );
};
