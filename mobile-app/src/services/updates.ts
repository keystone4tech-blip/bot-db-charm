import * as Updates from 'expo-updates';

export const checkForUpdates = async () => {
  try {
    if (!Updates.isEnabled) {
      console.log('Updates are disabled');
      return false;
    }

    const update = await Updates.checkAsync();

    if (update.isAvailable) {
      console.log('Update available!');

      // Fetch the update
      await Updates.fetchUpdateAsync();

      // Show alert and reload
      alert(
        'Обновление установлено',
        'Приложение будет перезагружено для применения обновления.'
      );

      // Reload to apply the update
      await Updates.reloadAsync();

      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking for updates:', error);
    return false;
  }
};

export const isUpdateAvailable = async () => {
  try {
    if (!Updates.isEnabled) {
      return false;
    }

    const update = await Updates.checkAsync();
    return update.isAvailable;
  } catch (error) {
    console.error('Error checking update availability:', error);
    return false;
  }
};

export const getUpdateInfo = async () => {
  try {
    return await Updates.checkAsync();
  } catch (error) {
    console.error('Error getting update info:', error);
    return null;
  }
};

export const reloadApp = async () => {
  try {
    await Updates.reloadAsync();
  } catch (error) {
    console.error('Error reloading app:', error);
  }
};
