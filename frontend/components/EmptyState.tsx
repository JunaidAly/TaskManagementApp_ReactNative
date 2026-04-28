import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useColorScheme } from 'nativewind';
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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 8, bounciness: 6 }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={[styles.iconWrap, isDark && styles.iconWrapDark]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.title, isDark && styles.titleDark]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, isDark && styles.descriptionDark]}>{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.actionWrap}>
          <Button title={actionLabel} onPress={onAction} size="medium" />
        </View>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconWrapDark: { backgroundColor: '#1E293B' },
  icon: { fontSize: 40 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  titleDark: { color: '#F1F5F9' },
  description: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  descriptionDark: { color: '#94A3B8' },
  actionWrap: { width: '100%' },
});
