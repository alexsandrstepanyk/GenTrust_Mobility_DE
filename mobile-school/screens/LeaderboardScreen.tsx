import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import { API_URL } from '../config';

export default function LeaderboardScreen() {
    const [topUsers, setTopUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const token = await SecureStore.getItemAsync('userToken');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await axios.get(`${API_URL}/leaderboard`, { headers });
                setTopUsers(res.data || []);
            } catch (error) {
                console.error('Leaderboard fetch error:', error);
                setTopUsers([]);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🏆 Leaderboard</Text>
            <FlatList
                data={topUsers}
                keyExtractor={(item: any) => item.id}
                renderItem={({ item, index }) => (
                    <View style={styles.row}>
                        <Text style={styles.rank}>{index + 1}</Text>
                        <Text style={styles.name}>{item.firstName || 'Anonymous'}</Text>
                        <Text style={styles.score}>{item.dignityScore} pts</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
    row: { flexDirection: 'row', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
    rank: { width: 30, fontWeight: 'bold', color: '#007AFF' },
    name: { flex: 1, fontSize: 16 },
    score: { fontWeight: 'bold' }
});
