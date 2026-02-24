import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, SafeAreaView, Modal, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

import { API_URL } from '../config';

const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'uk', label: 'Українська', flag: '🇺🇦' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

export default function RegisterScreen({ navigation }: any) {
    const { t, i18n } = useTranslation();
    const [step, setStep] = useState(1);
    const [modalVisible, setModalVisible] = useState(false);

    const [form, setForm] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        birthDate: '',
        school: '',
        grade: '',
        city: '',
        district: '',
        language: (i18n.language || 'uk').split('-')[0],
        country: 'DE',
    });

    const handleRegister = async () => {
        if (!form.email || !form.password || !form.firstName || !form.lastName) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            console.log('Registering user with data:', form);
            await axios.post(`${API_URL}/auth/register`, form);
            Alert.alert(t('success'), 'Registration complete! Welcome to GenTrust.');
            navigation.navigate('Login');
        } catch (error: any) {
            console.error('Registration error:', error.response?.data || error.message);
            Alert.alert('Error', error.response?.data?.error || 'Registration failed');
        }
    };

    const selectLanguage = (code: string) => {
        const baseCode = code.split('-')[0];
        setForm({ ...form, language: baseCode });
        i18n.changeLanguage(baseCode);
        setModalVisible(false);
    };

    const currentLanguage = languages.find(l => l.code === form.language) || languages[0];

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <View style={styles.fadeContainer}>
                        <Text style={styles.sectionLabel}>{t('select_language')}</Text>
                        <TouchableOpacity style={styles.dropdown} onPress={() => setModalVisible(true)}>
                            <View style={styles.dropdownContent}>
                                <Text style={styles.dropdownFlag}>{currentLanguage.flag}</Text>
                                <Text style={styles.dropdownLabel}>{currentLanguage.label}</Text>
                            </View>
                            <Text style={styles.dropdownArrow}>▼</Text>
                        </TouchableOpacity>

                        <Text style={styles.sectionLabel}>{t('location_details')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('city')}
                            value={form.city}
                            onChangeText={(v) => setForm({ ...form, city: v })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder={t('district')}
                            value={form.district}
                            onChangeText={(v) => setForm({ ...form, district: v })}
                        />

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.backButtonText}>{t('back')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.mainButton, styles.flex, (!form.city || !form.district) && styles.disabledButton]}
                                onPress={() => setStep(2)}
                                disabled={!form.city || !form.district}
                            >
                                <LinearGradient colors={['#007AFF', '#0055BB']} style={styles.gradient}>
                                    <Text style={styles.buttonText}>{t('continue')}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 2:
                return (
                    <View style={styles.fadeContainer}>
                        <Text style={styles.sectionLabel}>{t('personal_details')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('first_name')}
                            value={form.firstName}
                            onChangeText={(v) => setForm({ ...form, firstName: v })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder={t('last_name')}
                            value={form.lastName}
                            onChangeText={(v) => setForm({ ...form, lastName: v })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder={t('birth_date')}
                            value={form.birthDate}
                            onChangeText={(v) => setForm({ ...form, birthDate: v })}
                        />

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
                                <Text style={styles.backButtonText}>{t('back')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.mainButton, styles.flex, (!form.firstName || !form.lastName) && styles.disabledButton]}
                                onPress={() => setStep(3)}
                                disabled={!form.firstName || !form.lastName}
                            >
                                <LinearGradient colors={['#007AFF', '#0055BB']} style={styles.gradient}>
                                    <Text style={styles.buttonText}>{t('continue')}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 3:
                return (
                    <View style={styles.fadeContainer}>
                        <Text style={styles.sectionLabel}>{t('education_account')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('school')}
                            value={form.school}
                            onChangeText={(v) => setForm({ ...form, school: v })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder={t('grade')}
                            value={form.grade}
                            onChangeText={(v) => setForm({ ...form, grade: v })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder={t('email')}
                            value={form.email}
                            onChangeText={(v) => setForm({ ...form, email: v })}
                            autoCapitalize="none"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder={t('password')}
                            secureTextEntry
                            value={form.password}
                            onChangeText={(v) => setForm({ ...form, password: v })}
                        />

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
                                <Text style={styles.backButtonText}>{t('back')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.mainButton, styles.flex, (!form.email || !form.password) && styles.disabledButton]}
                                onPress={handleRegister}
                                disabled={!form.email || !form.password}
                            >
                                <LinearGradient colors={['#34C759', '#28a745']} style={styles.gradient}>
                                    <Text style={styles.buttonText}>{t('register')}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.flex}
            >
                <LinearGradient colors={['#ffffff', '#f8f9fa']} style={styles.flex}>
                    <ScrollView contentContainerStyle={styles.container}>
                        <View style={styles.header}>
                            <Text style={styles.stepText}>{t('step', { current: step, total: 3 })}</Text>
                            <Text style={styles.title}>{t('register_title')}</Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressIndicator, { width: `${(step / 3) * 100}%` }]} />
                            </View>
                        </View>

                        {renderStep()}

                        <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.linkText}>{t('already_have_account')}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </LinearGradient>
            </KeyboardAvoidingView>

            <Modal animationType="slide" transparent={true} visible={modalVisible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('select_language')}</Text>
                        <FlatList
                            data={languages}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.langItem, form.language === item.code && styles.langItemActive]}
                                    onPress={() => selectLanguage(item.code)}
                                >
                                    <Text style={styles.langFlag}>{item.flag}</Text>
                                    <Text style={[styles.langLabel, form.language === item.code && styles.langLabelActive]}>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeModalText}>{t('close')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    flex: { flex: 1 },
    container: { padding: 24, paddingBottom: 50 },
    header: { marginBottom: 32 },
    stepText: { fontSize: 14, color: '#007AFF', fontWeight: 'bold' },
    title: { fontSize: 28, fontWeight: '800', color: '#1a1a1a', marginTop: 8 },
    progressBar: { height: 4, backgroundColor: '#eee', borderRadius: 2, marginTop: 16 },
    progressIndicator: { height: 4, backgroundColor: '#007AFF', borderRadius: 2 },
    sectionLabel: { fontSize: 14, fontWeight: '600', color: '#888', marginBottom: 16, marginTop: 8 },
    fadeContainer: { flex: 1 },
    dropdown: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#fff', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#eee',
        marginBottom: 24, elevation: 2,
    },
    dropdownContent: { flexDirection: 'row', alignItems: 'center' },
    dropdownFlag: { fontSize: 24, marginRight: 12 },
    dropdownLabel: { fontSize: 16, color: '#1a1a1a', fontWeight: '600' },
    dropdownArrow: { fontSize: 12, color: '#aaa' },
    input: {
        height: 60, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee',
        borderRadius: 16, paddingHorizontal: 20, marginBottom: 16, fontSize: 16, color: '#1a1a1a',
    },
    mainButton: { borderRadius: 16, overflow: 'hidden' },
    disabledButton: { opacity: 0.5 },
    gradient: { padding: 18, alignItems: 'center', borderRadius: 16 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    buttonRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
    backButton: {
        padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#eee',
        backgroundColor: '#fff', minWidth: 100, alignItems: 'center'
    },
    backButtonText: { color: '#666', fontSize: 16, fontWeight: '700' },
    loginLink: { marginTop: 32, alignItems: 'center' },
    linkText: { color: '#007AFF', fontSize: 15, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '70%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    langItem: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 16, marginBottom: 8 },
    langItemActive: { backgroundColor: '#F2F8FF' },
    langFlag: { fontSize: 28, marginRight: 16 },
    langLabel: { fontSize: 17, color: '#333', flex: 1 },
    langLabelActive: { color: '#007AFF', fontWeight: 'bold' },
    closeModalButton: { marginTop: 12, padding: 16, alignItems: 'center' },
    closeModalText: { color: '#888', fontSize: 16, fontWeight: '600' },
});
