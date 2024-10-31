import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import {auth} from "@/scripts/firebase-config";
import { signOut } from "firebase/auth";
import React, { useState } from 'react'


export default function User() {
    
    const router = useRouter();

    const logout = () => {
        signOut(auth).then(() => {
            // Sign-out successful.
            router.push("/")
          }).catch((error) => {
            // An error happened.
    });
}



    return (
        
        <View style={styles.container}>
            <Text>Dados do Usuário</Text>

            <TouchableOpacity style={styles.button}
                onPress={(logout)}
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