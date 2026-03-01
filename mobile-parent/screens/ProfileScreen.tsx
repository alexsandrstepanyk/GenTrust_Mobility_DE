import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
    Modal,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config';

const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'uk', label: 'Українська', flag: '🇺🇦' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    balance: number;
    dignityScore: number;
}

interface Child {
    id: string;
    firstName: string;
    lastName: string;
    balance: number;
    dignityScore: number;
}

export default function ProfileScreen({ navigation }: any) {
    const { t, i18n } = useTranslation();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
    const currentLanguage = languages.find(l => i18n.language?.startsWith(l.code)) || languages[1];

    useEffect(() => {
        fetchData();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [])
    );

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = await SecureStore.getItemAsync('userToken');
            
            if (!token) {
                navigation.replace('Login');
                return;
            }

            // Отримуємо дані профілю з SecureStore
            const userDataStr = await SecureStore.getItemAsync('userData');
            if (userDataStr) {
                try {
                    const userData = JSON.parse(userDataStr);
                    setProfile({
                        id: userData.id || '',
                        firstName: userData.firstName || '',
                        lastName: userData.lastName || '',
                        email: userData.email || '',
                        role: userData.role || 'PARENT',
                        balance: userData.balance || 0,
                        dignityScore: userData.dignityScore || 0,
                    });
                } catch (parseErr) {
                    console.error('Error parsing userData:', parseErr);
                }
            }

            // Отримуємо дітей
            try {
                const childrenRes = await axios.get(`${API_URL}/parents/children`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                if (Array.isArray(childrenRes.data)) {
                    const approvedChildren = childrenRes.data
                        .filter((rel: any) => rel.status === 'APPROVED')
                        .map((rel: any) => rel.child);
                    setChildren(approvedChildren);
                }
            } catch (childErr) {
                console.log('Children endpoint error:', childErr);
                setChildren([]);
            }
        } catch (err) {
            setError('Помилка завантаження даних');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            t('logout_confirm_title'),
            t('logout_confirm_msg'),
            [
                { text: t('cancel'), onPress: () => {} },
                {
                    text: t('logout'),
                    onPress: async () => {
                        await SecureStore.deleteItemAsync('userToken');
                        await SecureStore.deleteItemAsync('userData');
                        navigation.replace('Login');
                    },
                },
            ]
        );
    };

    const changeLanguage = (lang: typeof languages[0]) => {
        i18n.changeLanguage(lang.code);
        setLanguageModalVisible(false);
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>{t('profile_loading')}</Text>
            </View>
        );
    }

    if (error && !profile) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
                    <Text style={styles.retryButtonText}>🔄 {t('retry')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                style={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
            >
                
                {/* ===== SECTION 1: CHILDREN RATING ===== */}
                <LinearGradient 
                    colors={['#667eea', '#764ba2']} 
                    start={{ x: 0, y: 0 }} 
                    end={{ x: 1, y: 1 }} 
                    style={styles.header}
                >
                    <Text style={styles.headerTitle}>⭐ {t('children_rating')}</Text>
                </LinearGradient>

                {children.length > 0 ? (
                    <View style={styles.childrenSection}>
                        {children.map((child, index) => (
                            <View key={child.id} style={[styles.childCard, index < children.length - 1 && styles.childCardMargin]}>
                                <View style={styles.childAvatarContainer}>
                                    <Text style={styles.childAvatar}>
                                        {child.firstName?.charAt(0) || ''}{child.lastName?.charAt(0) || ''}
                                    </Text>
                                </View>
                                <View style={styles.childInfo}>
                                    <Text style={styles.childName}>
                                        {child.firstName} {child.lastName}
                                    </Text>
                                    <View style={styles.childStats}>
                                        <Text style={styles.stat}>💰 {child.balance} EUR</Text>
                                        <Text style={styles.statSeparator}>•</Text>
                                        <Text style={styles.stat}>⭐ {child.dignityScore} {t('points')}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptySection}>
                        <Text style={styles.emptyText}>{t('no_children')}</Text>
                    </View>
                )}

                {/* ===== SECTION 2: PERSONAL DATA ===== */}
                <LinearGradient 
                    colors={['#f093fb', '#f5576c']} 
                    start={{ x: 0, y: 0 }} 
                    end={{ x: 1, y: 1 }} 
                    style={styles.header}
                >
                    <Text style={styles.headerTitle}>👤 {t('personal_data')}</Text>
                </LinearGradient>

                {profile ? (
                    <View style={styles.infoSection}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t('first_name')}</Text>
                            <Text style={styles.infoValue}>{profile.firstName || '-'}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t('last_name')}</Text>
                            <Text style={styles.infoValue}>{profile.lastName || '-'}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t('email')}</Text>
                            <Text style={styles.infoValue}>{profile.email || '-'}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t('role')}</Text>
                            <Text style={styles.infoValue}>
                                {profile.role === 'PARENT' ? `👨‍👩‍👧 ${t('parent_role')}` : profile.role}
                            </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t('balance')}</Text>
                            <Text style={styles.infoValue}>💰 {profile.balance} EUR</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t('my_rating')}</Text>
                            <Text style={styles.infoValue}>⭐ {profile.dignityScore}</Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.emptySection}>
                        <Text style={styles.emptyText}>{t('data_error')}</Text>
                    </View>
                )}

                <TouchableOpacity style={styles.editButton}>
                    <Text style={styles.editButtonText}>✏️ {t('edit_data')}</Text>
                </TouchableOpacity>

                {/* ===== SECTION 3: SETTINGS ===== */}
                <Text style={styles.sectionTitle}>⚙️ {t('settings_support')}</Text>

                <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                    <View style={styles.menuItemLeft}>
                        <Text style={styles.menuItemText}>🔔 {t('notifications')}</Text>
                        <Text style={styles.menuItemDesc}>{t('push_notifications')}</Text>
                    </View>
                    <Text style={styles.menuItemIcon}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.menuItem} 
                    activeOpacity={0.7}
                    onPress={() => setPrivacyModalVisible(true)}
                >
                    <View style={styles.menuItemLeft}>
                        <Text style={styles.menuItemText}>🔒 {t('privacy')}</Text>
                        <Text style={styles.menuItemDesc}>{t('privacy_policy')}</Text>
                    </View>
                    <Text style={styles.menuItemIcon}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.menuItem} 
                    activeOpacity={0.7}
                    onPress={() => setLanguageModalVisible(true)}
                >
                    <View style={styles.menuItemLeft}>
                        <Text style={styles.menuItemText}>🌐 {t('language')}</Text>
                        <Text style={styles.menuItemDesc}>{currentLanguage.flag} {currentLanguage.label}</Text>
                    </View>
                    <Text style={styles.menuItemIcon}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                    <View style={styles.menuItemLeft}>
                        <Text style={styles.menuItemText}>📍 {t('gps_location')}</Text>
                        <Text style={styles.menuItemDesc}>{t('location_permissions')}</Text>
                    </View>
                    <Text style={styles.menuItemIcon}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                    <View style={styles.menuItemLeft}>
                        <Text style={styles.menuItemText}>❓ {t('help')}</Text>
                        <Text style={styles.menuItemDesc}>{t('support_center')}</Text>
                    </View>
                    <Text style={styles.menuItemIcon}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                    <View style={styles.menuItemLeft}>
                        <Text style={styles.menuItemText}>ℹ️ {t('about_app')}</Text>
                        <Text style={styles.menuItemDesc}>{t('version')}</Text>
                    </View>
                    <Text style={styles.menuItemIcon}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.menuItem, styles.logoutButton]} 
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <View style={styles.menuItemLeft}>
                        <Text style={styles.logoutText}>🚪 {t('logout')}</Text>
                        <Text style={styles.logoutDesc}>{t('logout_from_account')}</Text>
                    </View>
                    <Text style={styles.menuItemIcon}>›</Text>
                </TouchableOpacity>

                <View style={styles.footer} />
            </ScrollView>

            {/* ===== LANGUAGE MODAL ===== */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={languageModalVisible}
                onRequestClose={() => setLanguageModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('select_language')}</Text>
                        <FlatList
                            data={languages}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.langItem,
                                        currentLanguage.code === item.code && styles.langItemActive
                                    ]}
                                    onPress={() => changeLanguage(item)}
                                >
                                    <Text style={styles.langFlag}>{item.flag}</Text>
                                    <Text style={[
                                        styles.langLabel,
                                        currentLanguage.code === item.code && styles.langLabelActive
                                    ]}>{item.label}</Text>
                                    {currentLanguage.code === item.code && <Text style={styles.checkIcon}>✓</Text>}
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setLanguageModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>{t('close')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ===== PRIVACY POLICY MODAL ===== */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={privacyModalVisible}
                onRequestClose={() => setPrivacyModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('privacy_title')}</Text>
                        <ScrollView style={styles.privacyScrollView}>
                            <Text style={styles.privacyText}>
                                {t('privacy_text')}
                                {'\n\n'}
                                {t('privacy_date')}
                            </Text>
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setPrivacyModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>{t('close')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        flex: 1,
    },
    scrollContainer: {
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    errorText: {
        fontSize: 16,
        color: '#E74C3C',
        marginBottom: 24,
        textAlign: 'center',
        paddingHorizontal: 24,
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
    },
    retryButtonText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '600',
    },
    // ===== HEADER SECTION =====
    header: {
        paddingVertical: 18,
        paddingHorizontal: 20,
        marginTop: 16,
        marginHorizontal: 12,
        marginBottom: 4,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
        letterSpacing: 0.5,
    },
    // ===== CHILDREN SECTION =====
    childrenSection: {
        marginHorizontal: 12,
        marginBottom: 20,
        backgroundColor: '#FFF',
        borderRadius: 14,
        overflow: 'hidden',
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    childCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    childCardMargin: {
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    childAvatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    childAvatar: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '700',
    },
    childInfo: {
        flex: 1,
    },
    childName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 6,
    },
    childStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stat: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    statSeparator: {
        fontSize: 13,
        color: '#D0D0D0',
        marginHorizontal: 8,
    },
    // ===== INFO SECTION =====
    infoSection: {
        marginHorizontal: 12,
        marginBottom: 16,
        backgroundColor: '#FFF',
        borderRadius: 14,
        paddingVertical: 4,
        paddingHorizontal: 0,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    infoLabel: {
        fontSize: 15,
        color: '#666',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginHorizontal: 16,
    },
    editButton: {
        marginHorizontal: 12,
        marginBottom: 20,
        paddingVertical: 14,
        backgroundColor: '#007AFF',
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    editButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    // ===== SETTINGS SECTION =====
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#888',
        marginBottom: 16,
        marginLeft: 16,
        marginTop: 20,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        marginHorizontal: 12,
    },
    menuItemLeft: {
        flex: 1,
    },
    menuItemText: {
        fontSize: 16,
        color: '#1a1a1a',
        fontWeight: '500',
    },
    menuItemDesc: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    menuItemIcon: {
        fontSize: 20,
        color: '#ccc',
    },
    logoutButton: {
        marginBottom: 32,
    },
    logoutText: {
        color: '#ff3b30',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutDesc: {
        fontSize: 12,
        color: '#ff3b30',
        marginTop: 2,
        opacity: 0.7,
    },
    // ===== EMPTY STATE =====
    emptySection: {
        marginHorizontal: 12,
        marginBottom: 20,
        backgroundColor: '#FFF',
        borderRadius: 14,
        paddingVertical: 32,
        paddingHorizontal: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 15,
        fontWeight: '500',
    },
    // ===== FOOTER =====
    footer: {
        height: 32,
    },
    // ===== MODAL STYLES =====
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#1a1a1a',
    },
    langItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 8,
    },
    langItemActive: {
        backgroundColor: '#F2F8FF',
    },
    langFlag: {
        fontSize: 24,
        marginRight: 16,
    },
    langLabel: {
        fontSize: 16,
        flex: 1,
        color: '#333',
    },
    langLabelActive: {
        color: '#007AFF',
        fontWeight: 'bold',
    },
    checkIcon: {
        fontSize: 18,
        color: '#007AFF',
    },
    closeButton: {
        marginTop: 16,
        padding: 16,
        alignItems: 'center',
        backgroundColor: '#007AFF',
        borderRadius: 12,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    privacyScrollView: {
        maxHeight: 400,
    },
    privacyText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#333',
    },
    privacyHeading: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#1a1a1a',
        marginTop: 8,
    },
});
