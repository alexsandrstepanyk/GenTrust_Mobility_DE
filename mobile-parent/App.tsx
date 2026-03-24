import React, { useEffect } from 'react';
import { Text, Platform } from 'react-native';
import { loadSavedLanguage } from './services/languageService';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import ParentLoginScreen from './screens/ParentLoginScreen';
import ParentRegisterScreen from './screens/ParentRegisterScreen';
import ParentHomeScreen from './screens/ParentHomeScreen';
import ChildTrackingScreen from './screens/ChildTrackingScreen';
import ChildActivityScreen from './screens/ChildActivityScreen';
import CreateTaskScreen from './screens/CreateTaskScreen';
import TasksScreen from './screens/TasksScreen';
import ProfileScreen from './screens/ProfileScreen';
import PendingApprovalsScreen from './screens/PendingApprovalsScreen';
import { setupNotificationListeners } from './services/pushNotifications';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Завантажуємо збережену мову при запуску
loadSavedLanguage().then((lang) => {
    console.log('[App] i18n initialized, loaded language:', lang || 'default (de)');
});

function MainTabs() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Children" 
        component={ParentHomeScreen}
        options={{
          tabBarLabel: 'Діти',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👨‍👩‍👧</Text>,
        }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={TasksScreen}
        options={{
          tabBarLabel: 'Завдання',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📝</Text>,
        }}
      />
      <Tab.Screen 
        name="Activity" 
        component={ChildActivityScreen}
        options={{
          tabBarLabel: 'Активність',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📊</Text>,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Профіль',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    const cleanup = setupNotificationListeners();
    return cleanup;
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={ParentLoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={ParentRegisterScreen} options={{ title: 'Реєстрація батька' }} />
          <Stack.Screen name="Home" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="ChildTracking" component={ChildTrackingScreen} options={{ title: 'Геолокація дитини' }} />
          <Stack.Screen name="CreateTask" component={CreateTaskScreen} options={{ title: 'Нове завдання' }} />
          <Stack.Screen name="PendingApprovals" component={PendingApprovalsScreen} options={{ title: 'Перевірка звітів' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

