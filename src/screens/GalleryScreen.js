import React, { useState } from 'react';
import { View, Button, Image, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import FrameOverlay from '../components/FrameOverlay';

const frames = [
    { id: 1, name: 'Frame 1', uri: require('../assets/frames/frame1.png') },
    { id: 2, name: 'Frame 2', uri: require('../assets/frames/frame2.png') },
    { id: 3, name: 'Frame 3', uri: require('../assets/frames/frame3.png') },
    { id: 4, name: 'Frame 4', uri: require('../assets/frames/frame4.jpg') },
    { id: 5, name: 'Frame 5', uri: require('../assets/frames/frame5.png') },
    { id: 6, name: 'Frame 6', uri: require('../assets/frames/frame6.png') }
];

export default function GalleryScreen() {
    const [image, setImage] = useState(null);
    const [selectedFrame, setSelectedFrame] = useState(frames[0]);

    const selectImage = () => {
        launchImageLibrary({}, response => {
            if (response.assets) {
                setImage(response.assets[0].uri);
            }
        });
    };

    return (
        <View style={styles.container}>
            <Button title="Select Image" onPress={selectImage} />
            {image && (
                <View style={styles.imageContainer}>
                    <Image source={{ uri: image }} style={styles.image} />
                    <FrameOverlay frame={selectedFrame} />
                </View>
            )}
            <FlatList
                data={frames}
                horizontal
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => setSelectedFrame(item)} style={styles.frameButton}>
                        <Text>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
            <Button title="Download" onPress={() => { /* Implement download logic */ }} />
            <Button title="Share" onPress={() => { /* Implement share logic */ }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: 300,
        height: 400,
    },

    frameButton: {
        padding: 10,
        backgroundColor: '#ccc',
        marginHorizontal: 5,
        borderRadius: 10,
    },
    frameButtonSelected: {
        borderWidth: 2,
        borderColor: '#000',
    },
});
