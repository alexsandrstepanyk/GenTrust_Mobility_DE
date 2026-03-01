import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, ScrollView, TextInput, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system/legacy';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';

import { API_URL } from '../config';

export default function ReportScreen() {
    const { t } = useTranslation();
    const [image, setImage] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [category, setCategory] = useState<string | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);
    const [loadingLocation, setLoadingLocation] = useState(false);
    
    const categories = [
        { key: 'Roads', label: '🛣️ Дороги', icon: '🛣️' },
        { key: 'Lighting', label: '💡 Освітлення', icon: '💡' },
        { key: 'Waste', label: '🗑️ Сміття', icon: '🗑️' },
        { key: 'Parks', label: '🌳 Парки', icon: '🌳' },
        { key: 'Vandalism', label: '🎨 Вандалізм', icon: '🎨' },
        { key: 'Water', label: '🚰 Вода', icon: '🚰' },
        { key: 'Vehicles', label: '🚗 Транспорт', icon: '🚗' },
        { key: 'Other', label: '❓ Інше', icon: '❓' }
    ];

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(t('permission_denied'), t('location_permission_msg'));
            }
        })();
    }, []);

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('permission_denied'), t('camera_permission_msg'));
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            // Автоматично аналізуємо фото
            await analyzePhoto(result.assets[0].uri);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            // Автоматично аналізуємо фото
            await analyzePhoto(result.assets[0].uri);
        }
    };
    
    const analyzePhoto = async (photoUri: string) => {
        setAnalyzing(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                Alert.alert(t('error'), 'Login required.');
                setAnalyzing(false);
                return;
            }

            // Convert image to base64
            const base64 = await FileSystem.readAsStringAsync(photoUri, {
                encoding: 'base64',
            });

            if (base64.length > 9_000_000) {
                Alert.alert(t('error'), 'Фото занадто велике');
                setAnalyzing(false);
                return;
            }

            // Send to AI analysis
            const response = await axios.post(`${API_URL}/reports/analyze`, {
                photoBase64: base64
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const analysis = response.data;
            setAiAnalysis(analysis);
            
            if (analysis.is_issue) {
                setCategory(analysis.category);
                Alert.alert(
                    '✅ Проблему розпізнано',
                    `Категорія: ${analysis.category}\nВпевненість: ${(analysis.confidence * 100).toFixed(1)}%\n\nМожете підтвердити або обрати іншу категорію.`,
                    [
                        { text: 'Підтвердити', onPress: () => setShowCategoryPicker(false) },
                        { text: 'Змінити', onPress: () => setShowCategoryPicker(true) }
                    ]
                );
            } else {
                Alert.alert(
                    '🤔 AI не впевнений',
                    'Будь ласка, оберіть категорію вручну.',
                    [{ text: 'OK', onPress: () => setShowCategoryPicker(true) }]
                );
            }
        } catch (error: any) {
            console.error('Analysis error:', error);
            Alert.alert('Помилка аналізу', 'Оберіть категорію вручну.');
            setShowCategoryPicker(true);
        } finally {
            setAnalyzing(false);
        }
    };

    const requestLocationAndShowMap = async () => {
        if (!category) {
            Alert.alert('Оберіть категорію', 'Спочатку оберіть категорію проблеми.');
            return;
        }

        setLoadingLocation(true);
        try {
            const permission = await Location.getForegroundPermissionsAsync();
            if (permission.status !== 'granted') {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Потрібна локація', 'Надайте доступ до локації для відправки звіту.');
                    setLoadingLocation(false);
                    return;
                }
            }
            
            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            setLocation(loc);
            setShowMapModal(true);
        } catch (error: any) {
            console.error('Location error:', error);
            Alert.alert('Помилка локації', 'Не вдалося отримати вашу локацію.');
        } finally {
            setLoadingLocation(false);
        }
    };

    const confirmLocation = () => {
        setShowMapModal(false);
        Alert.alert(
            '✅ Локація підтверджена',
            'Тепер можете надіслати звіт.',
            [{ text: 'OK' }]
        );
    };

    const handleSubmit = async () => {
        if (!image) {
            Alert.alert(t('error'), 'Будь ласка, додайте фото.');
            return;
        }
        
        if (!category) {
            Alert.alert('Оберіть категорію', 'Будь ласка, оберіть категорію проблеми.');
            return;
        }

        if (!location) {
            Alert.alert('Додайте геолокацію', 'Будь ласка, підтвердіть геолокацію на карті.');
            return;
        }

        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                Alert.alert(t('error'), 'Login required to submit report.');
                setLoading(false);
                return;
            }

            // Convert image to base64
            const base64 = await FileSystem.readAsStringAsync(image, {
                encoding: 'base64',
            });

            if (base64.length > 9_000_000) {
                Alert.alert(t('error'), 'Фото занадто велике');
                setLoading(false);
                return;
            }

            await axios.post(`${API_URL}/reports`, {
                photoBase64: base64,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                description: description,
                category: category,
                aiVerdict: aiAnalysis ? JSON.stringify(aiAnalysis) : null
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('Успіх! 🎉', 'Звіт успішно надіслано. Дякуємо за допомогу у покращенні міста!');
            // Reset form
            setImage(null);
            setDescription('');
            setCategory(null);
            setAiAnalysis(null);
            setShowCategoryPicker(false);
            setLocation(null);
        } catch (error: any) {
            const status = error?.response?.status;
            const serverMessage = error?.response?.data?.error;
            console.error('Report submission error:', error);
            if (status) {
                Alert.alert(t('error'), `Server error ${status}: ${serverMessage || t('failed_to_submit')}`);
            } else {
                Alert.alert(t('error'), t('failed_to_submit'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.title}>Urban Guardian 🏙️</Text>
                    <Text style={styles.subtitle}>Допоможіть покращити місто</Text>

                    <View style={styles.imageContainer}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.preview} />
                        ) : (
                            <View style={styles.placeholder}>
                                <Text style={styles.placeholderText}>📸</Text>
                            </View>
                        )}
                    </View>

                    {analyzing && (
                        <View style={styles.analyzingContainer}>
                            <ActivityIndicator size="large" color="#007AFF" />
                            <Text style={styles.analyzingText}>🔍 Аналізую фото...</Text>
                        </View>
                    )}

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
                            <Text style={styles.actionButtonText}>📸 Зробити фото</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
                            <Text style={styles.actionButtonText}>🖼️ Обрати з галереї</Text>
                        </TouchableOpacity>
                    </View>

                    {image && !analyzing && (
                        <>
                            <View style={styles.categorySection}>
                                <Text style={styles.sectionTitle}>Категорія проблеми</Text>
                                {category && !showCategoryPicker ? (
                                    <TouchableOpacity 
                                        style={styles.selectedCategory}
                                        onPress={() => setShowCategoryPicker(true)}
                                    >
                                        <Text style={styles.selectedCategoryText}>
                                            {categories.find(c => c.key === category)?.label || category}
                                        </Text>
                                        <Text style={styles.changeButton}>Змінити</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.categoryGrid}>
                                        {categories.map((cat) => (
                                            <TouchableOpacity
                                                key={cat.key}
                                                style={[
                                                    styles.categoryButton,
                                                    category === cat.key && styles.categoryButtonSelected
                                                ]}
                                                onPress={() => {
                                                    setCategory(cat.key);
                                                    setShowCategoryPicker(false);
                                                }}
                                            >
                                                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                                                <Text style={[
                                                    styles.categoryLabel,
                                                    category === cat.key && styles.categoryLabelSelected
                                                ]}>
                                                    {cat.label.replace(/^.+\s/, '')}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            <TextInput
                                style={styles.input}
                                placeholder="Додатковий опис (необов'язково)"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                            />

                            {/* Кнопка додавання геолокації */}
                            <TouchableOpacity
                                style={[styles.locationButton, location && styles.locationButtonConfirmed]}
                                onPress={requestLocationAndShowMap}
                                disabled={loadingLocation}
                            >
                                {loadingLocation ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Text style={styles.locationButtonText}>
                                            {location ? '✅ Геолокація підтверджена' : '📍 Додати геолокацію'}
                                        </Text>
                                        {location && (
                                            <Text style={styles.locationCoords}>
                                                {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                                            </Text>
                                        )}
                                    </>
                                )}
                            </TouchableOpacity>
                        </>
                    )}

                    {/* КНОПКА ЗАВЖДИ ВИДИМА */}
                    <TouchableOpacity
                        style={[styles.submitButton, (!image || !category || !location || loading || analyzing) && styles.disabled]}
                        onPress={handleSubmit}
                        disabled={!image || !category || !location || loading || analyzing}
                    >
                        <LinearGradient colors={['#007AFF', '#0055BB']} style={styles.gradient}>
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitText}>📍 Надіслати звіт</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Модальне вікно з картою */}
                    <Modal
                        visible={showMapModal}
                        animationType="slide"
                        transparent={false}
                        onRequestClose={() => setShowMapModal(false)}
                    >
                        <SafeAreaView style={styles.modalContainer}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Підтвердьте локацію</Text>
                                <TouchableOpacity onPress={() => setShowMapModal(false)}>
                                    <Text style={styles.closeButton}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            {location && (
                                <MapView
                                    style={styles.map}
                                    initialRegion={{
                                        latitude: location.coords.latitude,
                                        longitude: location.coords.longitude,
                                        latitudeDelta: 0.005,
                                        longitudeDelta: 0.005,
                                    }}
                                >
                                    <Marker
                                        coordinate={{
                                            latitude: location.coords.latitude,
                                            longitude: location.coords.longitude,
                                        }}
                                        title="Місце проблеми"
                                        description="Ваша поточна локація"
                                    />
                                </MapView>
                            )}

                            <View style={styles.modalFooter}>
                                <Text style={styles.questionText}>Чи вірна ця геолокація?</Text>
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={styles.confirmButton}
                                        onPress={confirmLocation}
                                    >
                                        <Text style={styles.confirmButtonText}>✅ Так, вірно</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.retryButton}
                                        onPress={() => {
                                            setShowMapModal(false);
                                            requestLocationAndShowMap();
                                        }}
                                    >
                                        <Text style={styles.retryButtonText}>🔄 Оновити</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </SafeAreaView>
                    </Modal>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    flex: { flex: 1 },
    container: { padding: 24, alignItems: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 32, textAlign: 'center' },
    imageContainer: {
        width: '100%',
        aspectRatio: 4 / 3,
        backgroundColor: '#f8f9fa',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#eee',
        marginBottom: 20
    },
    preview: { width: '100%', height: '100%' },
    placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    placeholderText: { fontSize: 60, opacity: 0.2 },
    analyzingContainer: {
        padding: 20,
        alignItems: 'center',
        gap: 12
    },
    analyzingText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600'
    },
    buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 24, width: '100%' },
    actionButton: {
        flex: 1,
        backgroundColor: '#f1f1f1',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center'
    },
    actionButtonText: { color: '#007AFF', fontWeight: '600' },
    categorySection: {
        width: '100%',
        marginBottom: 24
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 12
    },
    selectedCategory: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12
    },
    selectedCategoryText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600'
    },
    changeButton: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.8
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12
    },
    categoryButton: {
        width: '22%',
        aspectRatio: 1,
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#eee'
    },
    categoryButtonSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF'
    },
    categoryIcon: {
        fontSize: 28,
        marginBottom: 4
    },
    categoryLabel: {
        fontSize: 11,
        color: '#666',
        fontWeight: '600',
        textAlign: 'center'
    },
    categoryLabelSelected: {
        color: '#fff'
    },
    input: {
        width: '100%',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 16
    },
    locationButton: {
        width: '100%',
        backgroundColor: '#FF9500',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 32
    },
    locationButtonConfirmed: {
        backgroundColor: '#34C759'
    },
    locationButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    locationCoords: {
        color: '#fff',
        fontSize: 12,
        marginTop: 4,
        opacity: 0.9
    },
    submitButton: { width: '100%', borderRadius: 16, overflow: 'hidden' },
    gradient: { padding: 18, alignItems: 'center' },
    submitText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    disabled: { opacity: 0.5 },
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a'
    },
    closeButton: {
        fontSize: 28,
        color: '#666',
        fontWeight: '300'
    },
    map: {
        flex: 1
    },
    modalFooter: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee'
    },
    questionText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 16
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12
    },
    confirmButton: {
        flex: 1,
        backgroundColor: '#34C759',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center'
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    retryButton: {
        flex: 1,
        backgroundColor: '#f1f1f1',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center'
    },
    retryButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: 'bold'
    }
});
