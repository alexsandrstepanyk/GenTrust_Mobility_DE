import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';

interface Stats {
  completedQuests: number;
  incompleteQuests: number;
  totalEarned: number;
  integrity: number;
  name: string;
}

export default function DashboardScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Помилка завантаження статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Привіт */}
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>
          👋 Привіт, {stats?.name || 'Студент'}!
        </Text>
        <Text style={styles.subText}>
          Ти робиш чудову роботу! 🌟
        </Text>
      </View>

      {/* Карточки статистики */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>✅</Text>
          <Text style={styles.statNumber}>{stats?.completedQuests || 0}</Text>
          <Text style={styles.statLabel}>Виконано</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>⏳</Text>
          <Text style={styles.statNumber}>{stats?.incompleteQuests || 0}</Text>
          <Text style={styles.statLabel}>В роботі</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>💰</Text>
          <Text style={styles.statNumber}>€{stats?.totalEarned || 0}</Text>
          <Text style={styles.statLabel}>Заробив</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>⭐</Text>
          <Text style={styles.statNumber}>{stats?.integrity || 0}%</Text>
          <Text style={styles.statLabel}>Репутація</Text>
        </View>
      </View>

      {/* Мотиваційна секція */}
      <View style={styles.motivationCard}>
        <Text style={styles.motivationTitle}>💪 Ти робиш різницю!</Text>
        <Text style={styles.motivationText}>
          Кожне завдання, яке ти виконуєш, допомагає городу бути чище та красивіше.
        </Text>
      </View>

      {/* Поради */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>📈 Як заробити більше:</Text>
        <Text style={styles.tipItem}>✓ Приймай завдання швидко</Text>
        <Text style={styles.tipItem}>✓ Виконай якісно</Text>
        <Text style={styles.tipItem}>✓ Отримай позитивний відгук</Text>
        <Text style={styles.tipItem}>✓ Повтори процес</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
  },
  greeting: {
    marginTop: 24,
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  motivationCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  tipItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
});
