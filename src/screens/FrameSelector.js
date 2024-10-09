import React from 'react';
import { ScrollView, Image, TouchableOpacity, StyleSheet, Text, View } from 'react-native';

const frames = [
  { id: 1, uri: require('../assets/frames/frame1.png') },
  { id: 2, uri: require('../assets/frames/frame2.png') },
  { id: 3, uri: require('../assets/frames/frame3.png') },
];

const FrameSelector = ({ onSelectFrame }) => {
  if (!frames || frames.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No frames available</Text>
      </View>
    );
  }

  return (
    <View style={styles.backgroundContainer}>
      <ScrollView horizontal contentContainerStyle={styles.scrollContainer}>
        {frames.map((frame) => (
          <TouchableOpacity key={frame.id} onPress={() => onSelectFrame(frame)}>
            <View style={styles.frameWrapper}>
              <Image source={frame.uri} style={styles.frame} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Light background for better visibility
    // padding: 10,
    borderRadius: 10,
    // marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5, // For Android shadow
  },
  scrollContainer: {
    paddingHorizontal: 0,
  },
  frameWrapper: {
    width: 60, // Smaller size for the circular frame
    height: 60,
    borderRadius: 30, // Circular shape
    borderWidth: 2, // Border width for visibility
    borderColor: '#fff', // White border color
    margin: 5,
    overflow: 'hidden', // Ensures the image stays within the circular border
    alignItems: 'center', // Centering the image
    justifyContent: 'center', // Centering the image
  },
  frame: {
    width: 60, // Match the wrapper size
    height: 60,
    resizeMode: 'cover', // Ensures the image covers the entire area
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  errorText: {
    color: 'red',
  },
});

export default FrameSelector;
