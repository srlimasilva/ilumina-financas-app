import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from "react-native";

export default function Index() {
    const router = useRouter();
    return (
        <View style={styles.container}>
            <Image style={styles.logo} source={require('../assets/images/teste1.png')} />

            {/* {errorLogin != null && (
                <Text style={styles.alert}>{errorLogin}</Text>
            )} */}

            <TextInput
                style={styles.input}
                placeholder='E-mail'
                // value={email}
                // onChangeText={setEmail}
            />

            <TextInput
                style={styles.input}
                placeholder='Senha'
                secureTextEntry={true}
                // value={password}
                // onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.button}
                // onPress={validate}
                onPress={() => router.push('/internas/tasks')}
            >
                <Text style={styles.textButton}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.buttonCreate}
                onPress={() => router.push('/user_create')}
            >
                <Text style={styles.buttonCreateText}>Criar Usuário</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "grey",
        padding: 30,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 50,
        resizeMode: 'contain',
    },
    alert: {
        fontSize: 18,
        color: '#FFF',
        textAlign: 'center',
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
    },
    buttonCreate: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#FFFFFF',
        borderRadius: 10,
        marginBottom: 20,
        width: '100%'
    },
    buttonCreateText: {
        fontSize: 18,
        textAlign: 'center',
        color: '#fff'
    }
})