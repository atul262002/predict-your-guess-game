// Helper function to generate a random animation pattern
const generateAnimationPattern = () => {
  // Different pattern types for variety
  const patternTypes = ['spiral', 'snake', 'random', 'wave'];
  const selectedPattern = patternTypes[Math.floor(Math.random() * patternTypes.length)];

  let animationOrder = [];

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  switch (selectedPattern) {
    case 'spiral':
      // Spiral pattern - goes around from outside to inside or vice versa
      const spiralPattern = [0, 1, 2, 3, 7, 11, 15, 14, 13, 12, 8, 4, 5, 6, 10, 9];
      // Randomly reverse the spiral direction (inside-out vs outside-in)
      animationOrder = Math.random() > 0.5 ? spiralPattern : [...spiralPattern].reverse();
      break;

    case 'snake':
      // Snake pattern - goes row by row, alternating directions
      animationOrder = [0, 1, 2, 3, 7, 6, 5, 4, 8, 9, 10, 11, 15, 14, 13, 12];
      // Randomly flip the starting direction
      if (Math.random() > 0.5) {
        animationOrder = [3, 2, 1, 0, 4, 5, 6, 7, 11, 10, 9, 8, 12, 13, 14, 15];
      }
      break;

    case 'random':
      // Completely random order
      animationOrder = [...Array(16).keys()];
      shuffleArray(animationOrder);
      break;

    case 'wave':
      // Wave pattern - diagonal waves across the grid
      animationOrder = [0, 4, 1, 8, 5, 2, 12, 9, 6, 3, 13, 10, 7, 14, 11, 15];
      // Randomly reverse the wave direction
      if (Math.random() > 0.5) {
        animationOrder = [0, 1, 4, 2, 5, 8, 3, 6, 9, 12, 7, 10, 13, 11, 14, 15].reverse();
      }
      break;
  }

  // Randomly offset the starting position
  if (Math.random() > 0.5) {
    const offset = Math.floor(Math.random() * 16);
    animationOrder = animationOrder.map(index => (index + offset) % 16);
  }

  return animationOrder;
};

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  BackHandler,
  Dimensions,
} from 'react-native';
import { createAudioPlayer } from 'expo-audio';
import { useIsFocused } from '@react-navigation/native';
// import second from '../../assets/sounds/second.mp3'; // Import your sound file
const second = require('../../assets/sounds/second.mp3');
const third = require('../../assets/sounds/third.mp3');
const forth = require('../../assets/sounds/q2.mp3');
const fifth = require('../../assets/sounds/q3.mp3');
const sixth = require('../../assets/sounds/q4.mp3');


