import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config';

export default function CreateTaskScreen({ route, navigation }: any) {
    const { childId } = route.params;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [reward, setReward] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateTask = async () => {
        if (!title) {
            Alert.alert('Помилка', 'Введіть назву завдання');
            return;
        }

        try {
            setLoading(true);
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                navigation.replace('Login');
                return;
            }

            await axios.post(`${API_URL}/parents/create-task`, {
                childId,
                title,
                description,
                reward: reward ? parseFloat(reward) : 0,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('Успіх', 'Завдання створено!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            const msg = error.response?.data?.error || 'Помилка при створенні завдання';
            Alert.alert('Помилка', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content} contentContainerStyle={{ paddingVertical: 20 }}>
                <Text style={styles.sectionTitle}>📋 Нове завдання</Text>

                <View style={styles.form}>
                    <View>
                        <Text style={styles.label}>Назва завдання *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Наприклад: Купити хліб"
                            value={title}
                            onChangeText={setTitle}
                            editable={!loading}
                        />
                    </View>

                    <View>
                        <Text style={styles.label}>Опис</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Додаткові деталі..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            editable={!loading}
                        />
                    </View>

                    <View>
                        <Text style={styles.label}>Винагорода (€)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            value={reward}
                            onChangeText={setReward}
                            keyboardType="decimal-pad"
                            editable={!loading}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.createButton, loading && styles.buttonDisabled]}
                        onPress={handleCreateTask}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.createButtonText}>Створити завдання</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>ℹ️ Інформація</Text>
                    <Text style={styles.infoText}>
                        • Це завдання буде видно тільки вашій дитині
                    </Text>
                    <Text style={styles.infoText}>
                        • Дитина отримає повідомлення про нове завдання
                    </Text>
                    <Text style={styles.infoText}>
                        • Дитина може виконати завдання і отримати винагороду
                    </Text>
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
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
    },
    form: {
        gap: 20,
        marginBottom: 30,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#1a1a1a',
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
    textArea: {
        paddingVertical: 12,
        textAlignVertical: 'top',
    },
    createButton: {
        backgroundColor: '#34C759',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    infoBox: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
        padding: 16,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 13,
        color: '#666',
        marginBottom: 6,
        lineHeight: 20,
    },
});
