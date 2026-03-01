import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config';

export default function ChildTrackingScreen({ route }: any) {
    const { childId } = route.params;
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [childName, setChildName] = useState('');

    useEffect(() => {
        fetchLocation();
        const interval = setInterval(fetchLocation, 5000); // Оновлюємо кожні 5 секунд
        return () => clearInterval(interval);
    }, []);

    const fetchLocation = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) return;

            const response = await axios.get(`${API_URL}/parents/child/${childId}/location`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.latitude && response.data.longitude) {
                setLocation({
                    latitude: response.data.latitude,
                    longitude: response.data.longitude
                });
            }
        } catch (error) {
            console.error('Error fetching location:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (!location) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <Text style={styles.noLocationText}>📍 Геолокація недоступна</Text>
                    <Text style={styles.noLocationSubtext}>Дитина не поділилася своєю локацією</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                <Marker
                    coordinate={location}
                    title="Дитина"
                    description={`Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)}`}
                    pinColor="#FF3B30"
                />
            </MapView>

            <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>📍 Поточна позиція</Text>
                <Text style={styles.infoText}>Широта: {location.latitude.toFixed(6)}</Text>
                <Text style={styles.infoText}>Довгота: {location.longitude.toFixed(6)}</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        flex: 1,
    },
    infoBox: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    noLocationText: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    noLocationSubtext: {
        fontSize: 14,
        color: '#666',
    },
});
