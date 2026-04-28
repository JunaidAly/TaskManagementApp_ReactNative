import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const GRADIENTS = {
  primary: ['#6366F1', '#8B5CF6'] as const,
  danger:  ['#EF4444', '#DC2626'] as const,
  success: ['#10B981', '#059669'] as const,
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  };

  const padding = { small: [8, 14], medium: [13, 20], large: [16, 24] }[size];
  const fontSize = { small: 13, medium: 15, large: 17 }[size];

  const isGradient = variant === 'primary' || variant === 'danger' || variant === 'success';
  const gradientColors = GRADIENTS[variant as keyof typeof GRADIENTS] ?? GRADIENTS.primary;

  const innerContent = loading ? (
    <ActivityIndicator color={variant === 'outline' ? '#6366F1' : '#fff'} size="small" />
  ) : (
    <View style={styles.row}>
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text style={[styles.text, { fontSize }, variant === 'outline' && styles.outlineText, variant === 'secondary' && styles.secondaryText, textStyle]}>
        {title}
      </Text>
    </View>
  );

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        style={[styles.container, (disabled || loading) && styles.disabled]}
      >
        {isGradient ? (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.inner, { paddingVertical: padding[0], paddingHorizontal: padding[1] }]}
          >
            {innerContent}
          </LinearGradient>
        ) : variant === 'outline' ? (
          <View style={[styles.inner, styles.outline, { paddingVertical: padding[0], paddingHorizontal: padding[1] }]}>
            {innerContent}
          </View>
        ) : (
          <View style={[styles.inner, styles.secondary, { paddingVertical: padding[0], paddingHorizontal: padding[1] }]}>
            {innerContent}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  disabled: { opacity: 0.55 },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: { marginRight: 8 },
  text: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  outlineText: { color: '#6366F1' },
  secondaryText: { color: '#374151' },
  outline: {
    borderWidth: 2,
    borderColor: '#6366F1',
    backgroundColor: 'transparent',
  },
  secondary: { backgroundColor: '#F1F5F9' },
});
