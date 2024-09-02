import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { RNCamera } from 'react-native-camera';

const CameraPreview = ({ camera, takePicture }) => {
    return (
        <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
            <TouchableOpacity onPress={() => takePicture(camera)}>
                <Text style={{ fontSize: 14 }}>SNAP</Text>
            </TouchableOpacity>
        </View>
    );
};

export default CameraPreview;