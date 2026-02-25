import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';

import { API_URL } from '../config';

export default function LoginScreen({ navigation }: any) {
    const { t, i18n } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [apiStatus, setApiStatus] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async () => {
        // Prevent double-submit when button is held
        if (isLoggingIn) {
            return;
        }

        if (!email.trim() || !password.trim()) {
            Alert.alert(t('error'), 'Please enter both email and password');
            return;
        }

        const cyrillicPattern = /[А-Яа-яЁёІіЇїЄєҐґ]/;
        if (cyrillicPattern.test(password) || cyrillicPattern.test(email)) {
            Alert.alert(t('error'), 'Switch keyboard to Latin (EN) and try again.');
            return;
        }

        const normalizedEmail = email.trim().toLowerCase();
        const url = `${API_URL}/auth/login`;
        console.log(`[AUTH DEBUG] API_URL configured as: ${API_URL}`);
        console.log(`[AUTH DEBUG] Sending login to: ${url}`);
        console.log(`[AUTH DEBUG] Payload:`, { email: normalizedEmail, passwordLength: password?.length });
        
        setIsLoggingIn(true);
        try {
            console.log('[AUTH DEBUG] Making axios POST request...');
            const response = await axios.post(url, {
                email: normalizedEmail,
                password
            });
            console.log('[AUTH DEBUG] Response status:', response.status);
            console.log('[AUTH DEBUG] Response headers:', response.headers);
            const { user, token } = response.data;
            console.log('Login success:', user.firstName);
            console.log('[AUTH DEBUG] Received token:', token ? `${token.substring(0, 20)}...` : 'NONE');

            // Save token to SecureStore
            if (token) {
                await SecureStore.setItemAsync('userToken', token);
                console.log('[AUTH DEBUG] Token saved to SecureStore');
            }

            if (user.language) {
                const baseLang = user.language.split('-')[0];
                console.log('Setting user language:', baseLang);
                i18n.changeLanguage(baseLang);
            }

            Alert.alert(t('success', 'Success'), `${t('welcome_back', 'Welcome back')}, ${user.firstName}!`);
            navigation.navigate('Home');
        } catch (error: any) {
            console.error('[AUTH DEBUG] Login error caught');
            console.error('[AUTH DEBUG] Error type:', error.constructor.name);
            console.error('[AUTH DEBUG] Error message:', error.message);
            if (error.response) {
                console.error('[AUTH DEBUG] Response status:', error.response.status);
                console.error('[AUTH DEBUG] Response data:', error.response.data);
                console.error('[AUTH DEBUG] Response headers:', error.response.headers);
                Alert.alert('Error', `Server error ${error.response.status}: ${error.response.data.error || 'Invalid credentials'}`);
            } else if (error.request) {
                console.error('[AUTH DEBUG] No response received');
                console.error('[AUTH DEBUG] Request details:', error.request);
                Alert.alert('Network Error', `Could not connect to ${API_URL}.\nError: ${error.message || 'Unknown'}\n\nPlease check:\n1. Server is running\n2. Correct API URL\n3. Network connectivity`);
            } else {
                console.error('[AUTH DEBUG] Error setup:', error.message);
                Alert.alert('Error', error.message || 'Unknown error');
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleTestApi = async () => {
        const urls = [`${API_URL}/health`, `${API_URL.replace('/api', '')}/health`];
        const results: string[] = [];

        for (const testUrl of urls) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 7000);
                const res = await fetch(testUrl, { signal: controller.signal });
                clearTimeout(timeout);
                const text = await res.text();
                results.push(`${testUrl}\nOK ${res.status}: ${text}`);
            } catch (error: any) {
                const message = error?.message || 'Unknown error';
                results.push(`${testUrl}\nERROR: ${message}`);
            }
        }

        const summary = results.join('\n\n');
        setApiStatus(summary.includes('ERROR') ? 'ERROR' : 'OK');
        Alert.alert('API Test Results', summary);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>GenTrust Mobility</Text>
            <TextInput
                style={styles.input}
                placeholder={t('email')}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
            />
            <TextInput
                style={styles.input}
                placeholder={t('password')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
            />
            <TouchableOpacity 
                style={[styles.button, isLoggingIn && styles.buttonDisabled]} 
                onPress={handleLogin}
                disabled={isLoggingIn}
            >
                <Text style={styles.buttonText}>{isLoggingIn ? t('loading', 'Logging in...') : t('login')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.link}>Don't have an account? Register</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.testButton} onPress={handleTestApi}>
                <Text style={styles.testButtonText}>Test API</Text>
            </TouchableOpacity>
            <Text style={styles.debugText}>API: {API_URL}</Text>
            {!!apiStatus && <Text style={styles.debugText}>Status: {apiStatus}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
    input: { height: 50, borderColor: '#ddd', borderWidth: 1, marginBottom: 15, paddingHorizontal: 15, borderRadius: 8 },
    button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
    buttonDisabled: { backgroundColor: '#CCCCCC', opacity: 0.6 },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    link: { marginTop: 15, color: '#007AFF', textAlign: 'center' },
    debugText: { marginTop: 12, color: '#999', fontSize: 12, textAlign: 'center' },
    testButton: { marginTop: 12, padding: 10, borderRadius: 8, backgroundColor: '#EFEFF4', alignItems: 'center' },
    testButtonText: { color: '#333', fontWeight: '600' },
});
