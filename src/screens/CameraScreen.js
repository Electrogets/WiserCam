import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Text, Image, Dimensions, TouchableOpacity, Platform, Linking, PermissionsAndroid,ImageBackground } from 'react-native'; // Added PermissionsAndroid
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import FrameSelector from './FrameSelector';
import ViewShot from "react-native-view-shot";

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
                                    Linking.openSettings();
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


    // Function to request storage permission
    const requestStoragePermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission',
                        message: 'This app needs access to your storage to save photos.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );

                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('Storage permission granted');
                } else {
                    Alert.alert('Permission Denied', 'Storage permission is required to save photos.');
                }
            } catch (err) {
                console.warn(err);
            }
        }
    };

    // Call this function in your main component or useEffect
    useEffect(() => {
        requestStoragePermission();
    }, []);



    const handleSelectFrame = (frame) => {
        setSelectedFrame(frame);  // Set the selected frame when user selects a frame
        console.log('Selected Frame:', frame);
    };

    const takePicture = async () => {
        try {
            if (!cameraRef.current) {
                console.log('Camera reference not set');
                return;
            }

            // Capture the camera image
            const photo = await cameraRef.current.takePhoto({
                qualityPrioritization: 'balanced',
                flash: 'off',
            });

            console.log('Camera image captured:', photo.path);

            // Set the captured camera image as the background
            setFinalImage(photo.path); // Save the image path for display

            Alert.alert('Success', 'Photo captured with frame!', [{ text: 'OK' }]);
        } catch (error) {
            console.error('Error capturing image with frame:', error);
            Alert.alert('Error', 'Failed to capture image with frame.');
        }
    };


    const savePhoto = async (path) => {
        // Request storage permission before saving
        const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);

        if (!hasPermission) {
            Alert.alert('Permission Required', 'Storage permission is required to save photos.');
            return;
        }

        try {
            // Generate a new filename
            const filename = `photo_${new Date().toISOString()}.jpg`;
            const newPath = `${RNFS.PicturesDirectoryPath}/${filename}`;

            // Move the captured image to the Pictures directory
            await RNFS.moveFile(path, newPath);

            Alert.alert('Success', 'Photo saved successfully to Pictures directory.');
        } catch (error) {
            console.error('Error saving photo:', error);
            Alert.alert('Error', 'Failed to save photo. Please check permissions.');
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
        setFinalImage(null); // Hide the preview and go back to the camera
    };

    if (hasPermission === 'denied') {
        return <View style={styles.container}><Text>Camera permission is required.</Text></View>;
    }

    if (!device) {
        return <View style={styles.container}><Text>Loading Camera...</Text></View>;
    }

    return (
        <View style={styles.container}>
            {/* Ensure camera and frames are captured */}
            <ViewShot ref={viewShotRef} style={styles.cameraContainer} options={{ format: 'png', quality: 1 }}>
                <Camera
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={true}
                    photo={true}
                    ref={cameraRef}
                />
                {/* Render the selected frame over the camera */}
                {selectedFrame?.uri && (
                    <Image source={selectedFrame.uri} style={styles.frameImage} />
                )}
            </ViewShot>

            {/* Controls for capturing the image */}
            <View style={styles.controlsContainer}>
                <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
                    <Text style={styles.buttonText}>Capture</Text>
                </TouchableOpacity>
            </View>

            {/* Frame selector at the bottom */}
            <View style={styles.frameSelectorContainer}>
                <FrameSelector
                    frames={frames}
                    selectedFrame={selectedFrame}
                    onSelectFrame={handleSelectFrame}
                />
            </View>

            {/* Image preview section */}
            {finalImage && (
                <View style={styles.previewContainer}>
                    <ImageBackground source={{ uri: `file://${finalImage}` }} style={styles.capturedImage}>
                        {/* Overlay the selected frame */}
                        {selectedFrame?.uri && (
                            <Image source={selectedFrame.uri} style={styles.frameImage} />
                        )}
                    </ImageBackground>
                    <TouchableOpacity onPress={() => savePhoto(finalImage)} style={styles.saveButton}>
                        <Text style={styles.buttonText}>Save Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => sharePhoto(finalImage)} style={styles.shareButton}>
                        <Text style={styles.buttonText}>Share Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={closePreview} style={styles.closeButton}>
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
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: 'black',
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
        resizeMode: 'cover',
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
    capturedImage: {
        width: screenWidth * 0.8,
        height: screenWidth * 0.8,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    saveButton: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    shareButton: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    closeButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'black',
        fontWeight: 'bold',
    },
});

