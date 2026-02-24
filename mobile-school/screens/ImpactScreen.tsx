import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function ImpactScreen({ navigation }: any) {
    const { t } = useTranslation();
    return (
        <LinearGradient
            colors={['#f8f9fa', '#e9ecef']}
            style={styles.container}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.mainIcon}>🌍</Text>
                    </View>

                    <Text style={styles.welcomeTitle}>{t('welcome')}</Text>
                    <Text style={styles.impactText}>
                        {t('impact_desc')}
                    </Text>

                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <Text style={styles.statEmoji}>🛡️</Text>
                            <Text style={styles.statValue}>122</Text>
                            <Text style={styles.statLabel}>{t('dignity_score')}</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statEmoji}>🏙️</Text>
                            <Text style={styles.statValue}>5</Text>
                            <Text style={styles.statLabel}>{t('reports_approved')}</Text>
                        </View>
                    </View>

                    <View style={styles.valueCard}>
                        <LinearGradient
                            colors={['#2c3e50', '#000000']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientCard}
                        >
                            <Text style={styles.valueTitle}>{t('city_guardian')}</Text>
                            <Text style={styles.valueDesc}>
                                {t('guardian_desc')}
                            </Text>
                        </LinearGradient>
                    </View>

                    <TouchableOpacity
                        style={styles.mainButton}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Text style={styles.buttonText}>{t('go_to_tasks')}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    mainIcon: {
        fontSize: 50,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 16,
    },
    impactText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 32,
    },
    statCard: {
        backgroundColor: '#fff',
        width: (width - 64) / 2,
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    statEmoji: {
        fontSize: 24,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    valueCard: {
        width: '100%',
        marginBottom: 40,
        borderRadius: 24,
        overflow: 'hidden',
    },
    gradientCard: {
        padding: 24,
    },
    valueTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    valueDesc: {
        color: '#aaa',
        fontSize: 14,
        lineHeight: 20,
    },
    mainButton: {
        backgroundColor: '#007AFF',
        width: '100%',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
