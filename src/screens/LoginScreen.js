import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, useColorScheme } from 'react-native';

export default function LoginScreen({ navigation }) {
    const colorScheme = useColorScheme();
    const handleLogin = () => {
        navigation.replace('Home');
    };

    return (
        <View style={[styles.container, colorScheme === 'dark' ? styles.containerDark : styles.containerLight]}>
            <Text style={[styles.title, colorScheme === 'dark' ? styles.titleDark : styles.titleLight]}>Login</Text>
            <TextInput
                style={[styles.input, colorScheme === 'dark' ? styles.inputDark : styles.inputLight]}
                placeholder="Username"
                placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#555'}
            />
            <TextInput
                style={[styles.input, colorScheme === 'dark' ? styles.inputDark : styles.inputLight]}
                placeholder="Password"
                placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#555'}
                secureTextEntry
            />
            <Button title="Login" onPress={handleLogin} color={colorScheme === 'dark' ? '#888' : '#000'} />
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
    input: {
        width: '80%',
        padding: 10,
        marginVertical: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
    },
    inputLight: {
        borderColor: '#ccc',
        backgroundColor: '#fff',
        color: '#000',
    },
    inputDark: {
        borderColor: '#444',
        backgroundColor: '#222',
        color: '#fff',
    },
});
