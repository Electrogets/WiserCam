import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import axios from 'axios';

export default function SignupScreen({ navigation }) {
    const colorScheme = useColorScheme();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async () => {
        try {
            const response = await axios.post('http://your-django-api-url.com/api/signup/', {
                name,
                email,
                phone,
                password,
            });
            if (response.data.success) {
                Alert.alert('Success', 'Account created successfully!', [
                    { text: 'OK', onPress: () => navigation.navigate('Login') },
                ]);
            } else {
                Alert.alert('Error', response.data.message || 'Unable to create account');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong');
        }
    };

    const handleRedirectToLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <View style={[styles.container, colorScheme === 'dark' ? styles.containerDark : styles.containerLight]}>
            <Text style={[styles.title, colorScheme === 'dark' ? styles.titleDark : styles.titleLight]}>Sign Up</Text>
            <TextInput
                style={[styles.input, colorScheme === 'dark' ? styles.inputDark : styles.inputLight]}
                placeholder="Name"
                placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#555'}
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={[styles.input, colorScheme === 'dark' ? styles.inputDark : styles.inputLight]}
                placeholder="Email"
                placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#555'}
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={[styles.input, colorScheme === 'dark' ? styles.inputDark : styles.inputLight]}
                placeholder="Phone Number"
                placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#555'}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
            />
            <TextInput
                style={[styles.input, colorScheme === 'dark' ? styles.inputDark : styles.inputLight]}
                placeholder="Create Password"
                placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#555'}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <Button title="Sign Up" onPress={handleSignup} color={colorScheme === 'dark' ? '#888' : '#000'} />

            {/* Login Link */}
            <Text style={styles.loginText1}>Already have an account?</Text>
            <TouchableOpacity onPress={handleRedirectToLogin}>
                <Text style={styles.loginText}>Log in</Text>
            </TouchableOpacity>
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
    loginText: {
       
        marginTop: 0,
        color: '#00f',
        textDecorationLine: 'underline',
        fontWeight:"700",
    },
    loginText1: {
        marginTop: 20,
        fontWeight:"700",
    },
});
