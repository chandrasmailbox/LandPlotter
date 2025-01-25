import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from './src/screens/MapScreen';
import WebMapScreen from './src/screens/WebMapScreen';
import { Platform } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {Platform.OS === 'web' ? (
          <Stack.Screen 
            name="WebMap" 
            component={WebMapScreen} 
            options={{ title: 'Land Area Calculator (Web)' }} 
          />
        ) : (
          <Stack.Screen 
            name="Map" 
            component={MapScreen} 
            options={{ title: 'Land Area Calculator' }} 
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}