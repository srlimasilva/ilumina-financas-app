import React, { useState } from 'react'
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
    const [errorCreateUser, setErrorCreateUser] = useState("");

    const validarCampos = () => {
        if (nome == "") {
            setErrorCreateUser("Informe um Nome.");
        } else if (email == "") {
            setErrorCreateUser("Informe um E-Mail");
        } else if (password == "") {
            setErrorCreateUser("Informe uma Senha");

        } else {
            setErrorCreateUser("");
        }
    }

    const createUser = () => {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed up 
                const user = userCredential.user;
                set(ref(db, 'user/' + user.uid), {
                    nome: nome,
                    email: email
                })
                router.push('/');
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                setErrorCreateUser(errorMessage);
            });
    }


    return (
        <View style={styles.container}>
            {errorCreateUser != null && (
                <Text style={styles.alert}>{errorCreateUser}</Text>
            )}

            <Text style={styles.titulo}>Cadastrar Usuário</Text>

            <TextInput
                style={styles.input}
                placeholder='Nome'
                placeholderTextColor={"#7D7D7D"}
                value={nome}
                onChangeText={setNome}
            />

            <TextInput
                style={styles.input}
                placeholder='E-mail'
                placeholderTextColor={"#7D7D7D"}
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={styles.input}
                secureTextEntry={true}
                placeholder='Senha'
                placeholderTextColor={"#7D7D7D"}
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={validarCampos}
                onPressIn={createUser}
            >
                <Text style={styles.textButton}>Criar usuário</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    titulo: {
        color: "#fff",
        fontSize: 32,
        marginBottom: 50
    },
    container: {
        backgroundColor: "grey",
        padding: 30,
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    alert: {
        fontSize: 18,
        textAlign: 'center',
        color: '#FFF',
        marginBottom: 20,
    },
    input: {
        fontSize: 18,
        borderRadius: 10,
        backgroundColor: '#FFF',
        padding: 20,
        marginBottom: 20,
        width: '100%'
    },
    button: {
        backgroundColor: '#070A52',
        padding: 10,
        borderRadius: 10,
        marginBottom: 20,
        width: '100%'
    },
    textButton: {
        fontSize: 24,
        textAlign: 'center',
        color: '#fff'
    }
});
