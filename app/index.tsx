import React, { useEffect,useState } from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { router } from "expo-router";


const App = () => {
    const [firstUse, setFirstUse] = useState("false");
    const navigation = useNavigation();

    useEffect(() => {
        const checkFirstUse = async () => {
            setFirstUse(await AsyncStorage.getItem('first-use')||"false");

            try {
                if (firstUse === 'yes') {
                    router.push("/(root)/home");
                }
                else {
                    router.push("/onboarding");
                }
            } catch (error) {
                console.error('Error checking first-use:', error);
            }
        };

        checkFirstUse();
    }, [navigation]);

    return (
        <View>
            <Text>Loading...</Text>
        </View>
    );
};

export default App;