import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './src/screens/SplashScreen';
import QuoteScreen from './src/screens/QuoteScreen';
import { RootStackParamList } from './src/types/navigation';
import GameReadyScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/Game';
import AnswerScreen from './src/screens/AnswerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Quote" component={QuoteScreen} />
        <Stack.Screen name="GameReady" component={GameReadyScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Answer" component={AnswerScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
