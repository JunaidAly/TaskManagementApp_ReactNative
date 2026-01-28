/**
 * Empty State Component
 * Shows when there's no content to display
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon = '📝',
}) => {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <Text className="text-6xl mb-4">{icon}</Text>
      <Text className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
        {title}
      </Text>
      {description && (
        <Text className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          size="medium"
        />
      )}
    </View>
  );
};
