import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Image } from 'react-native';


const icons = [
    { id: 1, uri: require('../assets/icons/camera.png') },
    { id: 2, uri: require('../assets/icons/gallery.png') },
];


export default function HomeScreen({ navigation }) {
    const colorScheme = useColorScheme(); // Detect light or dark mode

    return (
        <View style={[styles.container, colorScheme === 'dark' ? styles.containerDark : styles.containerLight]}>
            <Text style={[styles.title, colorScheme === 'dark' ? styles.titleDark : styles.titleLight]}>Select an Option</Text>
            <View style={styles.iconContainer}>
                <TouchableOpacity
                    style={[styles.iconButton, colorScheme === 'dark' ? styles.iconButtonDark : styles.iconButtonLight]}
                    onPress={() => navigation.navigate('Camera')}
                >
                    {/* <Icon name="photo-camera" size={100} color={colorScheme === 'dark' ? '#fff' : '#000'} /> */}
                    <Image source={require('../assets/icons/camera.png')} style={styles.icons} />


                    <Text style={[styles.iconLabel, colorScheme === 'dark' ? styles.iconLabelDark : styles.iconLabelLight]}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.iconButton, colorScheme === 'dark' ? styles.iconButtonDark : styles.iconButtonLight]}
                    onPress={() => navigation.navigate('Gallery')}
                >
                     <Image source={require('../assets/icons/gallery.png')} style={styles.icons} />
                    {/* <Icon name="photo-library" size={100} color={colorScheme === 'dark' ? '#fff' : '#000'} /> */}
                    <Text style={[styles.iconLabel, colorScheme === 'dark' ? styles.iconLabelDark : styles.iconLabelLight]}>Gallery</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    containerLight: {
        backgroundColor: '#fff',
    },
    containerDark: {
        backgroundColor: '#000',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    titleLight: {
        color: '#000',
    },
    titleDark: {
        color: '#fff',
    },
    iconContainer: {
        alignItems: 'center',
        width: '100%',
        height:'auto'
    },
    iconButton: {
        alignItems: 'center',
        marginVertical: 20,
        // padding: 20,
        borderRadius: 10,
        width: '70%',
        height: '40%',
        paddingTop: 50
    },
    iconButtonLight: {
        backgroundColor: '#f0f0f0',
    },
    iconButtonDark: {
        backgroundColor: '#333',
    },
    iconLabel: {
        marginTop: 10,
        fontSize: 18,
        fontWeight: 'bold',
    },
    iconLabelLight: {
        color: '#000',
    },
    iconLabelDark: {
        color: '#fff',
    },
    icons: {
        width: "40%",
        height: "40%",
        margin:20,

    }
});
