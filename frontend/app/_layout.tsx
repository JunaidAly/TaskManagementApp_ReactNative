import '../global.css';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="tasks/create"
          options={{
            headerShown: true,
            title: 'Create Task',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="tasks/[id]"
          options={{
            headerShown: true,
            title: 'Task Details',
          }}
        />
        <Stack.Screen
          name="tasks/edit/[id]"
          options={{
            headerShown: true,
            title: 'Edit Task',
          }}
        />
        <Stack.Screen
          name="tasks/archived"
          options={{
            headerShown: true,
            title: 'Archived Tasks',
          }}
        />
      </Stack>
      <StatusBar style={theme === 'dark' ? 'light' : 'auto'} />
      <Toast />
    </>
  );
}
