import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    StyleSheet, 
    Alert, 
    Image, 
    Dimensions, 
    TouchableOpacity, 
    Platform, 
    Linking, 
    PermissionsAndroid, 
    ImageBackground, 
    Text 
} from 'react-native';
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
    { id: 4, name: 'Frame 4', uri: require('../assets/frames/frame4.png') },
    { id: 5, name: 'Frame 5', uri: require('../assets/frames/frame5.png') },

];

const CameraScreen = () => {
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('back');
    const [selectedFrame, setSelectedFrame] = useState(frames[0]);
    const [finalImage, setFinalImage] = useState(null);
    const [compositeImage, setCompositeImage] = useState(null);
    const [alertVisible, setAlertVisible] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const cameraRef = useRef(null);
    const viewShotRef = useRef(null);
    const previewViewShotRef = useRef(null);
    const alertTimeoutRef = useRef(null);

    useEffect(() => {
        const initializeCamera = async () => {
            try {
                if (!hasPermission) {
                    const permission = await requestPermission();
                    if (permission === 'authorized') {
                        setIsCameraReady(true);
                    } else {
                        Alert.alert(
                            'Camera Permission Required',
                            'Please grant camera permission to use this feature.',
                            [
                                {
                                    text: 'Open Settings',
                                    onPress: () => Linking.openSettings()
                                },
                                { text: 'Cancel', style: 'cancel' }
                            ]
                        );
                    }
                } else {
                    setIsCameraReady(true);
                }

                if (Platform.OS === 'android') {
                    const storagePermission = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                        {
                            title: 'Storage Permission Required',
                            message: 'This app needs access to your storage to save photos',
                            buttonNeutral: 'Ask Me Later',
                            buttonNegative: 'Cancel',
                            buttonPositive: 'OK',
                        }
                    );
                    
                    if (storagePermission !== PermissionsAndroid.RESULTS.GRANTED) {
                        // Alert.alert('Storage permission is required to save images.');
                    }
                }
            } catch (err) {
                console.error('Error initializing camera:', err);
                Alert.alert('Error', 'Failed to initialize camera.');
            }
        };

        initializeCamera();

        const unsubscribe = Linking.addEventListener('url', async () => {
            const cameraPermission = await requestPermission();
            if (cameraPermission === 'authorized') {
                setIsCameraReady(true);
            }
        });

        return () => {
            unsubscribe.remove();
            if (alertTimeoutRef.current) {
                clearTimeout(alertTimeoutRef.current);
            }
        };  
    }, [hasPermission, requestPermission]);

    useEffect(() => {
        if (hasPermission) {
            setIsCameraReady(true);
        }
    }, [hasPermission]);

    const showTimedAlert = (message) => {
        setAlertVisible(true);
        Alert.alert(
            'Success',
            message,
            [{ text: 'OK', onPress: () => setAlertVisible(false) }],
            { cancelable: false }
        );

        alertTimeoutRef.current = setTimeout(() => {
            setAlertVisible(false);
            closePreview();
        }, 2000);
    };

    const ensureDirectoryExists = async () => {
        try {
            const directoryPath = `${RNFS.ExternalStorageDirectoryPath}/Pictures/MyApp`;
            const exists = await RNFS.exists(directoryPath);
            
            if (!exists) {
                await RNFS.mkdir(directoryPath);
            }
            
            return directoryPath;
        } catch (error) {
            console.error('Error creating directory:', error);
            throw error;
        }
    };

    const savePhoto = async () => {
        try {
            if (!previewViewShotRef.current) {
                console.log('Preview ViewShot reference not set');
                return;
            }

            const uri = await previewViewShotRef.current.capture();
            console.log('Captured composite image URI:', uri);

            if (Platform.OS === 'android') {
                const directoryPath = await ensureDirectoryExists();
                const timestamp = new Date().getTime();
                const fileName = `MyApp_${timestamp}.png`;
                const destinationPath = `${directoryPath}/${fileName}`;

                await RNFS.copyFile(uri, destinationPath);

                try {
                    await RNFS.scanFile(destinationPath);
                    console.log('File scanned successfully');
                    showTimedAlert('Image saved successfully!');
                } catch (scanError) {
                    console.warn('Error scanning file:', scanError);
                    Alert.alert('Error', 'Failed to save image to gallery.');
                }
            } else {
                // For iOS implementation
                Alert.alert('Error', 'Image saving not implemented for iOS');
            }
        } catch (error) {
            console.error('Error in savePhoto:', error);
            Alert.alert(
                'Error',
                'Failed to save image. Please check permissions.',
                [
                    {
                        text: 'Open Settings',
                        onPress: () => Linking.openSettings()
                    },
                    { text: 'Cancel', style: 'cancel' }
                ]
            );
        }
    };

    const sharePhoto = async () => {
        try {
            if (!previewViewShotRef.current) return;

            const uri = await previewViewShotRef.current.capture();
            await Share.open({
                url: `file://${uri}`,
                title: 'Share Photo',
            });
        } catch (error) {
            if (error.message !== 'User did not share') {
                console.error('Error sharing photo:', error);
                Alert.alert('Error', 'Failed to share photo.');
            }
        }
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
        } catch (error) {
            console.error('Error capturing image:', error);
            Alert.alert('Error', 'Failed to capture image.');
        }
    };

    const handleSelectFrame = (frame) => {
        setSelectedFrame(frame);
        console.log('Selected Frame:', frame);
    };

    const closePreview = () => {
        if (alertTimeoutRef.current) {
            clearTimeout(alertTimeoutRef.current);
        }
        setFinalImage(null);
        setCompositeImage(null);
        setAlertVisible(false);
    };

    return (
        <View style={styles.container}>
            {isCameraReady && device ? (
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
            ) : (
                <View style={[styles.cameraContainer, styles.loadingContainer]}>
                    <Text style={styles.loadingText}>Initializing camera...</Text>
                </View>
            )}

            {isCameraReady && device && (
                <>
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
                </>
            )}

            {finalImage && !alertVisible && (
                <View style={styles.previewContainer}>
                    <ViewShot
                        ref={previewViewShotRef}
                        style={styles.fullScreenImage}
                        options={{ format: 'png', quality: 1 }}
                    >
                        <ImageBackground 
                            source={{ uri: `file://${finalImage}` }} 
                            style={styles.fullScreenImage}
                        >
                            {selectedFrame?.uri && (
                                <Image 
                                    source={selectedFrame.uri} 
                                    style={styles.fullScreenImage} 
                                />
                            )}
                        </ImageBackground>
                    </ViewShot>

                    <View style={styles.iconContainer}>
                        <TouchableOpacity onPress={sharePhoto} style={styles.iconButton}>
                            <Icon name="share" size={35} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={savePhoto} style={styles.iconButton}>
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
        backgroundColor: '#000',
    },
    cameraContainer: {
        flex: 1,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    loadingText: {
        color: 'white',
        fontSize: 16,
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
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 15,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: 'black',
    },
    frameSelectorContainer: {
        position: 'absolute',
        bottom: 0,
        width: screenWidth,
        // borderTopWidth: 1,
        // borderTopColor: '#ddd',
        
      
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