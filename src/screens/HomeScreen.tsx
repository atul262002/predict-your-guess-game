// screens/HomeScreen.tsx
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Linking,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'GameReady'>;

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const buttonScales = useRef(
    Array(4).fill(null).map(() => new Animated.Value(1))
  ).current;
  
  // Create slide animations for buttons from left and right
  const buttonSlideAnims = useRef([
    new Animated.Value(screenWidth), // PLAY - from right
    new Animated.Value(-screenWidth), // INSTRUCTIONS - from left
    new Animated.Value(screenWidth), // CLUES - from right
    new Animated.Value(-screenWidth), // EXIT - from left
  ]).current;

  const [hoveredButton, setHoveredButton] = useState<number | null>(null);
  const [textColors, setTextColors] = useState({
    title: '#888',
    buttons: ['#888', '#888', '#888', '#888'],
    note: '#fff',
    link: '#00f',
  });

  const lightColors = ['#888'];

  useEffect(() => {
    // Start title animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    // Start button slide animations with staggered timing
    const buttonAnimations = buttonSlideAnims.map((anim, index) => {
      return Animated.timing(anim, {
        toValue: 0,
        duration: 1000,
        delay: 500 + (index * 300), // Stagger the animations
        useNativeDriver: true,
      });
    });

    Animated.parallel(buttonAnimations).start();
  }, []);

  useEffect(() => {
    const colorInterval = setInterval(() => {
      setTextColors({
        title: lightColors[Math.floor(Math.random() * lightColors.length)],
        buttons: Array(4)
          .fill(null)
          .map(() => lightColors[Math.floor(Math.random() * lightColors.length)]),
        note: lightColors[Math.floor(Math.random() * lightColors.length)],
        link: lightColors[Math.floor(Math.random() * lightColors.length)],
      });
    }, 1000);

    return () => clearInterval(colorInterval);
  }, []);

  const buttons = ['PLAY', 'INSTRUCTIONS', 'CLUES', 'EXIT'];

  const handleButtonClick = (button: string) => {
    switch (button) {
      case 'PLAY':
        navigation.navigate('Game');
        break;
      case 'INSTRUCTIONS':
        Alert.alert('Instructions', 'Think of a number and follow the clues.');
        break;
      case 'CLUES':
        navigation.navigate('Game');
        break;
      case 'EXIT':
        Alert.alert('Exit', 'Use the home button or swipe to exit the app.');
        break;
      default:
        break;
    }
  };

  const handleMouseEnter = (index: number) => {
    setHoveredButton(index);
    Animated.timing(buttonScales[index], {
      toValue: 1.2,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleMouseLeave = (index: number) => {
    setHoveredButton(null);
    Animated.timing(buttonScales[index], {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.title,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }], color: textColors.title },
        ]}
      >
        IT GUESSES
      </Animated.Text>

      {buttons.map((btn, i) => (
        <Animated.View
          key={i}
          style={{
            opacity: fadeAnim,
            transform: [
              { translateX: buttonSlideAnims[i] },
              { scale: buttonScales[i] }
            ],
            marginVertical: 8,
          }}
        >
          <TouchableOpacity
            style={[
              styles.button,
              hoveredButton === i && styles.hoveredButton,
            ]}
            onPress={() => handleButtonClick(btn)}
            {...(Platform.OS === 'web'
              ? {
                  onMouseEnter: () => handleMouseEnter(i),
                  onMouseLeave: () => handleMouseLeave(i),
                }
              : {})}
          >
            <Text style={[styles.buttonText, { color: textColors.buttons[i] }]}>{btn}</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}

      <Animated.Text style={[styles.note, { opacity: fadeAnim, marginTop: 40, color: textColors.note }]}>
        Headphones Recommended
      </Animated.Text>
      <Animated.Text
        style={[styles.soundtrack, { opacity: fadeAnim, color: textColors.link }]}
      >
        SOUNDTRACK:
      </Animated.Text>
      <Animated.Text
        style={[styles.link, { opacity: fadeAnim, color: "blue" }]}
        onPress={() => Linking.openURL('https://www.youtube.com/watch?v=UceaB4D0jpo')}
      >
        "THEFATRAT XENOGENISIS"
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginBottom: 30,
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#888',
  },
  hoveredButton: {
    borderColor: '#666',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  note: {
    fontSize: 12,
  },
  soundtrack: {
    fontSize: 12,
    marginTop: 10,
  },
  link: {
    fontSize: 12,
    textDecorationLine: 'underline',
    marginTop: 2,
  },
});