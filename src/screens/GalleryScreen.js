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
import moment from 'moment'; // For date formatting

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: "Storage Permission",
                    message: "This app needs access to your storage to save photos.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn(err);
            return false;
        }
    };

    // const captureAndSavePhoto = async () => {
    //     if (!viewShotRef.current) {
    //         Alert.alert("Error", "ViewShot reference is not available.");
    //         return;
    //     }
    
    //     try {
    //         const uri = await viewShotRef.current.capture(); // Capture the shot
    //         console.log("Image URI:", uri);
    
    //         // Request storage permission before saving
    //         const permissionGranted = await requestStoragePermission();
    //         if (!permissionGranted) return;
    
    //         // Save the captured image to the camera roll
    //         await CameraRoll.save(uri, { type: 'photo' });
    //         Alert.alert("Success", "Photo saved successfully!");
    
    //     } catch (error) {
    //         console.error("Error saving photo:", error);
    //         Alert.alert("Error", "Failed to save photo. Please try again.");
    //     }
    // };
    
   
    const captureAndSavePhoto = async () => {
        if (!viewShotRef.current) {
            Alert.alert("Error", "ViewShot reference is not available.");
            return;
        }
    
        try {
            // Step 1: Capture the image
            const uri = await viewShotRef.current.capture();
            console.log("Captured Image URI:", uri);
    
            // Request storage permission
            const permissionGranted = await requestStoragePermission();
            if (!permissionGranted) {
                console.log("Permission not granted!");
                return;
            }
    
            // Step 2: Ensure the captured URI is usable by removing 'file://'
            const filePath = uri.replace('file://', ''); // Remove 'file://' prefix for RNFS
            console.log("File path without 'file://':", filePath);
    
            // Define the directory and file name for saving the image
            const dirPictures = `${RNFS.ExternalStorageDirectoryPath}/Pictures/MyAppImages`; // Create a custom folder in Pictures
            const newImageName = `${moment().format('DDMMYY_HHmmSSS')}.jpg`;
            const newFilepath = `${dirPictures}/${newImageName}`;
            console.log("Saving image to:", newFilepath);
    
            // Step 3: Create the directory if it doesn't exist
            const dirExists = await RNFS.exists(dirPictures);
            if (!dirExists) {
                await RNFS.mkdir(dirPictures);
                console.log("Created directory:", dirPictures);
            }
    
            // Step 4: Move the captured image to external storage using your custom logic
            await saveImage(filePath, newFilepath);
    
            // Step 5: Save to CameraRoll
            await CameraRoll.save(newFilepath, { type: 'photo' });
            console.log("Image saved to CameraRoll");
    
            // Step 6: Trigger media scan for updating the gallery
            await SendIntent.send('android.intent.action.MEDIA_SCANNER_SCAN_FILE', {
                uri: 'file://' + newFilepath, // Add 'file://' back for media scanning
            });
            console.log("Media scan triggered for:", newFilepath);
    
            Alert.alert("Success", "Photo saved successfully with frame overlay!");
        } catch (error) {
            console.error("Error saving photo:", error);
            Alert.alert("Error", `Failed to save photo. Error: ${error.message}`);
        }
    };
    
    // Save Image Function Using the Logic You Provided
    const saveImage = async (filePath, newFilepath) => {
        try {
            console.log(`Moving image from ${filePath} to ${newFilepath}`);
            // Move and save image to new file path
            await RNFS.moveFile(filePath, newFilepath);
            console.log('Image moved to:', newFilepath);
            return true; // Return true if successful
        } catch (error) {
            console.error("Error moving file:", error);
            throw error; // Rethrow the error to be handled in the calling function
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
