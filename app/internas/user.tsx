import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "@/scripts/firebase-config";
import { signOut } from "firebase/auth";
import { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import React from "react";

export default function User() {
    const router = useRouter();
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            setUserEmail(user.email);

            const userRef = ref(db, 'users/' + user.uid);
            get(userRef).then(snapshot => {
                if (snapshot.exists()) {
                    setUserName(snapshot.val().nome || 'Usuário');
                }
            }).catch(error => {
                console.error("Erro ao buscar dados do usuário:", error);
            });
        }
    }, []);

    const logout = () => {
        signOut(auth).then(() => {
            router.push("/");
        }).catch((error) => {
            console.error("Erro ao sair:", error);
        });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Text style={styles.logoutText}>Desligar</Text>
            </TouchableOpacity>

            <Text style={styles.header}>Dados do Usuário</Text>
            <Text style={styles.infoText}>Nome: {userName}</Text>
            <Text style={styles.infoText}>Email: {userEmail}</Text>

            
        </View>


    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
        backgroundColor: '#1E1E1E'
    },
    header: {
        fontSize: 24,
        color: '#fff',
        marginBottom: 20,
        fontWeight: 'bold'
    },
    infoText: {
        fontSize: 18,
        color: '#B0B0B0',
        marginBottom: 10,
    },
    logoutButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        padding: 10,
        backgroundColor: '#FF3B30',
        borderRadius: 5,
    },
    logoutText: {
        color: '#fff',
        fontWeight: 'bold'
    },
    editButton: {
        marginTop: 20,
        backgroundColor: '#00BFFF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
