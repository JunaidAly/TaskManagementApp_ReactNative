/**
 * Custom Button Component
 * Reusable button with different variants
 */

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonClass = () => {
    let baseClass = 'rounded-lg items-center justify-center ';
    
    // Size styles
    switch (size) {
      case 'small':
        baseClass += 'px-3 py-2 ';
        break;
      case 'large':
        baseClass += 'px-6 py-4 ';
        break;
      default:
        baseClass += 'px-4 py-3 ';
    }

    // Variant styles
    switch (variant) {
      case 'secondary':
        baseClass += 'bg-gray-200 ';
        break;
      case 'outline':
        baseClass += 'bg-transparent border-2 border-primary-500 ';
        break;
      case 'danger':
        baseClass += 'bg-red-500 ';
        break;
      default:
        baseClass += 'bg-primary-500 ';
    }

    if (disabled || loading) {
      baseClass += 'opacity-50 ';
    }

    return baseClass;
  };

  const getTextClass = () => {
    let baseClass = 'font-semibold ';
    
    // Size styles
    switch (size) {
      case 'small':
        baseClass += 'text-sm ';
        break;
      case 'large':
        baseClass += 'text-lg ';
        break;
      default:
        baseClass += 'text-base ';
    }

    // Variant styles
    if (variant === 'outline') {
      baseClass += 'text-primary-500 ';
    } else if (variant === 'secondary') {
      baseClass += 'text-gray-800 ';
    } else {
      baseClass += 'text-white ';
    }

    return baseClass;
  };

  return (
    <TouchableOpacity
      className={getButtonClass()}
      onPress={onPress}
      disabled={disabled || loading}
      style={style}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#3B82F6' : '#FFFFFF'} />
      ) : (
        <Text className={getTextClass()} style={textStyle}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
