import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Text, Image, Dimensions, TouchableOpacity, Platform, Linking } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import FrameSelector from './FrameSelector';
import ImageResizer from 'react-native-image-resizer';
import { Canvas } from 'react-native-canvas'; // Import at the top


const frames = [
    { id: 1, name: 'Frame 1', uri: require('../assets/frames/frame1.png') },
    { id: 2, name: 'Frame 2', uri: require('../assets/frames/frame2.png') },
    { id: 3, name: 'Frame 3', uri: require('../assets/frames/frame3.png') },
    { id: 4, name: 'Frame 4', uri: require('../assets/frames/frame4.jpg') },
    { id: 5, name: 'Frame 5', uri: require('../assets/frames/frame5.png') },
    { id: 6, name: 'Frame 6', uri: require('../assets/frames/frame6.png') },
];


const { width: screenWidth } = Dimensions.get('window');

const CameraScreen = () => {
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('back');
    const [selectedFrame, setSelectedFrame] = useState(frames[0]);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [finalImage, setFinalImage] = useState(null);
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


    const handleSelectFrame = async (frame) => {
        setSelectedFrame(frame);
        console.log('Selected Frame:', frame); // Check the whole frame object
        console.log('Selected Frame ID:', frame.id); // Log the ID
        console.log('Selected Frame URI:', frame.uri); // Log the URI
        await takePicture(); // Capture image automatically

    };

    const takePicture = async () => {
        if (cameraRef.current !== null) {
            try {
                const photo = await cameraRef.current.takePhoto({});
                const photoUri = photo.path;
                setCapturedPhoto(photoUri);
                console.log('Captured photo path:', photoUri);
                const finalImageUri = await overlayFrameOnPhoto(photoUri, selectedFrame.uri); // Use selectedFrame.uri
                setFinalImage(finalImageUri);
            } catch (error) {
                console.error('Error capturing photo:', error);
                Alert.alert('Error', 'Failed to capture photo.');
            }
        }
    };


    const overlayFrameOnPhoto = async (photoUri, frameUri) => {
        console.log('Photo URI:', photoUri);
        console.log('Frame URI:', frameUri);
        try {
            const photoSize = await ImageResizer.createResizedImage(photoUri, screenWidth, screenWidth, 'JPEG', 100);
            if (!photoSize || !photoSize.uri) {
                throw new Error('Photo size not valid');
            }

            const resizedFrame = await ImageResizer.createResizedImage(frameUri, photoSize.width, photoSize.height, 'PNG', 100);
            if (!resizedFrame || !resizedFrame.uri) {
                throw new Error('Resized frame not valid');
            }

            const mergedImageUri = await mergeImages(photoSize.uri, resizedFrame.uri);
            return mergedImageUri;
        } catch (error) {
            console.error('Error overlaying frame on photo:', error);
            Alert.alert('Error', 'Failed to overlay frame on photo.');
            return null;
        }
    };

    const mergeImages = (photoUri, frameUri) => {
        console.log('Merging Images - Photo URI:', photoUri);
        console.log('Merging Images - Frame URI:', frameUri);

        return new Promise((resolve, reject) => {
            const canvas = new Canvas();
            const context = canvas.getContext('2d');

            const photo = new Canvas.Image();
            photo.src = photoUri;

            photo.onload = () => {
                canvas.width = photo.width;
                canvas.height = photo.height;
                context.drawImage(photo, 0, 0);

                const frame = new Canvas.Image();
                frame.src = frameUri;

                frame.onload = () => {
                    context.drawImage(frame, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/png');
                    const base64Image = dataUrl.split(',')[1];
                    const filePath = `${RNFS.CachesDirectoryPath}/final_image_${Date.now()}.png`;

                    RNFS.writeFile(filePath, base64Image, 'base64')
                        .then(() => resolve(filePath))
                        .catch((error) => reject(error));
                };

                frame.onerror = (e) => {
                    console.error('Frame load error:', e);
                    reject(new Error('Failed to load frame image.'));
                };
            };

            photo.onerror = (e) => {
                console.error('Photo load error:', e);
                reject(new Error('Failed to load photo image.'));
            };
        });
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
            {selectedFrame.uri && (
                <View style={StyleSheet.absoluteFill}>
                    <Image source={selectedFrame.uri} style={styles.frameImage} />
                </View>
            )}
            <View style={styles.frameSelectorContainer}>
                <FrameSelector
                    frames={frames}
                    selectedFrame={selectedFrame}
                    onSelectFrame={handleSelectFrame}
                />
            </View>
            {finalImage && (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: `file://${finalImage}` }} style={styles.previewImage} />
                    <TouchableOpacity onPress={() => savePhoto(finalImage)} style={styles.saveButton}>
                        <Text style={styles.buttonText}>Save Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => sharePhoto(finalImage)} style={styles.shareButton}>
                        <Text style={styles.buttonText}>Share Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setFinalImage(null)} style={styles.closeButton}>
                        <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    frameSelectorContainer: {
        position: 'absolute',
        bottom: 0,
        width: screenWidth,
        paddingHorizontal: 20,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    frameImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
        position: 'absolute',
        top: 0,
        left: 0,
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
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    shareButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    closeButton: {
        backgroundColor: '#dc3545',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
    },
});

export default CameraScreen;
