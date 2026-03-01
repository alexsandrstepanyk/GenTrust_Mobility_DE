import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import axios from 'axios';
import { API_URL } from '../config';
import * as SecureStore from 'expo-secure-store';

// Налаштування поведінки сповіщень
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(authToken?: string) {
  if (!Device.isDevice) {
    console.log('[PUSH] Не на фізичному девайсі - пропускаємо реєстрацію');
    return;
  }

  try {
    // Запитаємо дозвіл
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[PUSH] Дозвіл на сповіщення не надано');
      return;
    }

    // Отримаємо токен
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });

    console.log('[PUSH] Токен отримано:', token.data);

    // Реєструємо на бекенді
    try {
      const jwt = authToken || await SecureStore.getItemAsync('userToken');
      if (!jwt) {
        console.log('[PUSH] JWT токен не знайдено, пропускаємо реєстрацію push на бекенді');
        return token.data;
      }

      await axios.post(`${API_URL}/users/push-token`, {
        token: token.data,
      }, {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      });
      console.log('[PUSH] Токен зареєстровано на бекенді');
    } catch (error) {
      console.error('[PUSH] Помилка реєстрації токена:', error);
    }
    return token.data;
  } catch (error) {
    console.error('[PUSH] Помилка при реєстрації:', error);
    return null;
  }
}

export function setupNotificationListeners() {
  // Слухаємо отримані сповіщення
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('[PUSH] Отримано сповіщення:', notification);
    }
  );

  // Слухаємо натиск на сповіщення
  const responseListener = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log('[PUSH] Натиск на сповіщення:', response);
      // Тут можна навігувати до потрібного екрану
    }
  );

  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}

export async function sendTestNotification(title: string, body: string) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { screen: 'quest' },
      },
      trigger: null,
    });
    console.log('[PUSH] Тестове сповіщення заплановане');
  } catch (error) {
    console.error('[PUSH] Помилка при отправці тестового сповіщення:', error);
  }
}
