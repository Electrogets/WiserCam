import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
                    <Icon name="photo-camera" size={100} color={colorScheme === 'dark' ? '#fff' : '#000'} />
                    <Text style={[styles.iconLabel, colorScheme === 'dark' ? styles.iconLabelDark : styles.iconLabelLight]}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.iconButton, colorScheme === 'dark' ? styles.iconButtonDark : styles.iconButtonLight]}
                    onPress={() => navigation.navigate('Gallery')}
                >
                    <Icon name="photo-library" size={100} color={colorScheme === 'dark' ? '#fff' : '#000'} />
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
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '80%',
    },
    iconButton: {
        alignItems: 'center',
        marginVertical: 20,
        padding: 20,
        borderRadius: 10,
        width: '100%',
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
});
