import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { useRouter } from 'expo-router';
import { auth } from '@/scripts/firebase-config';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState({ email: "", password: "", login: "" });

    const validarCampos = () => {
        let emailError = "";
        let passwordError = "";

        if (email === "") emailError = "Informe seu e-mail.";
        if (password === "") passwordError = "Informe sua senha.";

        setError({ email: emailError, password: passwordError, login: "" });

        if (!emailError && !passwordError) {
            login();
        }
    };

    const login = () => {
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                setEmail("");
                setPassword("");
                setError({ email: "", password: "", login: "" });
                router.push("/internas/user");
            })
            .catch((error) => {
                setError(prev => ({ ...prev, login: "Erro ao realizar login. Verifique suas credenciais." }));
            });
    };

    return (
        <View style={styles.container}>
            <Image style={styles.logo} source={require('../assets/images/logo.png')} />

            <Text style={styles.title}>Bem-vindo ao Ilumina Finanças</Text>
            <Text style={styles.subtitle}>Acompanhe suas despesas e organize seu orçamento!</Text>

            <TextInput
                style={styles.input}
                placeholder="E-mail"
                value={email}
                onChangeText={(text) => setEmail(text)}
            />
            {error.email ? <Text style={styles.errorText}>{error.email}</Text> : null}

            <TextInput
                style={styles.input}
                placeholder="Senha"
                secureTextEntry
                value={password}
                onChangeText={(text) => setPassword(text)}
            />
            {error.password ? <Text style={styles.errorText}>{error.password}</Text> : null}

            {error.login ? <Text style={styles.errorText}>{error.login}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={validarCampos}>
                <Text style={styles.textButton}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.buttonSecondary}
                onPress={() => router.push('/user_create')}
            >
                <Text style={styles.buttonSecondaryText}>Criar Conta</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 40,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 28,
        color: '#1F2937',
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#4B5563',
        textAlign: 'center',
        marginHorizontal: 20,
        marginBottom: 30,
    },
    input: {
        fontSize: 18,
        borderRadius: 10,
        backgroundColor: '#FFF',
        padding: 15,
        marginBottom: 5,
        width: '100%',
    },
    errorText: {
        color: '#DC2626',
        fontSize: 14,
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    button: {
        backgroundColor: '#10B981',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginTop: 10,
        width: '80%',
        alignItems: 'center',
    },
    textButton: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonSecondary: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderColor: '#10B981',
        borderWidth: 2,
        borderRadius: 8,
        marginTop: 15,
        width: '80%',
        alignItems: 'center',
    },
    buttonSecondaryText: {
        color: '#10B981',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
