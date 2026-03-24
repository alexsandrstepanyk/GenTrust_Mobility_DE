import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config';

interface Child {
    id: string;
    firstName: string;
    lastName: string;
}

interface PersonalTask {
    id: string;
    title: string;
    description: string;
    reward: number;
    isCompleted: boolean;
    completedAt?: string;
    createdAt: string;
}

export default function TasksScreen({ navigation }: any) {
    const { t } = useTranslation();
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
    const [tasks, setTasks] = useState<PersonalTask[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedChildId) {
            fetchTasks();
        }
    }, [selectedChildId]);

    useEffect(() => {
        fetchPendingCount();
    }, []);

    const fetchChildren = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) return;

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

    const fetchTasks = async () => {
        if (!selectedChildId) return;

        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) return;

            const response = await axios.get(
                `${API_URL}/parents/child/${selectedChildId}/personal-tasks`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setTasks(response.data);
        } catch (error: any) {
            console.error('Error fetching tasks:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const fetchPendingCount = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) return;

            const response = await axios.get(`${API_URL}/completions/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPendingCount((response.data || []).length);
        } catch {
            setPendingCount(0);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchTasks();
    };

    const handleCreateTask = () => {
        if (!selectedChildId) {
            return Alert.alert(t('select_child'), t('select_child_first'));
        }
        navigation.navigate('CreateTask', { childId: selectedChildId });
    };

    const selectedChild = children.find(c => c.id === selectedChildId);

    const renderTask = ({ item }: { item: PersonalTask }) => (
        <View style={[styles.taskCard, item.isCompleted && styles.taskCardCompleted]}>
            <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>
                    {item.isCompleted ? '✅ ' : '📋 '}
                    {item.title}
                </Text>
                <Text style={styles.taskReward}>💰 {item.reward.toFixed(2)}€</Text>
            </View>
            <Text style={styles.taskDescription}>{item.description}</Text>
            <View style={styles.taskFooter}>
                <Text style={styles.taskDate}>
                    {item.isCompleted
                        ? `Виконано: ${new Date(item.completedAt!).toLocaleDateString('uk-UA')}`
                        : `Створено: ${new Date(item.createdAt).toLocaleDateString('uk-UA')}`
                    }
                </Text>
                {item.isCompleted && (
                    <View style={styles.completedBadge}>
                        <Text style={styles.completedText}>Виконано</Text>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#3B82F6', '#7C3AED']} style={styles.header}>
                <Text style={styles.headerTitle}>📝 Мої завдання</Text>
                {selectedChild && (
                    <Text style={styles.headerSubtitle}>
                        Дитина: {selectedChild.firstName} {selectedChild.lastName}
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

            <TouchableOpacity
                style={styles.reviewButton}
                onPress={() => navigation.navigate('PendingApprovals')}
            >
                <Text style={styles.reviewButtonText}>📸 Звіти на перевірку ({pendingCount})</Text>
            </TouchableOpacity>

            {tasks.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📋</Text>
                    <Text style={styles.emptyText}>Поки немає завдань</Text>
                    <Text style={styles.emptySubtext}>
                        Натисніть кнопку "+", щоб створити нове завдання
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={tasks}
                    renderItem={renderTask}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={handleCreateTask}>
                <LinearGradient colors={['#3B82F6', '#7C3AED']} style={styles.fabGradient}>
                    <Text style={styles.fabText}>+</Text>
                </LinearGradient>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F7FB',
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
    reviewButton: {
        marginHorizontal: 16,
        marginBottom: 8,
        backgroundColor: '#1D4ED8',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center'
    },
    reviewButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14
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
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    taskCard: {
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
        borderLeftColor: '#3B82F6',
    },
    taskCardCompleted: {
        borderLeftColor: '#10B981',
        opacity: 0.7,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    taskTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    taskReward: {
        fontSize: 16,
        fontWeight: '700',
        color: '#F59E0B',
    },
    taskDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        lineHeight: 20,
    },
    taskFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    taskDate: {
        fontSize: 12,
        color: '#999',
    },
    completedBadge: {
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    completedText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#059669',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fabText: {
        fontSize: 32,
        color: '#fff',
        fontWeight: '300',
    },
});
