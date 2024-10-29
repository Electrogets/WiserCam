import React, { useState, createRef,useEffect,useRef } from 'react';
import { View, Button, Image, StyleSheet, TouchableOpacity, Alert, ImageBackground, Dimensions, Platform, PermissionsAndroid,Linking } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import FrameSelector from './FrameSelector';
import Share from 'react-native-share';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ViewShot from 'react-native-view-shot';
import RNFS from 'react-native-fs';


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const dirPictures = `${RNFS.ExternalStorageDirectoryPath}/MyAppImages`;

const frames = [
    { id: 1, name: 'Frame 1', uri: require('../assets/frames/frame1.png') },
    { id: 1, name: 'Frame 2', uri: require('../assets/frames/frame2.png') },
    { id: 3, name: 'Frame 3', uri: require('../assets/frames/frame3.png') },
    { id: 4, name: 'Frame 4', uri: require('../assets/frames/frame4.png') },
    { id: 5, name: 'Frame 5', uri: require('../assets/frames/frame5.png') },

];

export default function GalleryScreen({ navigation }) {
    const [image, setImage] = useState(null);
    const [alertVisible, setAlertVisible] = useState(false);
    const [selectedFrame, setSelectedFrame] = useState(frames[0]);
    const viewShotRef = createRef(); // Create the reference 
    const alertTimeoutRef = useRef(null);
 
    
    useEffect(() => {
        return () => {
            if (alertTimeoutRef.current) {
                clearTimeout(alertTimeoutRef.current);
            }
        };
    }, []);

    const showTimedAlert = (message) => {
        setAlertVisible(true);
        Alert.alert(
            'Success',
            message,
            [{ text: 'OK', onPress: () => setAlertVisible(false) }],
            { cancelable: false }
        );

        // Set timeout to automatically close alert and return to camera after 2 seconds
        alertTimeoutRef.current = setTimeout(() => {
            setAlertVisible(false);
            selectImage();
        }, 2000);
    };


    useEffect(() => {
        // Launch image picker when component mounts
        selectImage();
    }, []);

    const handleNavigateBack = () => {
        // Check if navigation exists before using it
        if (navigation) {
            navigation.goBack();
        }
    };

    const selectImage = () => {
        const options = {
            mediaType: 'photo',
            quality: 1,
            selectionLimit: 1,
        };

        launchImageLibrary(options, response => {
            if (response.didCancel) {
                // If user cancels, go back to previous screen
                if (response.didCancel) {
                    handleNavigateBack();
                }
            } else if (response.assets && response.assets.length > 0) {
                setImage(response.assets[0].uri);
            } else if (response.errorCode) {
                Alert.alert('Error', 'Failed to select image from gallery.');
                handleNavigateBack();
            }
        });
    };

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

    const saveImage = async (uri) => {
        try {
            if (Platform.OS === 'android') {
                // Ensure the directory exists
                const directoryPath = await ensureDirectoryExists();
                
                // Generate unique filename
                const timestamp = new Date().getTime();
                const fileName = `WiserCamera_${timestamp}.png`;
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

                // Show timed alert and auto-return to camera
                showTimedAlert('Image saved successfully!');
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

    const captureAndSavePhoto = async () => {
        if (!viewShotRef.current) {
            Alert.alert("Error", "ViewShot reference is not available.");
            return;
        }

        try {
            // First check if permissions are already granted
            let hasPermission = await checkPermissions();
            console.log('Initial permission check:', hasPermission);

            if (!hasPermission) {
                // Request permissions if not already granted
                hasPermission = await requestPermissions();
                console.log('Permission after request:', hasPermission);
            }

            if (hasPermission) {
                // Capture the image
                console.log('Capturing image...');
                const uri = await viewShotRef.current.capture();
                console.log('Image captured:', uri);

                // Save the image
                await saveImage(uri);
            } else {
                Alert.alert(
                    'Permission Required',
                    'Please grant storage permission in Settings to save photos.',
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
        } catch (error) {
            console.error('Error in captureAndSavePhoto:', error);
            Alert.alert('Error', 'Failed to capture and save photo. Please try again.');
        }
    };


    const sharePhoto = async () => {
        try {
            if (!viewShotRef.current) {
                throw new Error('ViewShot reference not available');
            }

            const uri = await viewShotRef.current.capture();

            await Share.open({
                url: `file://${uri}`,
                title: 'Share Photo',
            });
        } catch (error) {
            console.error('Error sharing photo:', error);
            // Alert.alert('Error', 'Failed to share photo.');
        }
    };
    const closePreview = () => {
        // Clear any existing timeout
        if (alertTimeoutRef.current) {
            clearTimeout(alertTimeoutRef.current);
        }
        setselectImage();
        // setCompositeImage(null);

        setAlertVisible(false);
    };


    return (
        <View style={styles.container}>
            {image ? (
                <View style={styles.mainContainer}>
                    <ViewShot 
                        ref={viewShotRef} 
                        options={{ 
                            format: 'png', 
                            quality: 1,
                           
                        }}
                        style={styles.imageContainer}
                    >
                        <ImageBackground 
                            source={{ uri: image }} 
                            style={styles.fullImage}
                        >
                            {selectedFrame?.uri && (
                                <Image 
                                    source={selectedFrame.uri} 
                                    style={styles.frameImage}
                                />
                            )}
                        </ImageBackground>
                    </ViewShot>

                    <View style={styles.controlsContainer}>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={sharePhoto} style={styles.iconButton}>
                                <Icon name="share" size={35} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={captureAndSavePhoto} style={styles.iconButton}>
                                <Icon name="download" size={50} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={selectImage} style={styles.iconButton}>
                                <Icon name="close" size={35} color="white" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.frameSelectorContainer}>
                            <FrameSelector
                                frames={frames}
                                selectedFrame={selectedFrame}
                                onSelectFrame={setSelectedFrame}
                            />
                        </View>
                    </View>
                </View>
            ) : (
                // Show loading or empty state while image picker is launching
                <View style={styles.loadingContainer}>
                    {/* You can add a loading indicator here if desired */}
                </View>
            )}
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
        flex: 1,
        width: screenWidth,
        height: screenHeight,
    },
    fullImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    frameImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    frameSelectorContainer: {
        position: 'absolute',
        bottom: 0,
        width: screenWidth,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 60,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: screenWidth,
    },
    iconButton: {
        bottom:30,
        marginHorizontal: 15,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        borderRadius: 50,
    },
});
