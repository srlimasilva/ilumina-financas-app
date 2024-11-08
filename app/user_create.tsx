import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from "react-native";
import { auth, db } from "../scripts/firebase-config";
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';

export default function CreateUser() {
    const router = useRouter();
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState({ nome: "", email: "", password: "", createUser: "" });

    const validarCampos = () => {
        let nomeError = "";
        let emailError = "";
        let passwordError = "";

        if (nome === "") nomeError = "Informe um nome.";
        if (email === "") emailError = "Informe um e-mail.";
        if (password === "") passwordError = "Informe uma senha.";

        setError({ nome: nomeError, email: emailError, password: passwordError, createUser: "" });

        return !nomeError && !emailError && !passwordError;
    };

    const createUser = () => {
        if (!validarCampos()) return;

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                set(ref(db, 'users/' + user.uid), {
                    nome: nome,
                    email: email
                });
                router.push('/');
            })
            .catch((error) => {
                setError(prev => ({ ...prev, createUser: "Erro ao criar usuário. Verifique os dados." }));
            });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cadastrar Usuário</Text>

            <TextInput
                style={styles.input}
                placeholder="Nome"
                value={nome}
                onChangeText={(text) => setNome(text)}
            />
            {error.nome ? <Text style={styles.errorText}>{error.nome}</Text> : null}

            <TextInput
                style={styles.input}
                placeholder="E-mail"
                value={email}
                onChangeText={(text) => setEmail(text)}
                keyboardType="email-address"
            />
            {error.email ? <Text style={styles.errorText}>{error.email}</Text> : null}

            <TextInput
                style={styles.input}
                secureTextEntry={true}
                placeholder="Senha"
                value={password}
                onChangeText={(text) => setPassword(text)}
            />
            {error.password ? <Text style={styles.errorText}>{error.password}</Text> : null}

            {error.createUser ? <Text style={styles.errorText}>{error.createUser}</Text> : null}

            <TouchableOpacity
                style={styles.button}
                onPress={createUser}
            >
                <Text style={styles.buttonText}>Criar usuário</Text>
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
    title: {
        fontSize: 32,
        color: '#1F2937',
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
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
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
