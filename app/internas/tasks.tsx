import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from "react-native";

export default function Tasks() {
    return (
        <View style={styles.container}>
            <Text>Tasks</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 30,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
})