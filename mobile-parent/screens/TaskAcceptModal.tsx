import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config';

interface Quest {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: string;
  city: string;
  district: string;
  location: string;
  status: string;
  createdAt: string;
}

interface TaskAcceptModalProps {
  visible: boolean;
  quest: Quest | null;
  onAccept: (questId: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const { height, width } = Dimensions.get('window');

export const TaskAcceptModal: React.FC<TaskAcceptModalProps> = ({
  visible,
  quest,
  onAccept,
  onCancel,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [showWarning, setShowWarning] = useState(true);
  const [acceptPressed, setAcceptPressed] = useState(false);

  if (!quest) return null;

  // Парсення локації для карти (в реальному проекті це буде GPS координати)
  const getMapCoordinates = () => {
    // Приклад координат для Львова
    const defaultCoords = {
      latitude: 49.8397,
      longitude: 24.0297,
    };

    // У реальному app додати можна GPS дані
    return defaultCoords;
  };

  const handleAcceptPress = async () => {
    if (!acceptPressed) {
      // Перша натискання - показуємо попередження
      setAcceptPressed(true);
      return;
    }

    // Друга натискання - реально приймаємо завдання
    try {
      await onAccept(quest.id);
      // Очищаємо стан при успіху
      setAcceptPressed(false);
      setShowWarning(true);
    } catch (error) {
      setAcceptPressed(false);
    }
  };

  const handleCancel = () => {
    setAcceptPressed(false);
    setShowWarning(true);
    onCancel();
  };

  const mapCoords = getMapCoordinates();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <SafeAreaView style={styles.container}>
        {/* ПОПЕРЕДЖЕННЯ */}
        {showWarning && !acceptPressed && (
          <View style={styles.warningContainer}>
            <View style={styles.warningBox}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.warningTitle}>
                {t('serious_warning', 'Серйозне попередження')}
              </Text>
              <Text style={styles.warningText}>
                {t('task_responsibility', 'Ви на потім стати відповідальні за це завдання. Будь ласка, ознайомтесь з деталями перед прийняттям.')}
              </Text>
              <Text style={styles.warningSubtext}>
                {t('task_important', 'Це завдання потребує уважності та відповідальності. Ви повинні його завершити за вказані умови.')}
              </Text>

              <View style={styles.warningButtons}>
                <TouchableOpacity
                  style={[styles.warningBtn, styles.cancelBtn]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelBtnText}>
                    {t('go_back', 'Повернутися')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.warningBtn, styles.understandBtn]}
                  onPress={() => setShowWarning(false)}
                >
                  <Text style={styles.understandBtnText}>
                    {t('read_details', 'Прочитати детально')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ДЕТАЛИ ЗАВДАННЯ */}
        {!showWarning && (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* ЗАГОЛОВОК */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{t('task_details', 'Деталі завдання')}</Text>
              <View style={{ width: 30 }} />
            </View>

            {/* ОСНОВНА ІНФОРМАЦІЯ */}
            <View style={styles.section}>
              <View style={styles.taskHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.taskType}>{quest.type}</Text>
                  <Text style={styles.taskTitle}>{quest.title}</Text>
                </View>
                <View style={styles.rewardBadge}>
                  <Text style={styles.rewardAmount}>₴{quest.reward}</Text>
                  <Text style={styles.rewardLabel}>{t('reward', 'Винагорода')}</Text>
                </View>
              </View>
            </View>

            {/* ОПИС */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('description', 'Опис')}</Text>
              <Text style={styles.description}>{quest.description}</Text>
            </View>

            {/* ЛОКАЦІЯ */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('location', 'Локація')}</Text>

              {/* КАРТА */}
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    ...mapCoords,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }}
                >
                  <Marker
                    coordinate={mapCoords}
                    title={quest.location}
                    description={`${quest.city}, ${quest.district}`}
                  />
                </MapView>
              </View>

              {/* АДРЕСА */}
              <View style={styles.locationInfo}>
                <Text style={styles.locationCity}>
                  📍 {quest.city}, {quest.district}
                </Text>
                <Text style={styles.locationAddress}>
                  🏠 {quest.location}
                </Text>
              </View>
            </View>

            {/* ДЕТАЛЬНА ІНФОРМАЦІЯ */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('details', 'Детальна інформація')}</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('type', 'Тип завдання')}:</Text>
                <Text style={styles.detailValue}>{quest.type}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('status', 'Статус')}:</Text>
                <Text style={[styles.detailValue, { color: '#34C759' }]}>{quest.status}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('created', 'Створено')}:</Text>
                <Text style={styles.detailValue}>
                  {new Date(quest.createdAt).toLocaleDateString('uk-UA')}
                </Text>
              </View>
            </View>

