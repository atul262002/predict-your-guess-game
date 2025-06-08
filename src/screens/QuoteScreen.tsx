import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Quote'>;

export default function QuoteScreen({ navigation }: Props) {
  const [showProceedButton, setShowProceedButton] = useState(false);
  const textColorAnim = useRef(new Animated.Value(0)).current; // Animation for smooth color transition
  const proceedButtonAnim = useRef(new Animated.Value(0)).current; // Animation for the Proceed button
  
  // New animation values for dot positions
  const dot1PositionX = useRef(new Animated.Value(0)).current;
  const dot2PositionX = useRef(new Animated.Value(30)).current;
  const dot3Opacity = useRef(new Animated.Value(1)).current;
  const dot4Opacity = useRef(new Animated.Value(0)).current;

  // Start the dot swap animation
  useEffect(() => {
    // Create a loop for dots 1 and 2 swapping positions
    const createDotSwapAnimation = () => {
      return Animated.sequence([
        // Move dots to swapped positions
        Animated.parallel([
          Animated.timing(dot1PositionX, {
            toValue: 30, // Move to the right
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dot2PositionX, {
            toValue: 0, // Move to the left
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        // Small pause at the swapped position
        Animated.delay(300),
        // Move dots back to original positions
        Animated.parallel([
          Animated.timing(dot1PositionX, {
            toValue: 0, // Back to original left position
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dot2PositionX, {
            toValue: 30, // Back to original right position
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        // Small pause at original position
        Animated.delay(300),
      ]);
    };

    // Create animation for dots 3 and 4 fading in/out
    const createDotFadeAnimation = () => {
      return Animated.sequence([
        // Fade transition
        Animated.parallel([
          Animated.timing(dot3Opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(dot4Opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(500),
        // Reverse fade transition
        Animated.parallel([
          Animated.timing(dot3Opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(dot4Opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(500),
      ]);
    };

    // Start both animations in a loop
    Animated.loop(createDotSwapAnimation()).start();
    Animated.loop(createDotFadeAnimation()).start();
  }, []);

  useEffect(() => {
    // Smooth color transition between gray and white
    Animated.loop(
      Animated.sequence([
        Animated.timing(textColorAnim, {
          toValue: 1,
          duration: 2000, // 2 seconds
          useNativeDriver: false,
        }),
        Animated.timing(textColorAnim, {
          toValue: 0,
          duration: 2000, // 2 seconds
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Show the "Proceed" button after 1 second
    const proceedButtonTimer = setTimeout(() => {
      setShowProceedButton(true);
      Animated.loop(
        Animated.sequence([
          Animated.timing(proceedButtonAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(proceedButtonAnim, {
            toValue: 0,
            duration: 1, // Disappear for 1ms
            useNativeDriver: false,
          }),
        ])
      ).start();
    }, 1000);

    return () => {
      clearTimeout(proceedButtonTimer);
    };
  }, []);

  const quoteColor = textColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['white', 'gray'],
  });

  const authorColor = textColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['gray', 'white'],
  });

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.quote, { color: quoteColor }]}>
        "If you are good at anticipating the human mind, it leaves nothing to chance."
      </Animated.Text>
      <Animated.Text style={[styles.author, { color: authorColor }]}>
        - Jigsaw, Saw V (Movie)
      </Animated.Text>
      
      <View style={styles.loaderContainer}>
        {/* First dot - moves right and left */}
        <Animated.View
          style={[
            styles.dotContainer,
            {
              transform: [{ translateX: dot1PositionX }],
            },
          ]}
        >
          <Text style={styles.dot}>.</Text>
        </Animated.View>

        {/* Second dot - moves left and right */}
        <Animated.View
          style={[
            styles.dotContainer,
            {
              transform: [{ translateX: dot2PositionX }],
            },
          ]}
        >
          <Text style={styles.dot}>.</Text>
        </Animated.View>

        {/* Third dot - fades in and out */}
        <Animated.View
          style={[
            styles.dotContainer,
            {
              opacity: dot3Opacity,
            },
          ]}
        >
          <Text style={styles.dot}>.</Text>
        </Animated.View>

        {/* Fourth dot - fades in and out opposite to third */}
        <Animated.View
          style={[
            styles.dotContainer,
            {
              opacity: dot4Opacity,
            },
          ]}
        >
          <Text style={styles.dot}>.</Text>
        </Animated.View>
      </View>
      
      {showProceedButton && (
        <TouchableOpacity onPress={() => navigation.replace('GameReady')}>
          <Animated.Text
            style={[
              styles.proceedButtonText,
              {
                opacity: proceedButtonAnim, // Control visibility
                color: proceedButtonAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['gray', 'white'], // Alternate between gray and white
                }),
              },
            ]}
          >
            PROCEED
          </Animated.Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  quote: {
    fontSize: 23,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  author: {
    fontSize: 19,
    marginTop: 10,
    textAlign: 'right',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  loaderContainer: {
    flexDirection: 'row',
    marginTop: 20,
    height: 40, // Give fixed height to prevent layout shifts
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotContainer: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    fontSize: 27,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  proceedButtonText: {
    fontSize: 21,
    fontWeight: 'bold',
    marginTop: 40,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});