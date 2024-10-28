import React, { useEffect } from 'react';
import { View, Text, StyleSheet,Image } from 'react-native';

export default function SplashScreen({ navigation }) {
    useEffect(() => {
        setTimeout(() => {
            navigation.replace('Home');
        }, 2000);
    }, []);

    return (
        <View style={styles.container}>
            {/* <Text style={styles.title}>Wiser Camera</Text> */}
            <Image source={require('../assets/icons/Wisercamera-Logo.png')} style={styles.logo} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#000',
    },
    logo:{
            width: '100%',
            resizeMode: 'contain',
    }
});
