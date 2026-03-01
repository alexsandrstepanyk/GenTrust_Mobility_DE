import React, { useEffect } from 'react';
import './services/i18n';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ImpactScreen from './screens/ImpactScreen';
import HomeTabs from './screens/HomeTabs';
import QuestDetailsScreen from './screens/QuestDetailsScreen';
import { setupNotificationListeners } from './services/pushNotifications';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    const cleanup = setupNotificationListeners();
    return cleanup;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Sign Up' }} />
        <Stack.Screen name="Impact" component={ImpactScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeTabs} options={{ headerShown: false }} />
        <Stack.Screen name="QuestDetails" component={QuestDetailsScreen} options={{ title: 'Quest Details' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