export default function GameScreen({ navigation }) {
  // State variables
  const [stopper, setStopper] = useState(0);
  const [ans, setAns] = useState(0);
  const [choice, setChoice] = useState(0);
  const [d1, setD1] = useState(-1);
  const [d2, setD2] = useState(-1);
  const [buttonsArray, setButtonsArray] = useState(Array(16).fill(0));
  const [buttonVisibility, setButtonVisibility] = useState(Array(16).fill(false));
  const [buttonClickable, setButtonClickable] = useState(false);
  const [questionsLeft, setQuestionsLeft] = useState('');

  // Animation references
  const progressAnim = useRef(new Animated.Value(0)).current;
  const buttonAnims = useRef(Array(16).fill().map(() => new Animated.Value(0))).current;

  // Sound references
  const q1Sound = useRef(createAudioPlayer(''));
  const q2Sound = useRef(null);
  const q3Sound = useRef(null);
  const q4Sound = useRef(null);
  const q5Sound = useRef(null);

  // Track playback positions
  const [length1, setLength1] = useState(0);
  const [length2, setLength2] = useState(0);
  const [length3, setLength3] = useState(0);
  const [length4, setLength4] = useState(0);

  // Arrays for game logic - These are the key matrices that define which numbers appear on which cards
  // Each row represents a card, and the numbers in that row are the numbers that appear on that card
  const a = [
    [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31],
    [2, 3, 6, 7, 10, 11, 14, 15, 18, 19, 22, 23, 26, 27, 30, 31],
    [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23, 28, 29, 30, 31],
    [8, 9, 10, 11, 12, 13, 14, 15, 24, 25, 26, 27, 28, 29, 30, 31],
    [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
  ];

  const b = [
    [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31],
    [2, 3, 6, 7, 10, 11, 14, 15, 18, 19, 22, 23, 26, 27, 30, 31],
    [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23, 28, 29, 30, 31],
    [8, 9, 10, 11, 12, 13, 14, 15, 24, 25, 26, 27, 28, 29, 30, 31],
    [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // Placeholder for the 6th question if needed
  ];

  // Calculate the values of each card - these are the powers of 2, which is key to the binary trick
  const cardValues = [1, 2, 4, 8, 16];

  const [a2, setA2] = useState(a);
  const [a3, setA3] = useState(b);
  const [sum1, setSum1] = useState(cardValues);  // Instead of filling with 0, use actual card values
  const [sum2, setSum2] = useState([...cardValues, 0]);  // The 6th card has value 0 for now
  const sound1: any = createAudioPlayer(second);
  const sound2: any = createAudioPlayer(third);
  const sound3: any = createAudioPlayer(forth);
  const sound4: any = createAudioPlayer(fifth);
  const sound5: any = createAudioPlayer(sixth);
  const isFocused = useIsFocused();

  // Similar to onCreate in Android
  useEffect(() => {
    // Initialize game
    // For a binary mind-reading trick, using choice 0 is better
    // as it uses powers of 2 for calculating the answer
    const randomChoice = 0;
    setChoice(randomChoice);

    // Load sounds
    loadSounds();

    // Start animations
    startProgressAnimation();

    setTimeout(() => {
      // Start the game
      if (randomChoice === 0) {
        nextFiveQuestion();
      } else {
        nextSixQuestion();
      }
    }, 1000);

    // Handle back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      // Cleanup
      backHandler.remove();
      unloadSounds();
    };
  }, []);

  // Handle app going to background/foreground
  useEffect(() => {
    if (isFocused) {
      resumeMusic();
    } else {
      pauseMusic();
    }
  }, [isFocused]);

  const loadSounds = async () => {
    q1Sound.current = sound1;
    q2Sound.current = sound2;
    q3Sound.current = sound3;
    q4Sound.current = sound4;
    q5Sound.current = sound5;
    if (q1Sound.current && sound1 && sound1.play) {
      try {
        q1Sound.current.loop = true;
        q1Sound.current.play();
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  const unloadSounds = async () => {
    if (q1Sound.current && sound1 && sound1.play) {
      try {
        sound1.loop = true;
        sound1.play();
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
    else if (q2Sound.current && sound2 && sound2.play) {
      try {
        sound2.loop = true;
        sound2.play();
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
    else if (q3Sound.current && sound3 && sound3.play) {
      try {
        sound3.loop = true;
        sound3.play();
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
    else if (q4Sound.current && sound4 && sound4.play) {
      try {
        sound4.loop = true;
        sound4.play();
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
    else if (q5Sound.current && sound5 && sound5.play) {
      try {
        sound5.loop = true;
        sound5.play();
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  const startProgressAnimation = () => {
    Animated.loop(
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 30000, // Approximate duration of one sound loop
        useNativeDriver: false,
      })
    ).start();
  };

  const animateButtons = (show) => {
    // Reset all animations if hiding
    if (!show) {
      buttonAnims.forEach(anim => anim.setValue(0));
      return;
    }

    // Generate a random animation pattern for this round
    const animationOrder = generateAnimationPattern();

    // Create the animations based on the calculated pattern
    const animations = animationOrder.map((buttonIndex, sequenceIndex) =>
      Animated.timing(buttonAnims[buttonIndex], {
        toValue: 1,
        duration: 300,
        delay: sequenceIndex * 80, // Staggered delay for one-by-one appearance
        useNativeDriver: true,
      })
    );

    // Run animations in sequence
    Animated.stagger(80, animations).start(() => {
      // Enable buttons after all animations complete
      setButtonClickable(true);
    });
  };

  const nextFiveQuestion = () => {
    const newD1 = d1 + 1;
    setD1(newD1);
    setQuestionsLeft(`Questions Left: ${5 - newD1}`);

    // Reset button states
    setButtonClickable(false);

    // Get current card matrix
    const currentCard = a2[newD1];

    // Create array of button values and ensure proper display
    const newButtons = Array(16).fill(0);

    // Shuffle the positions to create randomness
    const positions = [...Array(16).keys()];
    shuffleArray(positions);

    // Assign the numbers from the current card to random positions
    for (let i = 0; i < 16; i++) {
      newButtons[positions[i]] = currentCard[i];
    }

    setButtonsArray(newButtons);

    // Show buttons with animation
    setTimeout(() => {
      animateButtons(true);
    }, 500);
  };

  const nextSixQuestion = () => {
    const newD2 = d2 + 1;
    setD2(newD2);
    setQuestionsLeft(`Questions Left: ${6 - newD2}`);

    // Reset button states
    setButtonClickable(false);

    // Get current card matrix
    const currentCard = a3[newD2];

    // Create array of button values
    const newButtons = Array(16).fill(0);

    // Shuffle the positions to create randomness
    const positions = [...Array(16).keys()];
    shuffleArray(positions);

    // Assign the numbers from the current card to random positions
    for (let i = 0; i < 16; i++) {
      newButtons[positions[i]] = currentCard[i];
    }

    setButtonsArray(newButtons);

    // Show buttons with animation
    setTimeout(() => {
      animateButtons(true);
    }, 500);
  };

  const handleYesClick = () => {
    setButtonClickable(false);

    // Hide all buttons with animation
    animateButtons(false);

    // Update the result based on Yes
    if (choice === 0) {
      // This is the key improvement: we add the value of the card when player says "Yes"
      // This is basically adding the power of 2 corresponding to that bit position
      const newAns = ans + sum1[d1];
      setAns(newAns);

      if (d1 === 4) {
        // Game over - go to answer screen
        navigateToAnswer(newAns);
      } else {
        // Play next music and go to next question
        playNextMusic();
        nextFiveQuestion();
      }
    } else {
      const newAns = ans + sum2[d2];
      setAns(newAns);

      if (d2 === 5) {
        // Game over - go to answer screen
        navigateToAnswer(newAns);
      } else {
        // Play next music and go to next question
        playNextMusic();
        nextSixQuestion();
      }
    }
  };

  const handleNoClick = () => {
    setButtonClickable(false);

    // Hide all buttons with animation
    animateButtons(false);

    // Update the result based on No (we don't add anything)
    if (choice === 0) {
      if (d1 === 4) {
        // Game over - go to answer screen
        navigateToAnswer(ans);
      } else {
        // Play next music and go to next question
        playNextMusic();
        nextFiveQuestion();
      }
    } else {
      if (d2 === 5) {
        // Game over - go to answer screen
        navigateToAnswer(ans);
      } else {
        // Play next music and go to next question
        playNextMusic();
        nextSixQuestion();
      }
    }
  };

  const playNextMusic = async () => {
    q1Sound.current.loop = false;
    q1Sound.current.paused = true;
    q1Sound.current.currentTime = 0;
    q1Sound.current?.stopObserving('playbackStatusUpdate');
    q1Sound.current.pause();
    if (d1 === 0 || d2 === 0) {
      // Continue first music
      if (!q1Sound.current?.isPlaying) {
        // await q1Sound.current.setPositionAsync(0);
        await sound1.play();
      }
    } 
    else if (d1 === 1 || d2 === 1 || d2 === 2) {
      // Switch to second music
      // await q1Sound.current.setIsLoopingAsync(false);
      q1Sound.current.loop = false;
      await q1Sound.current.pause();
      await q1Sound.current.remove();

      // if (!q2Sound.current?.isPlaying) {
      //   // await q2Sound.current.setPositionAsync(0);
      //   await sound2.play();
      // }
    } 
    // else if (d1 === 2 || d2 === 3) {
    //   // Switch to third music
    //   // await q2Sound.current.setIsLoopingAsync(false);
    //   await sound2.remove();

    //   if (!q3Sound.current?.isPlaying) {
    //     await sound3.play();
    //   }
    // } else if (d1 === 3 || d2 === 4) {
    //   // Switch to fourth music
    //   // await q3Sound.current.setIsLoopingAsync(false);
    //   await sound3.remove();

    //   if (!q4Sound.current?.isPlaying) {
    //     await sound4.play();
    //   }
    // } else if (d1 === 4 || d2 === 5) {
    //   // Stop music at the end
    //   // await q4Sound.current.setIsLoopingAsync(false);
    //   await sound4.remove();
    // }
  };

  const pauseMusic = async () => {
    setStopper(0);

    if (d1 === 0 || d2 === 0 || d1 === 1 || d2 === 1) {
      // const status = await q1Sound.current.getStatusAsync();
      await sound1.remove();
      // setLength1(status.positionMillis);
    } else if (d1 === 2 || d2 === 2 || d2 === 3) {
      // const status = await q2Sound.current.getStatusAsync();
      await sound2.remove();
      // setLength2(status.positionMillis);
    } else if (d1 === 3 || d2 === 4) {
      // const status = await q3Sound.current.getStatusAsync();
      await sound3.remove();
      // setLength3(status.positionMillis);
    } else if (d1 === 4 || d2 === 5) {
      // const status = await q4Sound.current.getStatusAsync();
      await sound4.remove();
      // setLength4(status.positionMillis);
    }
  };

  const resumeMusic = async () => {
    if (d1 === 0 || d2 === 0 || d1 === 1 || d2 === 1) {
      // await q1Sound.current.setPositionAsync(length1);
      await sound1.play();
    } else if (d1 === 2 || d2 === 2 || d2 === 3) {
      // await q2Sound.current.setPositionAsync(length2);
      await sound2.play();
    } else if (d1 === 3 || d2 === 4) {
      // await q3Sound.current.setPositionAsync(length3);
      await sound3.play();
    } else if (d1 === 4 || d2 === 5) {
      // await q4Sound.current.setPositionAsync(length4);
      await sound4.play();
    }
  };

  const navigateToAnswer = (finalAnswer) => {
    // Ensure the answer is correct before navigating
    navigation.navigate('Answer', { answer: finalAnswer.toString() });
  };

  const handleBackPress = () => {
    Alert.alert(
      'Stop Playing?',
      'Are you sure you want to stop playing?',
      [
        { text: 'NO', style: 'cancel' },
        {
          text: 'YES',
          onPress: async () => {
            // Stop all sounds
            if (q1Sound.current) await sound1.remove();
            if (q2Sound.current) await sound2.remove();
            if (q3Sound.current) await sound3.remove();
            if (q4Sound.current) await sound4.remove();
            if (q5Sound.current) await sound5.remove();

            // Go back
            navigation.goBack();
          }
        }
      ]
    );
    return true;
  };

  // Helper function to shuffle array
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Render a grid button with consistent animations
  const renderButton = (index) => {
    const buttonValue = buttonsArray[index];

    return (
      <Animated.View
        key={index}
        style={[
          styles.buttonContainer,
          {
            opacity: buttonAnims[index],
            transform: [
              {
                scale: buttonAnims[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1]
                })
              }
            ],
          },
        ]}
      >
        <Text style={styles.buttonText}>
          {buttonValue !== 0 ? buttonValue : ''}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.titleText}>
        Is your number here?
      </Text>

      {/* Subtitle */}
      <Text style={styles.subtitleText}>
        Plays Until Next Clue
      </Text>

      {/* Questions left text - hidden but kept for reference */}
      <Text style={[styles.questionsLeftText, { display: 'none' }]}>
        {questionsLeft}
      </Text>

      {/* Grid of buttons - 4x4 */}
      <View style={styles.grid}>
        <View style={styles.gridRow}>
          {renderButton(0)}
          {renderButton(1)}
          {renderButton(2)}
          {renderButton(3)}
        </View>
        <View style={styles.gridRow}>
          {renderButton(4)}
          {renderButton(5)}
          {renderButton(6)}
          {renderButton(7)}
        </View>
        <View style={styles.gridRow}>
          {renderButton(8)}
          {renderButton(9)}
          {renderButton(10)}
          {renderButton(11)}
        </View>
        <View style={styles.gridRow}>
          {renderButton(12)}
          {renderButton(13)}
          {renderButton(14)}
          {renderButton(15)}
        </View>
      </View>

      {/* Progress bar at bottom */}
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              })
            }
          ]}
        />
      </View>

      {/* Yes/No buttons */}
      <View style={styles.controlButtons}>
        <TouchableOpacity
          style={[styles.controlButton, styles.yesButton, !buttonClickable && styles.disabledButton]}
          onPress={handleYesClick}
          disabled={!buttonClickable}
        >
          <Text style={styles.controlButtonText}>YES</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.noButton, !buttonClickable && styles.disabledButton]}
          onPress={handleNoClick}
          disabled={!buttonClickable}
        >
          <Text style={styles.controlButtonText}>NO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 16,
    justifyContent: 'space-between',
  },
  titleText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
  },
  subtitleText: {
    color: '#AAAAAA',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  questionsLeftText: {
    color: '#AAAAAA',
    fontSize: 14,
    textAlign: 'center',
  },
  grid: {
    alignSelf: 'center',
    marginVertical: 20,
    width: '100%',
    maxWidth: 350,
    flex: 1,
    justifyContent: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  buttonContainer: {
    width: 65,
    height: 65,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: '100%',
    height: 3,
    backgroundColor: '#333333',
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF0000',
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  controlButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: 'white',
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: 'bold',

  },
  yesButton: {
    // backgroundColor: 'transparent',
    borderColor: '#4CAF50',
  },
  noButton: {
    // backgroundColor: 'transparent',
    borderColor: '#F44336',
  },
  disabledButton: {
    opacity: 0.5,
  },
});