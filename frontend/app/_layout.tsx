import '../global.css';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from 'nativewind';
import Toast from 'react-native-toast-message';
import { useSettingsStore } from '../store';

export default function RootLayout() {
  const { setColorScheme } = useColorScheme();
  const theme = useSettingsStore((s) => s.theme);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    setColorScheme(theme);
  }, [theme]);

  const isDark = theme === 'dark';

  const headerStyle = { backgroundColor: isDark ? '#1E293B' : '#fff' };
  const headerTitleStyle = { fontWeight: '700' as const, fontSize: 17, color: isDark ? '#F1F5F9' : '#0F172A' };
  const headerTintColor = isDark ? '#A5B4FC' : '#6366F1';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding/index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="tasks/create"
          options={{
            headerShown: true,
            title: 'New Task',
            presentation: 'modal',
            headerStyle,
            headerTitleStyle,
            headerTintColor,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="tasks/[id]"
          options={{
            headerShown: false,
            headerStyle,
            headerTitleStyle,
            headerTintColor,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="tasks/edit/[id]"
          options={{
            headerShown: true,
            title: 'Edit Task',
            headerStyle,
            headerTitleStyle,
            headerTintColor,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="tasks/archived"
          options={{
            headerShown: true,
            title: 'Archived Tasks',
            headerStyle,
            headerTitleStyle,
            headerTintColor,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="profile/edit"
          options={{
            headerShown: false,
            headerStyle,
            headerTitleStyle,
            headerTintColor,
            headerShadowVisible: false,
          }}
        />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Toast />
    </GestureHandlerRootView>
  );
}
