import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Completion = {
  id: string;
  description?: string;
  photoUrl?: string;
  student?: { firstName?: string; lastName?: string };
  quest?: { title?: string; reward?: number };
};

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.178.34:3000/api';

export default function ClientApprovalsScreen() {
  const [token, setToken] = useState('');
  const [items, setItems] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(false);

  const canLoad = useMemo(() => token.trim().length > 20, [token]);

  const loadPending = async () => {
    if (!canLoad) {
      Alert.alert('Токен потрібен', 'Вставте JWT токен клієнта.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/completions/pending`, {
        headers: { Authorization: `Bearer ${token.trim()}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Request failed');
      setItems(data || []);
    } catch (e: any) {
      Alert.alert('Помилка', e?.message || 'Не вдалося завантажити звіти');
    } finally {
      setLoading(false);
    }
  };

  const decide = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`${API_BASE}/completions/${id}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.trim()}`
        },
        body: action === 'reject' ? JSON.stringify({ reason: 'Потрібне доопрацювання' }) : '{}'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Action failed');
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e: any) {
      Alert.alert('Помилка', e?.message || 'Не вдалося оновити статус');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📸 Перевірка фото-звітів (Client)</Text>
      <TextInput
        style={styles.input}
        value={token}
        onChangeText={setToken}
        placeholder="Вставте JWT токен клієнта"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.loadBtn} onPress={loadPending}>
        <Text style={styles.loadText}>{loading ? 'Завантаження...' : 'Оновити список'}</Text>
      </TouchableOpacity>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Немає звітів на перевірку</Text>}
        renderItem={({ item }) => {
          const imageUrl = item.photoUrl?.startsWith('/uploads')
            ? `${API_BASE.replace('/api', '')}${item.photoUrl}`
            : item.photoUrl;

          return (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.quest?.title || 'Завдання'}</Text>
              <Text style={styles.meta}>👤 {item.student?.firstName || ''} {item.student?.lastName || ''}</Text>
              <Text style={styles.meta}>💰 {Number(item.quest?.reward || 0).toFixed(2)} EUR</Text>
              {item.description ? <Text style={styles.meta}>📝 {item.description}</Text> : null}
              {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.img} /> : null}
              <View style={styles.row}>
                <TouchableOpacity style={[styles.btn, styles.reject]} onPress={() => decide(item.id, 'reject')}>
                  <Text style={styles.btnText}>❌ Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.approve]} onPress={() => decide(item.id, 'approve')}>
                  <Text style={styles.btnText}>✅ Approve</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: '#F5F6FA' },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
  input: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 10, paddingVertical: 10 },
  loadBtn: { marginTop: 8, marginBottom: 10, backgroundColor: '#2563EB', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  loadText: { color: '#fff', fontWeight: '700' },
  empty: { textAlign: 'center', color: '#777', marginTop: 30 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10 },
  cardTitle: { fontWeight: '700', fontSize: 15, marginBottom: 4 },
  meta: { color: '#444', marginBottom: 3 },
  img: { width: '100%', height: 160, borderRadius: 10, marginTop: 8, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, borderRadius: 8, alignItems: 'center', paddingVertical: 10 },
  reject: { backgroundColor: '#DC2626' },
  approve: { backgroundColor: '#16A34A' },
  btnText: { color: '#fff', fontWeight: '700' }
});
