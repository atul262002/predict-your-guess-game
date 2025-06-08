import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { RootStackParamList } from '../types/navigation';

type AnswerScreenProps = NativeStackScreenProps<RootStackParamList, 'Answer'>;

export default function AnswerScreen({ route, navigation }: AnswerScreenProps) {
  const { answer } = route.params;
  const [isWhite, setIsWhite] = useState(true);
  
  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Initial animation when screen loads
  useEffect(() => {
    // Start the zoom in/out animation for red box
    startZoomAnimation();
    
    // Toggle colors every 500ms
    const colorInterval = setInterval(() => {
      setIsWhite(prev => !prev);
    }, 500);

    return () => clearInterval(colorInterval);
  }, []);

  // Zoom animation function
  const startZoomAnimation = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => startZoomAnimation());
  };

  const handlePlayAgain = () => {
    navigation.replace('Game');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Answer</Text>
      
      <View style={styles.numberContainer}>
        <Animated.View 
          style={[
            styles.numberBox,
            { 
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Text style={[
            styles.numberText,
            { color: isWhite ? 'white' : '#C0C0C0' }
          ]}>
            {answer}
          </Text>
        </Animated.View>
      </View>

      <TouchableOpacity 
        style={styles.playAgainButton}
        onPress={handlePlayAgain}
      >
        <Text style={styles.playAgainText}>PLAY AGAIN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 80,
    letterSpacing: 2,
  },
  numberContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberBox: {
    backgroundColor: '#DC3545',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  numberText: {
    fontSize: 120,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  playAgainButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 40,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  playAgainText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});