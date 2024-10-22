import React, { useState } from 'react';
import { ScrollView, Image, TouchableOpacity, StyleSheet, Text, View } from 'react-native';

const frames = [
  { id: 1, uri: require('../assets/frames/frame1.png') },
  { id: 2, uri: require('../assets/frames/frame2.png') },
  { id: 3, uri: require('../assets/frames/frame3.png') },
  { id: 4, uri: require('../assets/frames/frame4.jpg') },
  { id: 5, uri: require('../assets/frames/frame5.png') },
  { id: 6, uri: require('../assets/frames/frame6.png') },
];

const FrameSelector = ({ onSelectFrame }) => {
  const [selectedFrameId, setSelectedFrameId] = useState(null); // State to track selected frame

  const handleFrameSelect = (frame) => {
    setSelectedFrameId(frame.id); // Update selected frame
    onSelectFrame(frame); // Trigger the onSelectFrame callback
  };

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
          <TouchableOpacity key={frame.id} onPress={() => handleFrameSelect(frame)}>
            <View
              style={[
                styles.frameWrapper,
                selectedFrameId === frame.id ? styles.selectedFrame : null, // Conditional styling for selected frame
              ]}
            >
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
    // backgroundColor: 'rgba(0, 0, 0, 0.8)', 
    borderRadius: 10,
    width:'100%',
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
    width: 80, // Smaller size for the circular frame
    height: 80,
    borderRadius: 40, // Circular shape
    borderWidth: 2, // Border width for visibility
    borderColor: '#fff', // Default white border
    margin: 5,
    overflow: 'hidden', // Ensures the image stays within the circular border
    alignItems: 'center', // Centering the image
    justifyContent: 'center', // Centering the image
  },
  frame: {
    width: 100,
    height: 70,
    resizeMode: 'contain', // Ensures the image covers the entire area
  },
  selectedFrame: {
    borderColor: '#FFD700', // Gold border for the selected frame
    borderWidth: 4, // Thicker border for selected frame
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