            {/* УМОВИ */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('conditions', 'Умови')}</Text>

              <View style={styles.conditionItem}>
                <Text style={styles.conditionBullet}>✓</Text>
                <Text style={styles.conditionText}>
                  {t('must_complete', 'Ви повинні завершити це завдання за вказаний час')}
                </Text>
              </View>

              <View style={styles.conditionItem}>
                <Text style={styles.conditionBullet}>✓</Text>
                <Text style={styles.conditionText}>
                  {t('must_follow_rules', 'Слідуйте всім інструкціям та правилам безпеки')}
                </Text>
              </View>

              <View style={styles.conditionItem}>
                <Text style={styles.conditionBullet}>✓</Text>
                <Text style={styles.conditionText}>
                  {t('report_completion', 'Звітуйте про завершення з фото/описом')}
                </Text>
              </View>

              <View style={styles.conditionItem}>
                <Text style={styles.conditionBullet}>✓</Text>
                <Text style={styles.conditionText}>
                  {t('quality_matters', 'Якість роботи впливає на ваш рейтинг')}
                </Text>
              </View>
            </View>

            <View style={{ height: 30 }} />
          </ScrollView>
        )}

        {/* КНОПКИ ДІЙСТВА */}
        {!showWarning && (
          <View style={styles.actionBar}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelText}>{t('decline', 'Відмовити')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.acceptButton,
                loading && styles.acceptButtonDisabled,
              ]}
              onPress={handleAcceptPress}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.acceptText}>
                  {acceptPressed
                    ? t('confirm_accept', 'ПІДТВЕРДИТИ ПРИЙНЯТТЯ')
                    : t('accept_task', 'ПРИЙНЯТИ ЗАВДАННЯ')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // ПОПЕРЕДЖЕННЯ
  warningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  warningBox: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF3B30',
    marginBottom: 12,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 15,
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  warningSubtext: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  warningButtons: {
    width: '100%',
    gap: 12,
  },
  warningBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F2F2F7',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  understandBtn: {
    backgroundColor: '#007AFF',
  },
  understandBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },

  // КОНТЕНТ
  content: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  closeBtn: {
    fontSize: 28,
    color: '#007AFF',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },

  // СЕКЦІЇ
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
  },

  // ЗАГОЛОВОК ЗАВДАННЯ
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    flex: 1,
  },
  rewardBadge: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  rewardAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34C759',
  },
  rewardLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },

  // ОПИС
  description: {
    fontSize: 15,
    color: '#1C1C1E',
    lineHeight: 22,
  },

  // ЛОКАЦІЯ
  mapContainer: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  map: {
    flex: 1,
  },
  locationInfo: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
  },
  locationCity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 13,
    color: '#8E8E93',
  },

  // ДЕТАЛЬНА ІНФОРМАЦІЯ
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  detailLabel: {
    fontSize: 13,
    color: '#8E8E93',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },

  // УМОВИ
  conditionItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  conditionBullet: {
    fontSize: 16,
    color: '#34C759',
    marginRight: 10,
  },
  conditionText: {
    fontSize: 13,
    color: '#1C1C1E',
    flex: 1,
    lineHeight: 18,
  },

  // КНОПКИ
  actionBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#34C759',
    alignItems: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  acceptText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default TaskAcceptModal;
