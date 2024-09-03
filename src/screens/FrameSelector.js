import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';

const FrameSelector = ({ frames, selectedFrame, onSelectFrame }) => {
    const flatListRef = useRef(null);

    useEffect(() => {
        if (flatListRef.current) {
            const index = frames.findIndex(frame => frame.id === selectedFrame.id);
            if (index !== -1) {
                flatListRef.current.scrollToIndex({ index, animated: true });
            }
        }
    }, [selectedFrame]);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.frameButton,
                selectedFrame.id === item.id && styles.frameButtonSelected,
            ]}
            onPress={() => onSelectFrame(item)}
        >
            <Image source={item.uri} style={styles.frameButtonImage} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={frames}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.frameList}
                ref={flatListRef}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    frameButton: {
        margin: 5,
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
    },
    frameButtonImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    frameButtonSelected: {
        borderColor: '#007BFF',
        borderWidth: 4,
        borderRadius: 30,
    },
    frameList: {
        flexGrow: 1,
        justifyContent: 'center',
    },
});

export default FrameSelector;
