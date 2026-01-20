import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  title: string;
  body: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  enabled: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  enabled: true,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.read).length;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => (n.read = true));
      state.unreadCount = 0;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.enabled = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  setNotificationsEnabled,
  setLoading,
  setError,
  clearError,
} = notificationSlice.actions;

export const selectNotifications = (state: { notifications: NotificationState }) =>
  state.notifications.notifications;
export const selectUnreadCount = (state: { notifications: NotificationState }) =>
  state.notifications.unreadCount;
export const selectNotificationsEnabled = (state: { notifications: NotificationState }) =>
  state.notifications.enabled;
export const selectNotificationLoading = (state: { notifications: NotificationState }) =>
  state.notifications.loading;
export const selectNotificationError = (state: { notifications: NotificationState }) =>
  state.notifications.error;

export default notificationSlice.reducer;
