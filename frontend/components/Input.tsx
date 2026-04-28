import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  TextInputProps,
  StyleSheet,
  Animated,
} from 'react-native';
import { useColorScheme } from 'nativewind';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: object;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  rightIcon,
  onRightIconPress,
  containerStyle,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 180, useNativeDriver: false }).start();
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 180, useNativeDriver: false }).start();
    onBlur?.(e);
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: error
      ? ['#EF4444', '#EF4444']
      : [isDark ? '#334155' : '#E2E8F0', '#6366F1'],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
      ) : null}

      <Animated.View
        style={[
          styles.inputWrap,
          isDark ? styles.inputWrapDark : styles.inputWrapLight,
          { borderColor },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            isDark ? styles.inputDark : styles.inputLight,
            rightIcon ? { paddingRight: 48 } : null,
          ]}
          placeholderTextColor={isDark ? '#4B5563' : '#94A3B8'}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon ? (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {rightIcon}
          </TouchableOpacity>
        ) : null}
      </Animated.View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  labelDark: { color: '#94A3B8' },
  inputWrap: {
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapLight: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  inputWrapDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '400',
  },
  inputLight: { color: '#0F172A' },
  inputDark: { color: '#F1F5F9' },
  rightIcon: {
    position: 'absolute',
    right: 14,
    padding: 4,
  },
  error: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 5,
    marginLeft: 4,
  },
});
