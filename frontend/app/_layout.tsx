import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
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
      <StatusBar style="auto" />
      <Toast />
    </>
  );
}
