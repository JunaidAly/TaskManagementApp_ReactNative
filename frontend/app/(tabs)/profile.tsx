/**
 * Profile Screen
 * User profile and settings
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Button } from '../../components';
import { useAuthStore, useSettingsStore } from '../../store';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { theme, notificationsEnabled, setTheme, setNotificationsEnabled } = useSettingsStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            Toast.show({
              type: 'success',
              text1: 'Logged Out',
              text2: 'You have been successfully logged out',
            });
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="px-4 py-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Profile
          </Text>
        </View>

        {/* User Info Card */}
        <View className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm">
          <View className="items-center mb-4">
            <View className="w-20 h-20 bg-primary-500 rounded-full items-center justify-center mb-3">
              <Text className="text-3xl font-bold text-white">
                {user?.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              {user?.name}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {user?.email}
            </Text>
          </View>
        </View>

        {/* Settings Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Settings
          </Text>

          {/* Theme Setting */}
          <View className="bg-white dark:bg-gray-800 rounded-lg mb-3 shadow-sm">
            <View className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-base font-medium text-gray-900 dark:text-white mb-3">
                Theme
              </Text>
              <View className="flex-row">
                <TouchableOpacity
                  className={`flex-1 py-2 px-4 rounded-l-lg ${
                    theme === 'light' ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  onPress={() => setTheme('light')}
                >
                  <Text
                    className={`text-center font-medium ${
                      theme === 'light' ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Light
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-2 px-4 ${
                    theme === 'dark' ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  onPress={() => setTheme('dark')}
                >
                  <Text
                    className={`text-center font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Dark
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-2 px-4 rounded-r-lg ${
                    theme === 'system' ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  onPress={() => setTheme('system')}
                >
                  <Text
                    className={`text-center font-medium ${
                      theme === 'system' ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    System
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Notifications Setting */}
            <TouchableOpacity
              className="p-4 flex-row items-center justify-between"
              onPress={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              <Text className="text-base font-medium text-gray-900 dark:text-white">
                Notifications
              </Text>
              <View
                className={`w-12 h-6 rounded-full ${
                  notificationsEnabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <View
                  className={`w-5 h-5 rounded-full bg-white mt-0.5 ${
                    notificationsEnabled ? 'ml-6' : 'ml-0.5'
                  }`}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions */}
        <View className="mb-6">
          <TouchableOpacity
            className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 shadow-sm"
            onPress={() => router.push('/tasks/archived')}
          >
            <Text className="text-base font-medium text-gray-900 dark:text-white">
              📦 Archived Tasks
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 shadow-sm"
            onPress={() => {
              Toast.show({
                type: 'info',
                text1: 'About TaskMaster',
                text2: 'Version 1.0.0 - A learning project',
              });
            }}
          >
            <Text className="text-base font-medium text-gray-900 dark:text-white">
              ℹ️ About
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          size="large"
        />

        {/* Version Info */}
        <Text className="text-center text-xs text-gray-500 dark:text-gray-600 mt-6">
          TaskMaster v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}
