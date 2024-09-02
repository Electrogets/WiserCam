import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Text, Image, FlatList, TouchableOpacity, Dimensions, Platform, Linking } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import ImageEditor from '@react-native-community/image-editor';

const frames = [
    { id: 1, name: 'Frame 1', uri: require('../assets/frames/frame1.png') },
    { id: 2, name: 'Frame 2', uri: require('../assets/frames/frame2.png') },
    { id: 3, name: 'Frame 3', uri: require('../assets/frames/frame3.png') },
    { id: 4, name: 'Frame 4', uri: require('../assets/frames/frame4.jpg') },
    { id: 5, name: 'Frame 5', uri: require('../assets/frames/frame5.png') },
    { id: 6, name: 'Frame 6', uri: require('../assets/frames/frame6.png') },
];

const { width: screenWidth } = Dimensions.get('window');

const FrameOverlay = ({ frame }) => {
    return (
        <View style={StyleSheet.absoluteFill}>
            <Image source={frame.uri} style={styles.frameImage} />
        </View>
    );
};

const FrameSelector = ({ frames, selectedFrame, onSelectFrame, onCapture }) => {
    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.frameButton,
                selectedFrame.id === item.id && styles.frameButtonSelected,
            ]}
            onPress={() => {
                onSelectFrame(item);
                onCapture(item); // Capture image when selecting frame
            }}
        >
            <Image source={item.uri} style={styles.frameButtonImage} />
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={frames}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.frameList}
        />
    );
};

export default function CameraScreen() {
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('back');
    const [selectedFrame, setSelectedFrame] = useState(frames[0]);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const cameraRef = useRef(null);

    useEffect(() => {
        const requestPermissionAsync = async () => {
            if (hasPermission === 'denied') {
                Alert.alert(
                    'Camera Permission Required',
                    'Camera permission is required to take photos. Please enable it in Settings.',
                    [
                        {
                            text: 'Open Settings',
                            onPress: () => {
                                if (Platform.OS === 'android') {
                                    IntentAndroid.openSettings();
                                } else {
                                    Linking.openURL('app-settings:');
                                }
                            },
                        },
                        {
                            text: 'Cancel',
                            style: 'cancel',
                        },
                    ]
                );
            } else if (hasPermission === 'granted') {
                // Permission granted
            } else {
                await requestPermission();
            }
        };
        requestPermissionAsync();
    }, [hasPermission, requestPermission]);

    const handleSelectFrame = (frame) => {
        setSelectedFrame(frame);
    };

    const takePicture = async () => {
        if (cameraRef.current !== null) {
            try {
                const photo = await cameraRef.current.takePhoto({});
                const photoUri = photo.path;
                setCapturedPhoto(photoUri);
                console.log('Captured photo path:', photoUri);

                // Convert frame URI to a file path
                const frameUri = await getFrameUri(selectedFrame.uri);

                const mergedPhotoUri = await mergeFrameWithPhoto(photoUri, frameUri);
                setCapturedPhoto(mergedPhotoUri);
                console.log('Captured photo with frame:', mergedPhotoUri);
            } catch (error) {
                console.error('Error capturing photo:', error);
                Alert.alert('Error', 'Failed to capture photo.');
            }
        }
    };

    const getFrameUri = async (frameUri) => {
        try {
            // Convert the frame asset to a path
            const frameName = frameUri.split('/').pop();
            const framePath = `${RNFS.CachesDirectoryPath}/${frameName}`;
            await RNFS.copyFile(frameUri, framePath);
            return framePath;
        } catch (error) {
            console.error('Error getting frame URI:', error);
            Alert.alert('Error', 'Failed to get frame URI.');
            return null;
        }
    };


    const mergeFrameWithPhoto = async (photoUri, frameUri) => {
        try {
            if (!photoUri || !frameUri) {
                throw new Error('Invalid URIs provided for merging.');
            }

            const photoExists = await RNFS.exists(photoUri);
            const frameExists = await RNFS.exists(frameUri);

            if (!photoExists || !frameExists) {
                throw new Error('One or both of the files do not exist.');
            }

            // Read photo and frame data
            const photoData = await RNFS.readFile(photoUri, 'base64');
            const frameData = await RNFS.readFile(frameUri, 'base64');

            // Use an external library to overlay the frame on the photo
            // For example, using react-native-canvas
            // You need to implement the actual image overlay logic here
            const mergedImageUri = await overlayImages(photoData, frameData);

            return mergedImageUri;
        } catch (error) {
            console.error('Error merging frame with photo:', error);
            Alert.alert('Error', 'Failed to merge frame with photo.');
            return null;
        }
    };
    const overlayImages = async (photoData, frameData) => {
        // This function needs to be implemented based on the library you choose
        // You might use react-native-canvas or a similar library to handle the overlay
        // Here's a placeholder implementation
        return 'file://path-to-merged-image'; // Replace with actual merged image path
    };

    const savePhoto = async (path) => {
        try {
            const newPath = `${RNFS.PicturesDirectoryPath}/${new Date().toISOString()}.jpg`;
            await RNFS.moveFile(path, newPath);
            Alert.alert('Success', 'Photo saved successfully.');
        } catch (error) {
            console.error('Error saving photo:', error);
            Alert.alert('Error', 'Failed to save photo.');
        }
    };

    const sharePhoto = async (path) => {
        try {
            await Share.open({
                url: `file://${path}`,
                title: 'Share Photo',
            });
        } catch (error) {
            console.error('Error sharing photo:', error);
            Alert.alert('Error', 'Failed to share photo.');
        }
    };

    if (hasPermission === 'denied') {
        return <View style={styles.container}><Text>Camera permission is required.</Text></View>;
    }

    if (!device) {
        return <View style={styles.container}><Text>Loading Camera...</Text></View>;
    }

    return (
        <View style={styles.container}>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                photo={true}
                ref={cameraRef}
            />
            <FrameOverlay frame={selectedFrame} />
            <View style={styles.frameSelectorContainer}>
                <FrameSelector
                    frames={frames}
                    selectedFrame={selectedFrame}
                    onSelectFrame={handleSelectFrame}
                    onCapture={takePicture}
                />
            </View>
            {capturedPhoto && (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: `file://${capturedPhoto}` }} style={styles.previewImage} />
                    <TouchableOpacity onPress={() => savePhoto(capturedPhoto)}>
                        <Text style={styles.saveButton}>Save Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => sharePhoto(capturedPhoto)}>
                        <Text style={styles.shareButton}>Share Photo</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    frameSelectorContainer: {
        position: 'absolute',
        bottom: 100,
        width: screenWidth,
        paddingHorizontal: 20,
    },
    frameList: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    frameButton: {
        margin: 5,
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    frameButtonImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    frameButtonSelected: {
        borderColor: '#007BFF',
        borderWidth: 4,
    },
    frameImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    previewContainer: {
        position: 'absolute',
        bottom: 100,
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
    },
    previewImage: {
        width: 200,
        height: 200,
        resizeMode: 'cover',
        marginBottom: 10,
    },
    saveButton: {
        backgroundColor: '#28a745',
        color: 'white',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    shareButton: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: 10,
        borderRadius: 5,
    },
});
