import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Animated } from 'react-native';
import { useColorScheme } from 'nativewind';

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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  const content = (
    <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
      <View style={[styles.spinnerWrap, isDark && styles.spinnerWrapDark]}>
        <ActivityIndicator size={size} color="#6366F1" />
      </View>
      {message ? (
        <Text style={[styles.message, isDark && styles.messageDark]}>{message}</Text>
      ) : null}
    </Animated.View>
  );

  if (fullscreen) {
    return (
      <View style={[styles.fullscreen, isDark && styles.fullscreenDark]}>
        {content}
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  fullscreenDark: { backgroundColor: '#0F172A' },
  inline: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  inner: { alignItems: 'center' },
  spinnerWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  spinnerWrapDark: { backgroundColor: '#1E293B' },
  message: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  messageDark: { color: '#94A3B8' },
});
