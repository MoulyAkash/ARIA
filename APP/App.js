import React, {useEffect} from 'react';
import {LogBox} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Home from './src/screens/Home';
import AIChat from './src/screens/AIChat';
import Landmark from './src/screens/Landmark';

const Stack = createNativeStackNavigator();

export default function App() {
  LogBox.ignoreLogs(['new NativeEventEmitter()']);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="AIChat" component={AIChat} />
        <Stack.Screen name="Landmark" component={Landmark} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
