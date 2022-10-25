import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createNavigationContainerRef } from '@react-navigation/native';
import { Button, Text, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef()

import LoginScreen from './Screens/Login';
import DashboardScreen from './Screens/Dashboard';
import ProxyHostsScreen from './Screens/ProxyHosts';
import ViewProxyHostScreen from './Screens/ViewProxyHost';

export default function App() {
  function logout() {
    if (navigationRef.isReady()) {
      SecureStore.deleteItemAsync('token');
      SecureStore.deleteItemAsync('dashboardUrl');
      navigationRef.navigate('Login');
    } else {
      Alert.alert(
        "Error",
        "Navigation not ready, please try restarting application.",
        [
          { text: "OK" }
        ]
      );
    }
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerTitle: 'Login',
            headerStyle: {
              backgroundColor: '#e3e3e3',
            },
          }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            headerTitle: 'Dashboard',
            headerRight: () => (
              <Button
                onPress={() => logout()}
                title="Logout"
              />
            ),
            headerLeft: () => <Text></Text>,
            headerStyle: {
              backgroundColor: '#e3e3e3',
            },
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Proxy Hosts"
          component={ProxyHostsScreen}
          options={{
            headerTitle: 'Proxy Hosts',
            headerRight: () => (
              <Button
                onPress={() => logout()}
                title="Logout"
              />
            ),
            headerStyle: {
              backgroundColor: '#e3e3e3',
            },
          }}
        />
        <Stack.Screen
          name="View Proxy Host"
          component={ViewProxyHostScreen}
          options={{
            headerTitle: 'View Proxy Host',
            headerRight: () => (
              <Button
                onPress={() => logout()}
                title="Logout"
              />
            ),
            headerStyle: {
              backgroundColor: '#e3e3e3',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
