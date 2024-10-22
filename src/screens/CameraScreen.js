import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Image, Dimensions, TouchableOpacity, Platform, Linking, PermissionsAndroid, ImageBackground ,Text} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import FrameSelector from './FrameSelector';
import ViewShot from "react-native-view-shot";
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const frames = [
    { id: 1, name: 'Frame 1', uri: require('../assets/frames/frame1.png') },
    { id: 2, name: 'Frame 2', uri: require('../assets/frames/frame2.png') },
    { id: 3, name: 'Frame 3', uri: require('../assets/frames/frame3.png') },
    { id: 4, name: 'Frame 4', uri: require('../assets/frames/frame4.jpg') },
    { id: 5, name: 'Frame 5', uri: require('../assets/frames/frame5.png') },
    { id: 6, name: 'Frame 6', uri: require('../assets/frames/frame6.png') },
];

const CameraScreen = () => {
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('back');
    const [selectedFrame, setSelectedFrame] = useState(frames[0]);
    const [finalImage, setFinalImage] = useState(null);
    const cameraRef = useRef(null);
    const viewShotRef = useRef(null);

    const checkPermissions = async () => {
        try {
            if (Platform.OS !== 'android') return true;

            if (Platform.Version >= 33) {
                const readImagesPermission = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                );
                console.log('READ_MEDIA_IMAGES permission:', readImagesPermission);
                return readImagesPermission;
            } else {
                const writePermission = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
                );
                console.log('WRITE_EXTERNAL_STORAGE permission:', writePermission);
                return writePermission;
            }
        } catch (error) {
            console.error('Error checking permissions:', error);
            return false;
        }
    };

    const requestPermissions = async () => {
        try {
            if (Platform.OS !== 'android') return true;

            if (Platform.Version >= 33) {
                const result = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                );
                return result === PermissionsAndroid.RESULTS.GRANTED;
            } else {
                const result = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
                );
                return result === PermissionsAndroid.RESULTS.GRANTED;
            }
        } catch (error) {
            console.error('Error requesting permissions:', error);
            return false;
        }
    };

    const ensureDirectoryExists = async () => {
        try {
            const directoryPath = `${RNFS.ExternalStorageDirectoryPath}/Pictures/MyApp`;
            const exists = await RNFS.exists(directoryPath);
            
            if (!exists) {
                await RNFS.mkdir(directoryPath);
                console.log('Directory created successfully');
            }
            
            return directoryPath;
        } catch (error) {
            console.error('Error creating directory:', error);
            throw error;
        }
    };

    const savePhoto = async (uri) => {
        try {
            if (Platform.OS === 'android') {
                // Ensure the directory exists
                const directoryPath = await ensureDirectoryExists();
                
                // Generate unique filename
                const timestamp = new Date().getTime();
                const fileName = `MyApp_${timestamp}.png`;
                const destinationPath = `${directoryPath}/${fileName}`;

                console.log('Saving image to:', destinationPath);

                // Copy the file
                await RNFS.copyFile(uri, destinationPath);
                console.log('File copied successfully');

                // Make the image visible in the gallery
                try {
                    await RNFS.scanFile(destinationPath);
                    console.log('File scanned successfully');
                } catch (scanError) {
                    console.warn('Error scanning file:', scanError);
                    // Continue even if scanning fails
                }

                Alert.alert(
                    'Success',
                    'Image saved successfully to Pictures/MyApp folder!',
                    [
                        {
                            text: 'OK',
                            onPress: () => console.log('Image saved alert closed')
                        }
                    ]
                );
            } else {
                // For iOS, implement alternative saving method if needed
                Alert.alert('Error', 'Image saving not implemented for iOS');
            }
        } catch (error) {
            console.error('Error in saveImage:', error);
            Alert.alert(
                'Error',
                'Failed to save image. Please make sure storage permissions are granted.',
                [
                    {
                        text: 'Open Settings',
                        onPress: () => Linking.openSettings()
                    },
                    {
                        text: 'Cancel',
                        style: 'cancel'
                    }
                ]
            );
        }
    };

 

    const handleSelectFrame = (frame) => {
        setSelectedFrame(frame);  
        console.log('Selected Frame:', frame);
    };

    const takePicture = async () => {
        try {
            if (!cameraRef.current) {
                console.log('Camera reference not set');
                return;
            }

            const photo = await cameraRef.current.takePhoto({
                qualityPrioritization: 'balanced',
                flash: 'off',
            });

            console.log('Camera image captured:', photo.path);
            setFinalImage(photo.path); 
            // Alert.alert('Success', 'Photo captured with frame!', [{ text: 'OK' }]);
        } catch (error) {
            console.error('Error capturing image with frame:', error);
            Alert.alert('Error', 'Failed to capture image with frame.');
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

    const closePreview = () => {
        setFinalImage(null);
    };

    if (hasPermission === 'denied') {
        return <View style={styles.container}><Text>Camera permission is required.</Text></View>;
    }

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
                <Icon name="camera" size={50} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.frameSelectorContainer}>
                <FrameSelector
                    frames={frames}
                    selectedFrame={selectedFrame}
                    onSelectFrame={handleSelectFrame}
                />
            </View>

            {finalImage && (
                <View style={styles.previewContainer}>
                    <ImageBackground source={{ uri: `file://${finalImage}` }} style={styles.fullScreenImage}>
                        {selectedFrame?.uri && (
                            <Image source={selectedFrame.uri} style={styles.fullScreenImage} />
                        )}
                    </ImageBackground>

                    <View style={styles.iconContainer}>
                       
                        <TouchableOpacity onPress={() => sharePhoto(finalImage)} style={styles.iconButton}>
                            <Icon name="share" size={35} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => savePhoto(finalImage)} style={styles.iconButton}>
                            <Icon name="download" size={50} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={closePreview} style={styles.iconButton}>
                            <Icon name="close" size={35} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    cameraContainer: {
        flex: 1,
    },
    controlsContainer: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    captureButton: {
        backgroundColor:  'rgba(0,0,0,0.6)',
        padding: 15,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: 'black',
    },
    frameSelectorContainer: {
        position: 'absolute',
        bottom: 0,
        width: screenWidth,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        backgroundColor: 'rgba(0,0,0,0.8)',
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
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    fullScreenImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    iconContainer: {
            position: 'absolute',
            bottom: 60,
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            width: screenWidth,
    },
    iconButton: {
            marginHorizontal: 15,
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: 10,
            borderRadius: 50,
        

    },
});

export default CameraScreen;
