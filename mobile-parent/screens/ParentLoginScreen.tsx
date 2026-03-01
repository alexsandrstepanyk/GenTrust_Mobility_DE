import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config';
import { registerForPushNotifications } from '../services/pushNotifications';

export default function ParentLoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('admin@parent.com');
    const [password, setPassword] = useState('admin');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Помилка', 'Заповніть усі поля');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/auth/login`, {
                email: email.trim().toLowerCase(),
                password
            });

            if (response.data.user.role !== 'PARENT') {
                Alert.alert('Помилка', 'Цей акаунт не є батьківським');
                return;
            }

            // Зберігаємо токен та дані батька
            await SecureStore.setItemAsync('userToken', response.data.token);
            await SecureStore.setItemAsync('userId', response.data.user.id);
            await SecureStore.setItemAsync('userRole', response.data.user.role);
            await SecureStore.setItemAsync('userData', JSON.stringify(response.data.user));

            registerForPushNotifications(response.data.token).catch((e) => console.log('[PUSH] register after login failed:', e));

            navigation.replace('Home');
        } catch (error: any) {
            const msg = error.response?.data?.error || 'Помилка при логіні';
            Alert.alert('Помилка', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>👨‍👩‍👧 GenTrust</Text>
                <Text style={styles.subtitle}>Додаток для батьків</Text>

                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        editable={!loading}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Пароль"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        editable={!loading}
                    />

                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Вхід</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Немаєте акаунту?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.registerLink}>Реєстрація</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
    },
    form: {
        marginBottom: 30,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        fontSize: 16,
    },
    loginButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 20,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
    footerText: {
        fontSize: 14,
        color: '#666',
    },
    registerLink: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
});
