import React from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import Share from 'react-native-share';

const ShareScreen = ({ route }) => {
    const { imageUri } = route.params;

    const sharePicture = async () => {
        try {
            await Share.open({
                url: imageUri,
                type: 'image/jpeg',
            });
        } catch (error) {
            console.error('Error sharing picture:', error);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Image source={{ uri: `file://${imageUri}` }} style={{ width: 300, height: 400 }} />
            <TouchableOpacity onPress={sharePicture}>
                <Text style={{ fontSize: 16 }}>Share</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ShareScreen;
