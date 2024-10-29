import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";


export default function User() {
    
    const router = useRouter();
    return (
        
        <View style={styles.container}>
            <Text>Dados do Usuário</Text>

            <TouchableOpacity style={styles.button}
                onPress={() => router.push('../index.tsx')}
            >
                <Text style={styles.textButton}>Sair</Text>
            </TouchableOpacity>

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