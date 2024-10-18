import React, { useState, useEffect, useRef } from 'react';
import {
    View, StyleSheet, Alert, Text, Image, Dimensions, TouchableOpacity,
    Platform, Linking, PermissionsAndroid, ImageBackground
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import FrameSelector from './FrameSelector';
import ViewShot from "react-native-view-shot";
import Icon from 'react-native-vector-icons/MaterialIcons';
import CameraRoll from '@react-native-camera-roll/camera-roll';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const frames = [
    { id: 1, name: 'Frame 1', uri: require('../assets/frames/frame1.png') },
    { id: 2, name: 'Frame 2', uri: require('../assets/frames/frame2.png') },
    { id: 3, name: 'Frame 3', uri: require('../assets/frames/frame3.png') },
    { id: 4, name: 'Frame 4', uri: require('../assets/frames/frame4.jpg') },
];

const CameraScreen = () => {
    const [selectedFrame, setSelectedFrame] = useState(frames[0]);
    const [finalImage, setFinalImage] = useState(null);
    const cameraRef = useRef(null);
    const viewShotRef = useRef(null);

    const device = useCameraDevice('back');
    const { hasPermission, requestPermission } = useCameraPermission();

    useEffect(() => {
        const requestCameraPermission = async () => {
            if (hasPermission === 'denied') {
                Alert.alert(
                    'Camera Permission Required',
                    'Camera permission is required to take photos. Please enable it in Settings.',
                    [
                        {
                            text: 'Open Settings',
                            onPress: () => {
                                if (Platform.OS === 'android') {
                                    Linking.openSettings();
                                } else {
                                    Linking.openURL('app-settings:');
                                }
                            },
                        },
                        { text: 'Cancel', style: 'cancel' },
                    ]
                );
            } else if (!hasPermission) {
                await requestPermission();
            }
        };
        requestCameraPermission();
    }, [hasPermission, requestPermission]);

    async function requestStoragePermission() {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                ]);
                return (
                    granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
                    granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
                );
            }
            return true;
        } catch (err) {
            console.warn(err);
            return false;
        }
    }

    const takePicture = async () => {
        if (!cameraRef.current || !viewShotRef.current) {
            Alert.alert('Error', 'Camera not ready or ViewShot not initialized.');
            return;
        }

        try {
            const uri = await viewShotRef.current.capture(); // Capture the screen (camera + frame)
            setFinalImage(uri); // Save the captured image URI for preview
        } catch (error) {
            console.error('Error capturing image:', error);
            Alert.alert('Error', 'Failed to capture image.');
        }
    };

    const savePhoto = async () => {
        if (!finalImage) return;

        const permissionGranted = await requestStoragePermission();
        if (!permissionGranted) {
            Alert.alert('Permission Denied', 'Storage permission is required to save photos.');
            return;
        }

        try {
            const savePath = `${RNFS.PicturesDirectoryPath}/myImage_${Date.now()}.png`;
            await RNFS.moveFile(finalImage, savePath);
            await CameraRoll.save(savePath, { type: 'photo' });

            Alert.alert('Success', 'Photo saved successfully!');
        } catch (error) {
            console.error('Error saving photo:', error);
            Alert.alert('Error', 'Failed to save photo.');
        }
    };

    const sharePhoto = async () => {
        if (!finalImage) return;

        try {
            await Share.open({ url: finalImage, title: 'Share Photo' });
        } catch (error) {
            console.error('Error sharing photo:', error);
            Alert.alert('Error', 'Failed to share photo.');
        }
    };

    const handleSelectFrame = (frame) => {
        setSelectedFrame(frame); // Update selected frame
    };

    if (!device) {
        return <View style={styles.container}><Text>Loading Camera...</Text></View>;
    }

    return (
        <View style={styles.container}>
            <ViewShot ref={viewShotRef} style={styles.cameraContainer} options={{ format: 'png', quality: 1 }}>
                <Camera
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={true}
                    photo={true}
                    ref={cameraRef}
                />
                {selectedFrame?.uri && (
                    <Image source={selectedFrame.uri} style={styles.frameImage} />
                )}
            </ViewShot>

            <View style={styles.controlsContainer}>
                <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
                    <Icon name="photo-camera" size={50} color='white' />
                </TouchableOpacity>
            </View>

            <View style={styles.frameSelectorContainer}>
                <FrameSelector frames={frames} selectedFrame={selectedFrame} onSelectFrame={handleSelectFrame} />
            </View>

            {finalImage && (
                <View style={styles.previewContainer}>
                    <ImageBackground source={{ uri: finalImage }} style={styles.capturedImage} />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={sharePhoto} style={styles.iconButton}>
                            <Icon name="share" size={35} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={savePhoto} style={styles.iconButton}>
                            <Icon name="download" size={50} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setFinalImage(null)} style={styles.iconButton}>
                            <Icon name="close" size={35} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    cameraContainer: { flex: 1, marginBottom: 90 },
    controlsContainer: {
        position: 'absolute', bottom: 100, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center',
    },
    captureButton: {
        backgroundColor: 'rgba(0,0,0,0.7)', padding: 15, borderRadius: 50, borderWidth: 1, borderColor: 'white',
    },
    frameSelectorContainer: {
        position: 'absolute', bottom: 0, width: screenWidth, borderTopWidth: 1, borderTopColor: '#ddd',
    },
    frameImage: {
        width: '100%', height: '100%', resizeMode: 'cover', position: 'absolute', top: 0,
    },
    previewContainer: {
        ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)',
    },
    capturedImage: { width: '100%', height: '100%', resizeMode: 'contain' },
    buttonContainer: {
        position: 'absolute', bottom: 30, flexDirection: 'row', justifyContent: 'space-evenly', width: '100%',
    },
    iconButton: {
        backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 50,
    },
});

export default CameraScreen;
