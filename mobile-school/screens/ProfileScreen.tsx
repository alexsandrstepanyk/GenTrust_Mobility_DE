import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';

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

    const user = {
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin',
        role: 'ADMIN',
        dignityScore: 122,
        balance: 45.50
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

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('settings')}</Text>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuItemText}>{t('edit_profile')}</Text>
                        <Text style={styles.menuItemIcon}>›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuItemText}>{t('notifications')}</Text>
                        <Text style={styles.menuItemIcon}>›</Text>
                    </TouchableOpacity>
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
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => navigation.replace('Login')}
                >
                    <Text style={styles.logoutText}>{t('logout')}</Text>
                </TouchableOpacity>
            </ScrollView>

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
});
