import RNFS from 'react-native-fs';

export const savePicture = async (imageUri) => {
    const filePath = `${RNFS.PicturesDirectoryPath}/MyApp/${Date.now()}.jpg`;
    try {
        await RNFS.copyFile(imageUri, filePath);
        alert('Picture saved to gallery!');
    } catch (error) {
        console.error('Error saving picture:', error);
    }
};
