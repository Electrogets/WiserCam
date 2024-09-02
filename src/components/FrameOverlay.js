// FrameOverlay.js
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const FrameOverlay = ({ frame }) => {
    if (!frame || !frame.uri) {
        return null;
    }

    console.log('Rendering FrameOverlay with frame:', frame); // Verify frame prop

    return (
        <View style={styles.overlayContainer}>
            <Image source={frame.uri} style={styles.frameImage} />
        </View>
    );
};

const styles = StyleSheet.create({
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    frameImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
});

export default FrameOverlay;
