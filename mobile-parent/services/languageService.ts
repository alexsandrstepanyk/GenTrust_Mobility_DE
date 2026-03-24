import * as SecureStore from 'expo-secure-store';
import i18n from './i18n';

const SAVED_LANGUAGE_KEY = 'saved_language';

// Функція для збереження мови
export const saveLanguage = async (lang: string) => {
    try {
        await SecureStore.setItemAsync(SAVED_LANGUAGE_KEY, lang);
        await i18n.changeLanguage(lang);
        console.log('[Language] Language saved:', lang);
    } catch (error) {
        console.error('[Language] Error saving language:', error);
    }
};

// Функція для завантаження мови
export const loadSavedLanguage = async () => {
    try {
        const savedLang = await SecureStore.getItemAsync(SAVED_LANGUAGE_KEY);
        if (savedLang) {
            await i18n.changeLanguage(savedLang);
            console.log('[Language] Loaded saved language:', savedLang);
            return savedLang;
        }
        console.log('[Language] No saved language, using default');
        return null;
    } catch (error) {
        console.error('[Language] Error loading language:', error);
        return null;
    }
};
