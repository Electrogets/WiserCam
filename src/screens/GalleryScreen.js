import React, { useState, createRef } from 'react';
import { View, Button, Image, StyleSheet, TouchableOpacity, Alert, ImageBackground, Dimensions, Platform, PermissionsAndroid } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import FrameSelector from './FrameSelector';
import Share from 'react-native-share';
import CameraRoll from '@react-native-camera-roll/camera-roll';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ViewShot from 'react-native-view-shot';
import RNFS from 'react-native-fs';
import SendIntent from 'react-native-send-intent';
import moment from 'moment';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const dirPictures = `${RNFS.ExternalStorageDirectoryPath}/MyAppImages`;

const frames = [
    { id: 1, name: 'Frame 1', uri: require('../assets/frames/frame1.png') },
    { id: 3, name: 'Frame 3', uri: require('../assets/frames/frame3.png') },
    { id: 4, name: 'Frame 4', uri: require('../assets/frames/frame4.jpg') },
    { id: 5, name: 'Frame 5', uri: require('../assets/frames/frame5.png') },
    { id: 6, name: 'Frame 6', uri: require('../assets/frames/frame6.png') }
];

export default function GalleryScreen() {
    const [image, setImage] = useState(null);
    const [selectedFrame, setSelectedFrame] = useState(frames[0]);
    const viewShotRef = createRef(); // Create the reference 


    const selectImage = () => {
        launchImageLibrary({}, response => {
            if (response.assets) {
                setImage(response.assets[0].uri);
            } else if (response.errorCode) {
                Alert.alert('Error', 'Failed to select image from gallery.');
            }
        });
    };

    const requestStoragePermission = async () => {
        try {
            if (Platform.OS === 'android') {
                const writeGranted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission',
                        message: 'App needs access to your storage to save photos.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
    
                if (writeGranted === PermissionsAndroid.RESULTS.GRANTED) {
                    // Check Android version and ask for MANAGE_EXTERNAL_STORAGE for Android 11+
                    if (Platform.Version >= 29) { // Android 11 or higher
                        const manageGranted = await PermissionsAndroid.request(
                            PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE,
                            {
                                title: 'Manage External Storage',
                                message: 'App needs access to manage files in storage.',
                                buttonNeutral: 'Ask Me Later',
                                buttonNegative: 'Cancel',
                                buttonPositive: 'OK',
                            }
                        );
    
                        if (manageGranted === PermissionsAndroid.RESULTS.GRANTED) {
                            console.log('Manage External Storage permission granted.');
                            return true;
                        } else {
                            Alert.alert('Permission Denied', 'Manage External Storage permission is required.');
                            return false;
                        }
                    }
                    console.log('Write External Storage permission granted.');
                    return true;
                } else {
                    Alert.alert('Permission Denied', 'Write External Storage permission is required.');
                    return false;
                }
            }
            return true; // iOS does not need this permission
        } catch (err) {
            console.warn('Error requesting permissions:', err);
            return false;
        }
    };

    const captureAndSavePhoto = async () => {
        if (!viewShotRef.current) {
            Alert.alert("Error", "ViewShot reference is not available.");
            return;
        }
    
        try {
            const uri = await viewShotRef.current.capture(); // Capture the image
            console.log("Captured Image URI:", uri);
    
            // Request storage permission
            const permissionGranted = await requestStoragePermission();
            if (!permissionGranted) {
                Alert.alert("Permission Required", "Please grant storage permission to save photos.");
                return;
            }
    
            // Save the captured image to external storage
            await saveImage(uri);
        } catch (error) {
            console.error("Error capturing and saving photo:", error);
            Alert.alert("Error", "Failed to capture and save photo.");
        }
    };

    const saveImage = async (uri) => {
        try {
            const fileName = `image_${Date.now()}.png`;
            const destPath = `${RNFS.PicturesDirectoryPath}/${fileName}`;
    
            // Copy the image from cache to the Pictures directory
            await RNFS.copyFile(uri, destPath);
            console.log("Image saved to:", destPath);
    
            // Save to CameraRoll
            await CameraRoll.save(destPath, { type: 'photo' });
            console.log("Image saved to CameraRoll");
    
            Alert.alert("Success", "Image saved to external storage!");
        } catch (error) {
            console.error("Error saving image:", error);
            Alert.alert("Error", "Failed to save image.");
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
            Alert.alert('Error', 'Failed to share photo.');
        }
    };

    return (
        <View style={styles.container}>
            {!image ? (
                <Button title="Select Image" onPress={selectImage} />
            ) : (
                <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }} style={styles.imageContainer}>
                    <ImageBackground source={{ uri: image }} style={styles.fullImage}>
                        {selectedFrame?.uri && (
                            <Image source={selectedFrame.uri} style={styles.frameImage} />
                        )}
                    </ImageBackground>
    
                    {/* Frame selector at the bottom */}
                    <View style={styles.frameSelectorContainer}>
                        <FrameSelector
                            frames={frames}
                            selectedFrame={selectedFrame}
                            onSelectFrame={setSelectedFrame}
                        />
                    </View>
    
                    {/* Options to save, share, or reset */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={sharePhoto} style={styles.iconButton}>
                            <Icon name="share" size={35} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={captureAndSavePhoto} style={styles.iconButton}>
                            <Icon name="download" size={50} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setImage(null)} style={styles.iconButton}>
                            <Icon name="close" size={35} color="white" />
                        </TouchableOpacity>
                    </View>
                </ViewShot>
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
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        backgroundColor: '#000',
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
        marginHorizontal: 15,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        borderRadius: 50,
    },
});
