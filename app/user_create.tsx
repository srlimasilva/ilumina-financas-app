import { useRouter } from 'expo-router';
import React, { useState } from 'react'
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from "react-native";
import { auth, db } from '../scripts/firebase-config';
import {createUserWithEmailAndPassword} from 'firebase/auth'
import {ref,set} from 'firebase/database';
 


export default function CreateUser() {
    const router = useRouter();

    const [nome, setNome] = useState(null)
    const [email, setEmail] = useState(null)
    const [password, setPassword] = useState(null)
    const [errorCreateUser, setErrorCreateUser] = useState(null)

    const validarCampos = () => {
        if (nome == "") {
            setErrorCreateUser("Informe um nome");
        } else if (email == "") {
            setErrorCreateUser("Informe um email");
        } else if (password = "") {
            setErrorCreateUser("Informe uma senha")
        } else {
            setErrorCreateUser(null)
            
        }

    }

    // Função que cria o usuário no Firebase
    const createUser = () => {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed up 
            const user = userCredential.user;
            set(ref(db, 'users/'+ user.uid), {
                nome: nome,
                email: email
            });
            router.push('/')
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
                value={nome}
                onChangeText={setNome}
            />

            <TextInput
                style={styles.input}
                placeholder='E-mail'
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={styles.input}
                secureTextEntry={true}
                placeholder='Senha'
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={createUser}
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
        backgroundColor: "#F60",
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