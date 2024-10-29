import { Stack } from "expo-router";
import { MaterialCommunityIcons} from '@expo/vector-icons'

export default function RootLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: "#F60"},
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
        </Stack>
    );
}
