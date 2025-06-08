import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, FlatList } from 'react-native';

export default function GameScreen() {
  const [numbers, setNumbers] = useState([20, 27, 30, 29, 19, 23, 5, 22, 28, 18, 15, 10, 7, 9]);
  const [numberColors, setNumberColors] = useState(
    numbers.map(() => '#000') // Initialize all numbers with black color
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const itemAnimations = useRef(numbers.map(() => new Animated.Value(0))).current;

  // Define dark colors
  const darkColors = ['#4B0082', '#2F4F4F', '#8B0000', '#483D8B', '#2E8B57'];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    itemAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  useEffect(() => {
    const colorInterval = setInterval(() => {
      setNumberColors(
        numbers.map(() => darkColors[Math.floor(Math.random() * darkColors.length)])
      );
    }, 2000); // Change colors every 2 seconds

    return () => clearInterval(colorInterval); // Cleanup interval on component unmount
  }, [numbers]);

  const onYes = () => {
    console.log('YES button pressed');
  };

  const onNo = () => {
    console.log('NO button pressed');
  };

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
        Is your number here?
      </Animated.Text>
      <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
        Plays Until Next Clue :
      </Animated.Text>

      <FlatList
        data={numbers}
        keyExtractor={(item) => item.toString()}
        numColumns={4}
        contentContainerStyle={styles.grid}
        renderItem={({ item, index }) => (
          <Animated.View
            style={[
              styles.numBox,
              {
                opacity: itemAnimations[index],
                transform: [{ scale: itemAnimations[index] }],
              },
            ]}
          >
            <Text style={[styles.numText, { color: numberColors[index] }]}>{item}</Text>
          </Animated.View>
        )}
      />

      <Animated.View style={[styles.buttonRow, { opacity: fadeAnim }]}>
        <TouchableOpacity style={[styles.choiceBtn, { borderColor: 'green' }]} onPress={onYes}>
          <Text style={{ color: 'green', fontWeight: 'bold' }}>YES</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.choiceBtn, { borderColor: 'red' }]} onPress={onNo}>
          <Text style={{ color: 'red', fontWeight: 'bold' }}>NO</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#fff',
    marginBottom: 20,
  },
  grid: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBox: {
    backgroundColor: '#fff',
    margin: 6,
    padding: 12,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  numText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 30,
  },
  choiceBtn: {
    borderWidth: 2,
    padding: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
});