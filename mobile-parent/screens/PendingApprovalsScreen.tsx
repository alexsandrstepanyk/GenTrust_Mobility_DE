import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config';

type Completion = {
    id: string;
    status: string;
    description?: string;
    photoUrl?: string;
    completedAt: string;
    student?: { firstName?: string; lastName?: string };
    quest?: { title?: string; reward?: number };
};

export default function PendingApprovalsScreen() {
    const [items, setItems] = useState<Completion[]>([]);
    const [loading, setLoading] = useState(false);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const fetchPending = useCallback(async () => {
        try {
            setLoading(true);
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) return;

            const response = await axios.get(`${API_URL}/completions/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setItems(response.data || []);
        } catch (error: any) {
            Alert.alert('Помилка', error?.response?.data?.error || 'Не вдалося завантажити заявки на перевірку');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    const approve = async (completionId: string) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) return;

            await axios.post(
                `${API_URL}/completions/${completionId}/approve`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Alert.alert('Готово', 'Завдання підтверджено, винагорода нарахована.');
            fetchPending();
        } catch (error: any) {
            Alert.alert('Помилка', error?.response?.data?.error || 'Не вдалося підтвердити завдання');
        }
    };

    const reject = async () => {
        if (!rejectingId) return;
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) return;

            await axios.post(
                `${API_URL}/completions/${rejectingId}/reject`,
                { reason: rejectReason || 'Потрібне доопрацювання' },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setRejectingId(null);
            setRejectReason('');
            Alert.alert('Готово', 'Завдання відхилено.');
            fetchPending();
        } catch (error: any) {
            Alert.alert('Помилка', error?.response?.data?.error || 'Не вдалося відхилити завдання');
        }
    };

    const renderItem = ({ item }: { item: Completion }) => {
        const imageUrl = item.photoUrl?.startsWith('http')
            ? item.photoUrl
            : item.photoUrl
                ? `${API_URL}${item.photoUrl}`
                : undefined;

        return (
            <View style={styles.card}>
                <Text style={styles.title}>{item.quest?.title || 'Завдання'}</Text>
                <Text style={styles.meta}>👤 {item.student?.firstName || ''} {item.student?.lastName || ''}</Text>
                <Text style={styles.meta}>💰 {Number(item.quest?.reward || 0).toFixed(2)} EUR</Text>
                {item.description ? <Text style={styles.description}>📝 {item.description}</Text> : null}
                {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} /> : null}

                <View style={styles.row}>
                    <TouchableOpacity style={[styles.btn, styles.reject]} onPress={() => setRejectingId(item.id)}>
                        <Text style={styles.btnText}>❌ Відхилити</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.approve]} onPress={() => approve(item.id)}>
                        <Text style={styles.btnText}>✅ Підтвердити</Text>
                    </TouchableOpacity>
                </View>

                {rejectingId === item.id && (
                    <View style={styles.rejectBox}>
                        <TextInput
                            placeholder="Причина відхилення"
                            value={rejectReason}
                            onChangeText={setRejectReason}
                            style={styles.input}
                        />
                        <TouchableOpacity style={[styles.btn, styles.reject]} onPress={reject}>
                            <Text style={styles.btnText}>Надіслати відхилення</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>📸 Звіти на перевірку</Text>
            {loading ? <Text style={styles.loading}>Завантаження...</Text> : null}
            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.empty}>Немає заявок на перевірку</Text>}
                onRefresh={fetchPending}
                refreshing={loading}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F6F7FB' },
    header: { fontSize: 22, fontWeight: '800', marginHorizontal: 16, marginTop: 12, marginBottom: 8 },
    loading: { marginHorizontal: 16, color: '#666' },
    list: { padding: 16, paddingBottom: 28 },
    empty: { textAlign: 'center', color: '#777', marginTop: 40 },
    card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12 },
    title: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
    meta: { fontSize: 13, color: '#555', marginBottom: 2 },
    description: { fontSize: 13, color: '#444', marginTop: 6 },
    image: { width: '100%', height: 180, borderRadius: 10, marginTop: 10, marginBottom: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
    btn: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
    approve: { backgroundColor: '#16A34A' },
    reject: { backgroundColor: '#DC2626' },
    btnText: { color: '#fff', fontWeight: '700' },
    rejectBox: { marginTop: 10 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 8 }
});
