import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config';

interface Quest {
    id: string;
    title: string;
    description: string;
    reward: number;
    city: string;
    district: string;
    createdAt: string;
}

interface Child {
    id: string;
    firstName: string;
    lastName: string;
}

export default function ChildActivityScreen({ navigation }: any) {
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
    const [quests, setQuests] = useState<Quest[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedChildId) {
            fetchActivity();
        }
    }, [selectedChildId]);

    const fetchChildren = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                navigation.replace('Login');
                return;
            }

            const response = await axios.get(`${API_URL}/parents/children`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const approvedChildren = response.data
                .filter((rel: any) => rel.status === 'APPROVED')
                .map((rel: any) => rel.child);

            setChildren(approvedChildren);
            if (approvedChildren.length > 0) {
                setSelectedChildId(approvedChildren[0].id);
            }
        } catch (error: any) {
            console.error('Error fetching children:', error);
        }
    };

    const fetchActivity = async () => {
        if (!selectedChildId) return;

        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) return;

            const response = await axios.get(`${API_URL}/parents/child/${selectedChildId}/activity`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setQuests(response.data.completedQuests);
            setStats(response.data.stats);
        } catch (error) {
            console.error('Error fetching activity:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchActivity();
    };

    const selectedChild = children.find(c => c.id === selectedChildId);

    const renderQuest = ({ item }: { item: Quest }) => (
        <View style={styles.questCard}>
            <View style={styles.questHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.questTitle}>✅ {item.title}</Text>
                    <Text style={styles.questLocation}>📍 {item.city}, {item.district}</Text>
                </View>
                <Text style={styles.questReward}>💰 {item.reward}€</Text>
            </View>
            <Text style={styles.questDescription} numberOfLines={2}>{item.description}</Text>
            <Text style={styles.questDate}>
                {new Date(item.createdAt).toLocaleDateString('uk-UA')}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#3B82F6', '#7C3AED']} style={styles.header}>
                <Text style={styles.headerTitle}>📊 Активність дитини</Text>
                {selectedChild && (
                    <Text style={styles.headerSubtitle}>
                        {selectedChild.firstName} {selectedChild.lastName}
                    </Text>
                )}
            </LinearGradient>

            {children.length > 1 && (
                <View style={styles.childSelector}>
                    <FlatList
                        horizontal
                        data={children}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.childChip,
                                    selectedChildId === item.id && styles.childChipActive
                                ]}
                                onPress={() => setSelectedChildId(item.id)}
                            >
                                <Text style={[
                                    styles.childChipText,
                                    selectedChildId === item.id && styles.childChipTextActive
                                ]}>
                                    {item.firstName}
                                </Text>
                            </TouchableOpacity>
                        )}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.childSelectorContent}
                    />
                </View>
            )}

            {stats && (
                <View style={styles.statsBox}>
                    <View style={styles.statItem}>
                        <Text style={styles.statIcon}>✅</Text>
                        <Text style={styles.statValue}>{stats.totalCompleted}</Text>
                        <Text style={styles.statLabel}>Виконано</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statIcon}>💰</Text>
                        <Text style={styles.statValue}>{stats.totalEarned.toFixed(2)}€</Text>
                        <Text style={styles.statLabel}>Заробито</Text>
                    </View>
                </View>
            )}

            <FlatList
                data={quests}
                renderItem={renderQuest}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📊</Text>
                        <Text style={styles.emptyText}>Поки немає виконаних завдань</Text>
                        <Text style={styles.emptySubtext}>
                            Завдання вашої дитини з'являться тут після виконання
                        </Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F7FB',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 20,
        paddingTop: 12,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
    },
    childSelector: {
        paddingVertical: 12,
    },
    childSelectorContent: {
        paddingHorizontal: 16,
    },
    childChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#E5E7EB',
        marginRight: 8,
    },
    childChipActive: {
        backgroundColor: '#3B82F6',
    },
    childChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
    },
    childChipTextActive: {
        color: '#fff',
    },
    statsBox: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 16,
        padding: 4,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    statItem: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#E5E7EB',
    },
    statIcon: {
        fontSize: 28,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    questCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: '#10B981',
    },
    questHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    questTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    questLocation: {
        fontSize: 13,
        color: '#6B7280',
    },
    questReward: {
        fontSize: 15,
        fontWeight: '700',
        color: '#F59E0B',
    },
    questDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 8,
    },
    questDate: {
        fontSize: 12,
        color: '#999',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 40,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
});
