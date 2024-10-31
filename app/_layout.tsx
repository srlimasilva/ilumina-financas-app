import { Stack } from "expo-router";
import React from 'react';
import { MaterialCommunityIcons} from '@expo/vector-icons'

export default function RootLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: "grey"},
                headerShadowVisible: false
            }}
        >
            <Stack.Screen name="index" options={{
                headerShown: false
            }} />


            <Stack.Screen name="user_create" options={{
                headerTitle: ''
            }} />
            <Stack.Screen name="internas" options={{
                headerShown: false,
                headerTitle: ''
            }} />
            <Stack.Screen name="adcDespesas" options={{
                headerShown: true,
                headerTitle: 'Nova despesa'
            }} />
        </Stack>
    );
}
