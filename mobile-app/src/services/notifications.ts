import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { apiClient } from './api';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return null;
    }

    // Get device token
    const token = await Notifications.getDevicePushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    });

    console.log('Push token:', token);
    return token;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return null;
  }
};

export const setupNotifications = async () => {
  try {
    // Request permissions
    const token = await requestNotificationPermissions();

    if (token) {
      // Send token to backend
      await apiClient.registerDeviceToken?.(token);
    }

    // Listen for notifications received while app is foregrounded
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received in foreground:', notification);
    });

    // Listen for user tapping on notification
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      // Handle navigation based on notification data
      const data = response.notification.request.content.data;
      handleNotificationTap(data);
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  } catch (error) {
    console.error('Error setting up notifications:', error);
  }
};

const handleNotificationTap = (data: any) => {
  // Implement navigation logic based on notification type
  console.log('Handling notification tap with data:', data);

  if (data.type === 'vpn_key') {
    // Navigate to VPN keys screen
  } else if (data.type === 'referral') {
    // Navigate to referral screen
  }
};

export const sendLocalNotification = async (title: string, body: string, data?: any) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error sending local notification:', error);
  }
};

export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
};
