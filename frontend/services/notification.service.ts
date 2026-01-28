/**
 * Notification Service
 * Handles push notifications for task reminders
 * 
 * Uses Expo Notifications for cross-platform support
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are presented
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export const requestPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    // For Android, create notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Schedule a notification for a task
 */
export const scheduleTaskNotification = async (
  taskId: string,
  title: string,
  dueDate: Date
): Promise<string | null> => {
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return null;
    }

    // Schedule notification 1 hour before due date
    const notificationTime = new Date(dueDate.getTime() - 60 * 60 * 1000);
    
    // Don't schedule if notification time is in the past
    if (notificationTime < new Date()) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Reminder',
        body: `Your task "${title}" is due in 1 hour`,
        data: { taskId },
        sound: true,
      },
      trigger: notificationTime,
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

/**
 * Cancel a scheduled notification
 */
export const cancelNotification = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

/**
 * Cancel all notifications for a task
 */
export const cancelAllTaskNotifications = async (taskId: string): Promise<void> => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.taskId === taskId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (error) {
    console.error('Error canceling task notifications:', error);
  }
};

/**
 * Send an immediate notification
 */
export const sendImmediateNotification = async (
  title: string,
  body: string,
  data?: any
): Promise<void> => {
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

export default {
  requestPermissions,
  scheduleTaskNotification,
  cancelNotification,
  cancelAllTaskNotifications,
  sendImmediateNotification,
};
