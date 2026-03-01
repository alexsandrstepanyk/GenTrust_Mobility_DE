import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL } from '../config';

export default function ParentRegisterScreen({ navigation }: any) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!email || !password || !firstName) {
            Alert.alert('Помилка', 'Заповніть обов\'язкові поля');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/parents/register`, {
                email: email.trim().toLowerCase(),
                password,
                firstName,
                lastName,
            });

            Alert.alert('Успіх', 'Реєстрація батька завершена', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            const msg = error.response?.data?.error || 'Помилка при реєстрації';
            Alert.alert('Помилка', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content} contentContainerStyle={{ paddingVertical: 20 }}>
                <Text style={styles.title}>Реєстрація батька</Text>

                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ім'я"
                        value={firstName}
                        onChangeText={setFirstName}
                        editable={!loading}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Прізвище"
                        value={lastName}
                        onChangeText={setLastName}
                        editable={!loading}
                    />
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
                        style={[styles.registerButton, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.registerButtonText}>Зареєструватися</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 30,
    },
    form: {
        gap: 12,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        fontSize: 16,
    },
    registerButton: {
        backgroundColor: '#34C759',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 20,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});