export default CameraScreen;






// import React, { useState, useRef, useEffect } from 'react';
// import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
// import { Camera, useCameraDevices } from 'react-native-vision-camera';
// import { useSharedValue, useAnimatedProps } from 'react-native-reanimated';
// import { Gesture, GestureDetector } from 'react-native-gesture-handler';
// import CameraRoll from '@react-native-camera-roll/camera-roll';

// const filters = {
//   none: { saturation: 1, brightness: 1, contrast: 1 },
//   sepia: { saturation: 0.5, brightness: 1.1, contrast: 1.2 },
//   grayscale: { saturation: 0, brightness: 1, contrast: 1.2 },
//   inverted: { saturation: 1, brightness: 1, contrast: 1, isInverted: true },
// };

// const CameraScreen = () => {
//   const [currentFilter, setCurrentFilter] = useState('none');
//   const camera = useRef(null);
//   const devices = useCameraDevices();
//   const device = devices.front;

//   const [hasPermission, setHasPermission] = useState(false);

//   useEffect(() => {
//     (async () => {
//       const status = await Camera.requestCameraPermission();
//       setHasPermission(status === 'authorized');
//     })();
//   }, []);

//   const captureImage = async () => {
//     if (camera.current) {
//       const photo = await camera.current.takePhoto({
//         qualityPrioritization: 'quality',
//         flash: 'off',
//         enableAutoRedEyeReduction: true,
//       });
//       console.log('Picture taken:', photo.path);
//       await CameraRoll.save(`file://${photo.path}`, { type: 'photo' });
//     }
//   };

//   const saturation = useSharedValue(1);
//   const brightness = useSharedValue(1);
//   const contrast = useSharedValue(1);
//   const isInverted = useSharedValue(0);

//   const animatedProps = useAnimatedProps(() => ({
//     saturation: saturation.value,
//     brightness: brightness.value,
//     contrast: contrast.value,
//     isInverted: isInverted.value,
//   }));

//   const applyFilter = (filterName) => {
//     const filter = filters[filterName];
//     saturation.value = filter.saturation;
//     brightness.value = filter.brightness;
//     contrast.value = filter.contrast;
//     isInverted.value = filter.isInverted ? 1 : 0;
//     setCurrentFilter(filterName);
//   };

//   if (!hasPermission || !device) {
//     return <View style={styles.container}><Text>No access to camera</Text></View>;
//   }

//   return (
//     <View style={styles.container}>
//       <Camera
//         ref={camera}
//         style={StyleSheet.absoluteFill}
//         device={device}
//         isActive={true}
//         photo={true}
//         animatedProps={animatedProps}
//       />
//       <View style={styles.filterContainer}>
//         {Object.keys(filters).map((filter) => (
//           <TouchableOpacity
//             key={filter}
//             style={[styles.filterButton, currentFilter === filter && styles.activeFilter]}
//             onPress={() => applyFilter(filter)}
//           >
//             <Text style={styles.filterText}>{filter}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//       <TouchableOpacity style={styles.captureButton} onPress={captureImage}>
//         <Text style={styles.captureText}>Capture</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
//   filterContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     position: 'absolute',
//     bottom: 100,
//     left: 0,
//     right: 0,
//   },
//   filterButton: {
//     padding: 10,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.5)',
//   },
//   activeFilter: {
//     backgroundColor: 'rgba(255, 255, 255, 0.8)',
//   },
//   filterText: {
//     color: 'black',
//   },
//   captureButton: {
//     position: 'absolute',
//     bottom: 30,
//     alignSelf: 'center',
//     backgroundColor: 'white',
//     padding: 15,
//     borderRadius: 30,
//   },
//   captureText: {
//     color: 'black',
//   },
// });

// export default CameraScreen;