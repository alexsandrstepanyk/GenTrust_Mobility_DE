import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Alert, SafeAreaView, TextInput, TouchableOpacity, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config';

export default function QuestDetailsScreen({ route, navigation }: any) {
    const { quest: initialQuest, pickupCode: paramPickupCode, deliveryCode: paramDeliveryCode } = route.params || {};
    const [quest, setQuest] = useState(initialQuest);
    const [pickupCode, setPickupCode] = useState(paramPickupCode);
    const [deliveryCode, setDeliveryCode] = useState(paramDeliveryCode);
    const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [pickupConfirmed, setPickupConfirmed] = useState(false);
    const [pickupInput, setPickupInput] = useState('');
    const [deliveryInput, setDeliveryInput] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const address = useMemo(() => [quest?.location, quest?.district, quest?.city].filter(Boolean).join(', '), [quest]);

    // Завантажуємо коди з сервера, якщо їх немає в параметрах
    useEffect(() => {
        const loadQuestCodes = async () => {
            if (pickupCode && deliveryCode) return; // Вже є коди
            
            try {
                const token = await SecureStore.getItemAsync('userToken');
                if (!token || !quest?.id) return;

                const response = await axios.get(`${API_URL}/users/active-quest`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data && response.data.id === quest.id) {
                    setPickupCode(response.data.pickupCode);
                    setDeliveryCode(response.data.deliveryCode);
                    setQuest(response.data);
                }
            } catch (error) {
                console.error('Error loading quest codes:', error);
            }
        };

        loadQuestCodes();
    }, [quest?.id]);

    useEffect(() => {
        const resolveLocation = async () => {
            try {
                if (!address) {
                    setLoading(false);
                    return;
                }

                const results = await Location.geocodeAsync(address);
                if (results && results.length > 0) {
                    setCoords({ latitude: results[0].latitude, longitude: results[0].longitude });
                }
            } catch (e) {
                Alert.alert('Error', 'Failed to resolve address on map.');
            } finally {
                setLoading(false);
            }
        };

        resolveLocation();
    }, [quest]);

    const openNavigation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Location required', 'Please enable location to build a route.');
                return;
            }

            const current = await Location.getCurrentPositionAsync({});
            const origin = `${current.coords.latitude},${current.coords.longitude}`;
            const destination = coords ? `${coords.latitude},${coords.longitude}` : address;
            const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=walking`;
            await Linking.openURL(url);
        } catch (e) {
            Alert.alert('Error', 'Failed to open navigation.');
        }
    };

    const confirmPickup = () => {
        if (!pickupCode) {
            setPickupConfirmed(true);
            return;
        }
        if (pickupInput.trim() !== pickupCode) {
            Alert.alert('Invalid code', 'Pickup code is incorrect.');
            return;
        }
        setPickupConfirmed(true);
        Alert.alert('Pickup confirmed', 'You can now deliver the package.');
    };

    const completeDelivery = async () => {
        try {
            if (!deliveryCode) {
                Alert.alert('No delivery code', 'This quest does not require a delivery code.');
                return;
            }

            if (deliveryInput.trim() !== deliveryCode) {
                Alert.alert('Invalid code', 'Delivery code is incorrect. Please try again.');
                return;
            }

            setSubmitting(true);
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                Alert.alert('Login required', 'Please login to complete quest.');
                setSubmitting(false);
                return;
            }

            // Запит дозволу на локацію
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Локація потрібна', 'Будь ласка, надайте доступ до локації для підтвердження виконання завдання.');
                setSubmitting(false);
                return;
            }

            // Отримання поточної локації
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const codeToSend = deliveryInput.trim();
            const res = await axios.post(`${API_URL}/quests/${quest?.id}/complete`, {
                code: codeToSend,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('Виконано', res.data?.message || 'Квест успішно виконано!');
            navigation.goBack();
        } catch (e: any) {
            const msg = e?.response?.data?.error || 'Не вдалося завершити квест.';
            Alert.alert('Помилка', msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <Text style={styles.title}>{quest?.title || 'Quest'}</Text>
                <Text style={styles.subtitle}>{quest?.description || 'No description provided.'}</Text>

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>📍 {address || 'No address provided'}</Text>
                    {!!pickupCode && <Text style={styles.infoText}>🔐 Pickup code: {pickupCode}</Text>}
                    {!!deliveryCode && <Text style={styles.infoText}>✅ Delivery code: {deliveryCode}</Text>}
                </View>

                <TouchableOpacity style={styles.navButton} onPress={openNavigation}>
                    <Text style={styles.navButtonText}>Open navigation</Text>
                </TouchableOpacity>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Confirm pickup</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter pickup code"
                        value={pickupInput}
                        onChangeText={setPickupInput}
                    />
                    <TouchableOpacity style={styles.actionButton} onPress={confirmPickup}>
                        <Text style={styles.actionButtonText}>Confirm pickup</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Complete delivery</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter delivery code"
                        value={deliveryInput}
                        onChangeText={setDeliveryInput}
                    />
                    <TouchableOpacity style={[styles.actionButton, !pickupConfirmed && styles.disabled]} disabled={!pickupConfirmed || submitting} onPress={completeDelivery}>
                        <Text style={styles.actionButtonText}>{submitting ? 'Submitting...' : 'Complete delivery'}</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loading}>
                        <ActivityIndicator size="large" color="#007AFF" />
                    </View>
                ) : coords ? (
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: coords.latitude,
                            longitude: coords.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01
                        }}
                    >
                        <Marker coordinate={coords} title={quest?.title || 'Pickup'} />
                    </MapView>
                ) : (
                    <View style={styles.loading}>
                        <Text style={styles.subtitle}>Map not available for this address.</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 16 },
    infoBox: {
        backgroundColor: '#F7F8FA',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16
    },
    infoText: { fontSize: 14, color: '#333', marginBottom: 6 },
    navButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16
    },
    navButtonText: { color: '#fff', fontWeight: '700' },
    section: { marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        padding: 10,
        marginBottom: 8
    },
    actionButton: {
        backgroundColor: '#34C759',
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center'
    },
    actionButtonText: { color: '#fff', fontWeight: '700' },
    disabled: { opacity: 0.5 },
    map: { flex: 1, borderRadius: 16 },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});