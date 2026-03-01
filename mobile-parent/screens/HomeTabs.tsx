import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import ReportScreen from './ReportScreen';
import QuestsScreen from './QuestsScreen';
import LeaderboardScreen from './LeaderboardScreen';
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();

export default function HomeTabs({ navigation }: any) {
    const { t } = useTranslation();
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
                headerRight: () => (
                    <TouchableOpacity
                        onPress={() => navigation.replace('Login')}
                        style={{ marginRight: 16 }}
                    >
                        <Text style={{ color: '#FF3B30', fontWeight: 'bold' }}>{t('logout')}</Text>
                    </TouchableOpacity>
                ),
            }}
        >
            <Tab.Screen
                name="Tasks"
                component={QuestsScreen}
                options={{
                    title: t('tasks'),
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🎒</Text>
                }}
            />
            <Tab.Screen
                name="Report"
                component={ReportScreen}
                options={{
                    title: t('report'),
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📸</Text>
                }}
            />
            <Tab.Screen
                name="Ranks"
                component={LeaderboardScreen}
                options={{
                    title: t('ranks'),
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏆</Text>
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: t('profile'),
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text>
                }}
            />
        </Tab.Navigator>
    );
}
