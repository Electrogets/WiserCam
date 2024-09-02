import React from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { savePicture } from '../utils/fileUtils';

const SavePictureScreen = ({ route, navigation }) => {
    const { imageUri } = route.params;

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Image source={{ uri: imageUri }} style={{ width: 300, height: 400 }} />
            <TouchableOpacity onPress={() => savePicture(imageUri)}>
                <Text style={{ fontSize: 16 }}>Save to Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('GalleryScreen')}>
                <Text style={{ fontSize: 16 }}>Go to Gallery</Text>
            </TouchableOpacity>
        </View>
    );
};

export default SavePictureScreen;
