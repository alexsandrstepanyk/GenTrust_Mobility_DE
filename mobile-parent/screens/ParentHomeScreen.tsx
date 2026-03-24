import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
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
    grade: string;
    school: string;
    balance: number;
    dignityScore: number;
    status: string;
}

export default function ParentHomeScreen({ navigation }: any) {
    const { t } = useTranslation();
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchChildren();
    }, []);

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
                setSelectedChildId((prev) => prev || approvedChildren[0].id);
            }
        } catch (error: any) {
            console.error('Error fetching children:', error);
            Alert.alert(t('error'), t('failed_to_load_children'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchChildren();
    };

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('userToken');
        navigation.replace('Login');
    };

    const selectedChild = children.find((child) => child.id === selectedChildId) || null;

    const openTracking = () => {
        if (!selectedChildId) return Alert.alert(t('select_child'), t('select_child_first'));
        navigation.navigate('ChildTracking', { childId: selectedChildId });
    };

    const renderChild = ({ item }: { item: Child }) => {
        const isSelected = selectedChildId === item.id;
        
        return (
            <TouchableOpacity
                style={[styles.childCard, isSelected && styles.childCardActive]}
                onPress={() => setSelectedChildId(item.id)}
                activeOpacity={0.8}
            >
                <View style={styles.childHeader}>
                    <View style={styles.childInfo}>
                        <View style={styles.avatarSmall}>
                            <Text style={styles.avatarSmallText}>
                                {item.firstName?.charAt(0) || ''}{item.lastName?.charAt(0) || ''}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.childName}>{item.firstName} {item.lastName}</Text>
                            <Text style={styles.childGrade}>{item.school} · {item.grade}</Text>
                        </View>
                    </View>
                    {isSelected && (
                        <View style={styles.checkmark}>
                            <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                    )}
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>{t('balance')}</Text>
                        <Text style={styles.statValue}>💰 {item.balance.toFixed(2)}€</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>{t('dignity')}</Text>
                        <Text style={styles.statValue}>⭐ {item.dignityScore}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.trackButton}
                    onPress={openTracking}
                >
                    <Text style={styles.trackButtonText}>📍 {t('track')}</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#3B82F6', '#7C3AED']} style={styles.headerCard}>
                <View style={styles.headerTopRow}>
                    <Text style={styles.headerTitle}>👨‍👩‍👧 {t('my_children')}</Text>
                    <TouchableOpacity onPress={handleLogout}>
                        <Text style={styles.logoutButton}>{t('logout')}</Text>
                    </TouchableOpacity>
                </View>
                {selectedChild && (
                    <>
                        <Text style={styles.selectedLabel}>{t('active_child')}</Text>
                        <Text style={styles.selectedChildName}>
                            {selectedChild.firstName} {selectedChild.lastName}
                        </Text>
                    </>
                )}
            </LinearGradient>

            {children.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>👨‍👩‍👧</Text>
                    <Text style={styles.emptyText}>{t('no_children_linked')}</Text>
                    <Text style={styles.emptySubtext}>{t('ask_child_to_enter_code')}</Text>
                </View>
            ) : (
                <FlatList
                    data={children}
                    renderItem={renderChild}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
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
    headerCard: {
        margin: 16,
        marginBottom: 8,
        borderRadius: 20,
        padding: 20,
        paddingTop: 16,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
    },
    selectedLabel: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 13,
        marginBottom: 4,
    },
    selectedChildName: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '700',
    },
    logoutButton: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    listContent: {
        padding: 16,
        paddingTop: 8,
        paddingBottom: 20,
    },
    childCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 18,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    childCardActive: {
        borderColor: '#3B82F6',
        shadowOpacity: 0.15,
    },
    childHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    childInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarSmall: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarSmallText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#3730A3',
    },
    childName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 2,
    },
    childGrade: {
        fontSize: 13,
        color: '#6B7280',
    },
    checkmark: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmarkText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        padding: 4,
        marginBottom: 12,
    },
    statBox: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#E5E7EB',
    },
    statLabel: {
        fontSize: 11,
        color: '#6B7280',
        marginBottom: 4,
        fontWeight: '600',
    },
    statValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },
    trackButton: {
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: 'center',
    },
    trackButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2563EB',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        fontSize: 72,
        marginBottom: 20,
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
