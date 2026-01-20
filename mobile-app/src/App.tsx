import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';

import { store } from './redux/store';
import RootNavigator from './navigation/RootNavigator';
import { setupNotifications } from './services/notifications';
import { useAppUpdate } from './hooks/useAppUpdate';

function AppContent() {
  useAppUpdate();

  useEffect(() => {
    // Initialize push notifications
    setupNotifications();
  }, []);

  return (
    <>
      <RootNavigator />
      <StatusBar barStyle="dark-content" />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </GestureHandlerRootView>
  );
}
