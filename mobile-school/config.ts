// API Configuration for GenTrust School App
// For iOS Simulator use localhost, for device use your Mac's IP
const API_HOST = '192.168.1.12';  // IP вашого комп'ютера для доступу з телефону
const API_PORT = '3000';

export const API_URL = `http://${API_HOST}:${API_PORT}/api`;

export const CONFIG = {
    apiHost: API_HOST,
    apiPort: API_PORT,
    apiUrl: API_URL,
    timeout: 10000,
};

console.log('[CONFIG] Resolved API host:', API_HOST);
console.log('[CONFIG] API URL:', API_URL);
