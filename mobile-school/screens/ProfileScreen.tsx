import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Modal, FlatList, Switch, TextInput, Alert, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
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

export default function ProfileScreen({ navigation }: any) {
    const { t, i18n } = useTranslation();
    const [modalVisible, setModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
    const [gpsEnabled, setGpsEnabled] = useState(true);
    
    const [user, setUser] = useState<any>({
        firstName: 'Loading',
        lastName: '...',
        email: '',
        role: 'SCOUT',
        dignityScore: 0,
        balance: 0,
        phone: '',
        address: '',
        birthDate: '',
        school: '',
        grade: ''
    });

    const [editForm, setEditForm] = useState({
        phone: '',
        address: '',
        birthDate: '',
        school: '',
        grade: ''
    });

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) return;

            const response = await axios.get(`${API_URL}/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setUser(response.data);
            setEditForm({
                phone: response.data.phone || '',
                address: response.data.address || '',
                birthDate: response.data.birthDate || '',
                school: response.data.school || '',
                grade: response.data.grade || ''
            });
            setGpsEnabled(response.data.gpsSharing !== false);
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    };

    const saveProfile = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) return;

            await axios.patch(`${API_URL}/users/me`, editForm, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert(t('success'), t('profile_updated'));
            setEditModalVisible(false);
            loadUserProfile();
        } catch (error) {
            Alert.alert(t('error'), t('failed_to_update_profile'));
        }
    };

    const toggleGPS = async (value: boolean) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) return;

            await axios.patch(`${API_URL}/users/me`, { gpsSharing: value }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setGpsEnabled(value);
            Alert.alert(
                t('gps_sharing'), 
                value ? t('gps_enabled_for_parents') : t('gps_disabled_for_parents')
            );
        } catch (error) {
            Alert.alert(t('error'), t('failed_to_update_gps'));
        }
    };

    const changeLanguage = (code: string) => {
        i18n.changeLanguage(code);
        setModalVisible(false);
    };

    const currentLanguage = languages.find(l => i18n.language?.startsWith(l.code)) || languages[0];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarEmoji}>👤</Text>
                    </View>
                    <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
                    <Text style={styles.userRole}>{user.role}</Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>{t('dignity_score')}</Text>
                        <Text style={styles.statNumber}>{user.dignityScore}</Text>
                    </View>
                    <View style={[styles.statBox, styles.statBorder]}>
                        <Text style={styles.statLabel}>{t('balance')}</Text>
                        <Text style={styles.statNumber}>€{user.balance}</Text>
                    </View>
                </View>

                {/* Contact Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('contact_information')}</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>📧 Email:</Text>
                            <Text style={styles.infoValue}>{user.email || '-'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>📱 {t('phone')}:</Text>
                            <Text style={styles.infoValue}>{user.phone || t('not_specified')}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>🏠 {t('address')}:</Text>
                            <Text style={styles.infoValue}>{user.address || t('not_specified')}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>🎂 {t('birth_date')}:</Text>
                            <Text style={styles.infoValue}>{user.birthDate || t('not_specified')}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>🏫 {t('school')}:</Text>
                            <Text style={styles.infoValue}>{user.school || t('not_specified')}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>📚 {t('grade')}:</Text>
                            <Text style={styles.infoValue}>{user.grade || t('not_specified')}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('settings')}</Text>
                    
                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={() => setEditModalVisible(true)}
                    >
                        <Text style={styles.menuItemText}>{t('edit_profile')}</Text>
                        <Text style={styles.menuItemIcon}>›</Text>
                    </TouchableOpacity>
                    
                    {/* GPS Sharing Toggle */}
                    <View style={styles.menuItem}>
                        <View style={styles.menuItemLeft}>
                            <Text style={styles.menuItemText}>📍 {t('gps_sharing_for_parents')}</Text>
                            <Text style={styles.menuItemSubtext}>{t('allow_parents_track_location')}</Text>
                        </View>
                        <Switch
                            value={gpsEnabled}
                            onValueChange={toggleGPS}
                            trackColor={{ false: '#ccc', true: '#34C759' }}
                            thumbColor="#fff"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => setModalVisible(true)}
                    >
                        <View style={styles.menuItemLeft}>
                            <Text style={styles.menuItemText}>{t('language')}</Text>
                            <Text style={styles.currentLangText}>{currentLanguage.flag} {currentLanguage.label}</Text>
                        </View>
                        <Text style={styles.menuItemIcon}>›</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={() => setPrivacyModalVisible(true)}
                    >
                        <Text style={styles.menuItemText}>🔒 {t('privacy_policy')}</Text>
                        <Text style={styles.menuItemIcon}>›</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => navigation.replace('Login')}
                >
                    <Text style={styles.logoutText}>{t('logout')}</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Language Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
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
                                        i18n.language === item.code && styles.langItemActive
                                    ]}
                                    onPress={() => changeLanguage(item.code)}
                                >
                                    <Text style={styles.langFlag}>{item.flag}</Text>
                                    <Text style={[
                                        styles.langLabel,
                                        i18n.language === item.code && styles.langLabelActive
                                    ]}>{item.label}</Text>
                                    {i18n.language === item.code && <Text style={styles.checkIcon}>✓</Text>}
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>{t('close')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Edit Profile Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('edit_profile')}</Text>
                        <ScrollView style={styles.editForm}>
                            <Text style={styles.inputLabel}>{t('phone')}</Text>
                            <TextInput
                                style={styles.input}
                                value={editForm.phone}
                                onChangeText={(v) => setEditForm({ ...editForm, phone: v })}
                                placeholder="+49..."
                                keyboardType="phone-pad"
                            />
                            
                            <Text style={styles.inputLabel}>{t('address')}</Text>
                            <TextInput
                                style={styles.input}
                                value={editForm.address}
                                onChangeText={(v) => setEditForm({ ...editForm, address: v })}
                                placeholder="Straße, Stadt..."
                            />
                            
                            <Text style={styles.inputLabel}>{t('birth_date')}</Text>
                            <TextInput
                                style={styles.input}
                                value={editForm.birthDate}
                                onChangeText={(v) => setEditForm({ ...editForm, birthDate: v })}
                                placeholder="DD.MM.YYYY"
                            />
                            
                            <Text style={styles.inputLabel}>{t('school')}</Text>
                            <TextInput
                                style={styles.input}
                                value={editForm.school}
                                onChangeText={(v) => setEditForm({ ...editForm, school: v })}
                                placeholder={t('school_name')}
                            />
                            
                            <Text style={styles.inputLabel}>{t('grade')}</Text>
                            <TextInput
                                style={styles.input}
                                value={editForm.grade}
                                onChangeText={(v) => setEditForm({ ...editForm, grade: v })}
                                placeholder="5A, 10B..."
                            />
                            
                            <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
                                <Text style={styles.saveButtonText}>{t('save')}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setEditModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>{t('cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Privacy Policy Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={privacyModalVisible}
                onRequestClose={() => setPrivacyModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('privacy_policy')}</Text>
                        <ScrollView style={styles.privacyContent}>
                            <Text style={styles.privacyText}>
                                <Text style={styles.privacyBold}>GenTrust Mobility</Text> зобов'язується захищати вашу конфіденційність.
                                {'\n\n'}
                                <Text style={styles.privacyBold}>Збір даних:</Text>{'\n'}
                                • Контактна інформація (ім'я, email, телефон){'\n'}
                                • Дані про виконані завдання{'\n'}
                                • GPS локація (за вашою згодою){'\n'}
                                {'\n'}
                                <Text style={styles.privacyBold}>Використання:</Text>{'\n'}
                                • Координація міських завдань{'\n'}
                                • Безпека дітей (доступ для батьків){'\n'}
                                • Винагороди за виконання{'\n'}
                                {'\n'}
                                <Text style={styles.privacyBold}>Доступ:</Text>{'\n'}
                                • Батьки (за налаштуваннями){'\n'}
                                • Міська рада (анонімізовано){'\n'}
                                • Адміністратори системи{'\n'}
                                {'\n'}
                                <Text style={styles.privacyBold}>Ваші права:</Text>{'\n'}
                                • Право на видалення даних{'\n'}
                                • Право змінити налаштування конфіденційності{'\n'}
                                • Право заблокувати GPS-трекінг{'\n'}
                                {'\n'}
                                Контакт: privacy@gentrust-mobility.de
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
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#eee',
    },
    avatarEmoji: {
        fontSize: 50,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    userRole: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 32,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statBorder: {
        borderLeftWidth: 1,
        borderLeftColor: '#eee',
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#888',
        marginBottom: 16,
        marginLeft: 4,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    menuItemLeft: {
        flex: 1,
    },
    menuItemText: {
        fontSize: 16,
        color: '#1a1a1a',
        fontWeight: '500',
    },
    currentLangText: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    menuItemIcon: {
        fontSize: 20,
        color: '#ccc',
    },
    logoutButton: {
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ff3b30',
        marginTop: 8,
    },
    logoutText: {
        color: '#ff3b30',
        fontSize: 16,
        fontWeight: 'bold',
    },
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
    },
    closeButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        color: '#1a1a1a',
        fontWeight: '500',
        flex: 2,
        textAlign: 'right',
    },
    menuItemSubtext: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    editForm: {
        maxHeight: 400,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginTop: 12,
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    saveButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    privacyContent: {
        maxHeight: 400,
    },
    privacyText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#333',
    },
    privacyBold: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#007AFF',
    },
});
