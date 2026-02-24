import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Автоматичне визначення API URL в залежності від середовища
const API_BASE_URL = (() => {
  // 1) Явний URL/host через env (для APK/production)
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl) return envApiUrl;

  const envApiHost = process.env.EXPO_PUBLIC_API_HOST;
  if (envApiHost) return `http://${envApiHost}:3000/api`;

  // 2) app.json extra (more reliable for EAS builds)
  const extraApiUrl =
    Constants.expoConfig?.extra?.apiUrl ||
    // @ts-ignore - fallback for older Expo manifest shape
    Constants.manifest?.extra?.apiUrl;
  if (extraApiUrl) return extraApiUrl;

  // Спроба витягнути host з Expo (працює і для симулятора, і для фізичного девайсу)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    // @ts-ignore - fallback for older Expo manifest shape
    Constants.manifest?.debuggerHost ||
    // @ts-ignore - fallback for newer manifest2 shape
    Constants.manifest2?.extra?.expoClient?.hostUri;

  const host = hostUri ? hostUri.split(':')[0] : undefined;

  // ВАЖЛИВО: Для iOS симулятора використовуємо localhost
  // Якщо localhost не працює (503), спробуйте вашу локальну IP: 192.168.178.34
  const defaultHost = Platform.select({
    ios: 'localhost', // або '192.168.178.34' якщо localhost не працює
    android: '10.0.2.2'
  });

  const resolvedHost = host || defaultHost || 'localhost';
  console.log(`[CONFIG] Resolved API host: ${resolvedHost}`);
  return `http://${resolvedHost}:3000/api`;
})();

export const API_URL = API_BASE_URL;
export default { API_URL: API_BASE_URL };
