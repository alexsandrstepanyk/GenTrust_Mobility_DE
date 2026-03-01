import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
    ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config';
import TaskAcceptModal from './TaskAcceptModal';

interface Quest {
    id: string;
    title: string;
    description: string;
    reward: number;
    type: string;
    city: string;
    district: string;
    location: string;
    status: string;
    createdAt: string;
}

export default function QuestsScreen({ navigation }: any) {
    const { t, i18n } = useTranslation();
    const [availableQuests, setAvailableQuests] = useState<Quest[]>([]);
    const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [takingId, setTakingId] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        fetchAllQuests();
        
        // Оновлюємо список при поверненні на екран
        const unsubscribe = navigation.addListener('focus', () => {
            fetchAllQuests();
        });
        
        return unsubscribe;
    }, [navigation]);

    const fetchAllQuests = async () => {
        try {
            setLoading(true);
            const token = await SecureStore.getItemAsync('userToken');
            
            if (!token) {
                Alert.alert(t('error', 'Error'), 'No authentication token. Please login again.');
                setLoading(false);
                return;
            }

            // Fetch available quests
            const availableRes = await axios.get(`${API_URL}/quests/available`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAvailableQuests(availableRes.data);

            // Fetch active quests (IN_PROGRESS)
            const activeRes = await axios.get(`${API_URL}/users/active-quest`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (activeRes.data) {
                setActiveQuest(activeRes.data);
            }
        } catch (error: any) {
            console.error('Error fetching quests:', error);
            Alert.alert(t('error', 'Error'), error.response?.data?.error || t('failed_to_load', 'Failed to load quests'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleTakeQuest = async (questId: string) => {
        // Show modal first
        const quest = availableQuests.find(q => q.id === questId);
        if (quest) {
            setSelectedQuest(quest);
            setModalVisible(true);
        }
    };

    const handleConfirmAccept = async (questId: string) => {
        try {
            setModalLoading(true);
            const token = await SecureStore.getItemAsync('userToken');
            
            const response = await axios.post(
                `${API_URL}/quests/${questId}/take`, 
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Close modal and refresh quests
            setModalVisible(false);
            setSelectedQuest(null);
            
            Alert.alert(
                t('success', 'Success'),
                t('quest_accepted', 'Quest accepted! Check your active quests.'),
                [{ text: 'OK', onPress: () => fetchAllQuests() }]
            );
        } catch (error: any) {
            console.error('Error accepting quest:', error);
            Alert.alert(
                t('error', 'Error'),
                error.response?.data?.error || t('failed_to_accept', 'Failed to accept quest')
            );
        } finally {
            setModalLoading(false);
        }
    };

    const onCompleteQuest = () => {
        if (activeQuest) {
            navigation.navigate('QuestDetails', { quest: activeQuest, mode: 'complete' });
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchAllQuests();
    };

    const renderActiveQuest = () => {
        if (!activeQuest) return null;

        return (
            <View style={styles.activeQuestContainer}>
                <View style={styles.activeQuestHeader}>
                    <Text style={styles.activeQuestTitle}>🎯 {t('active_quest', 'Active Quest')}</Text>
                    <TouchableOpacity style={styles.completeButton} onPress={onCompleteQuest}>
                        <Text style={styles.completeButtonText}>{t('complete', 'Complete')}</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.activeQuestName}>{activeQuest.title}</Text>
                <Text style={styles.activeQuestReward}>${activeQuest.reward}</Text>
                <Text style={styles.activeQuestLocation}>📍 {activeQuest.city}, {activeQuest.district}</Text>
            </View>
        );
    };

    const renderQuest = ({ item }: { item: Quest }) => (
        <View style={styles.questCard}>
            <View style={styles.questHeader}>
                <Text style={styles.questTitle}>{item.title}</Text>
                <Text style={styles.questReward}>${item.reward}</Text>
            </View>
            
            <Text style={styles.questDescription} numberOfLines={2}>{item.description}</Text>
            
            <View style={styles.questDetails}>
                <Text style={styles.questDetail}>📍 {item.city}, {item.district}</Text>
                {item.location && <Text style={styles.questDetail}>🏠 {item.location}</Text>}
            </View>
            
            <TouchableOpacity 
                style={[styles.takeButton, takingId === item.id && styles.buttonDisabled]} 
                disabled={takingId === item.id || !!activeQuest}
                onPress={() => handleTakeQuest(item.id)}
            >
                <Text style={styles.takeButtonText}>
                    {takingId === item.id 
                        ? t('loading', 'Loading...') 
                        : activeQuest 
                            ? t('has_active', 'Complete active first')
                            : t('get_order', 'Get order')}
                </Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>{t('loading_quests', 'Loading quests...')}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
            {renderActiveQuest()}
            
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📦 {t('available_quests', 'Available Quests')}</Text>
                <Text style={styles.questCount}>{availableQuests.length} {t('quests', 'quests')}</Text>
            </View>

            {availableQuests.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>🎒</Text>
                    <Text style={styles.emptyTitle}>{t('no_quests', 'No quests available')}</Text>
                    <Text style={styles.emptyDescription}>
                        {t('check_back_later', 'Check back later for new delivery opportunities')}
                    </Text>
                </View>
            ) : (
                <View style={styles.listContainer}>
                    {availableQuests.map((quest) => (
                        <View key={quest.id}>{renderQuest({ item: quest })}</View>
                    ))}
                </View>
            )}

            {/* МОДАЛЬ ДЛЯ ПРИЙНЯТТЯ ЗАВДАННЯ */}
            {selectedQuest && (
                <TaskAcceptModal 
                    visible={modalVisible}
                    quest={selectedQuest}
                    onAccept={handleConfirmAccept}
                    onCancel={() => {
                        setModalVisible(false);
                        setSelectedQuest(null);
                    }}
                    loading={modalLoading}
                />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        minHeight: 300,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    activeQuestContainer: {
        backgroundColor: '#4CAF50',
        padding: 16,
        margin: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    activeQuestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    activeQuestTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    activeQuestName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    activeQuestReward: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    activeQuestLocation: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    completeButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    completeButtonText: {
        color: '#4CAF50',
        fontSize: 14,
        fontWeight: '700',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    questCount: {
        fontSize: 14,
        color: '#8E8E93',
    },
    questCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    questHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    questTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
        flex: 1,
    },
    questReward: {
        fontSize: 20,
        fontWeight: '700',
        color: '#34C759',
        marginLeft: 8,
    },
    questDescription: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 12,
        lineHeight: 20,
    },
    questDetails: {
        marginBottom: 12,
    },
    questDetail: {
        fontSize: 13,
        color: '#007AFF',
        marginBottom: 4,
    },
    takeButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#8E8E93',
    },
    takeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#8E8E93',
    },
    emptyText: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 8,
    },
    emptyDescription: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
    },
});
