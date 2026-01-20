import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Updates from 'expo-updates';

export const useAppUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (__DEV__) return; // Skip in development

    if (Platform.OS === 'web') return; // Skip on web

    if (!Updates.isEnabled) return;

    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      const update = await Updates.checkAsync();

      if (update.isAvailable) {
        setUpdateAvailable(true);

        // Auto-download the update
        await Updates.fetchUpdateAsync();

        // Show alert and reload
        // Note: You might want to show a custom modal instead
        // This is a basic implementation
        if (Platform.OS === 'android' || Platform.OS === 'ios') {
          alert('Обновление готово', 'Приложение будет перезагружено для применения обновления.');

          // Reload after a short delay
          setTimeout(() => {
            Updates.reloadAsync();
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  return { updateAvailable, checkForUpdates };
};
