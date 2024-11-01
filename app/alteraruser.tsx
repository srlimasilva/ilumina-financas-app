import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "@/scripts/firebase-config";
import { signOut, updateEmail } from "firebase/auth";
import { ref, get, update } from "firebase/database";
import React, { useState, useEffect } from 'react';

export default function User() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [originalEmail, setOriginalEmail] = useState("");

    const userId = auth.currentUser ? auth.currentUser.uid : null;

    useEffect(() => {
        if (userId) {
            const userRef = ref(db, `user/${userId}`);
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    setName(userData.nome || "");
                    setEmail(userData.email || "");
                    setOriginalEmail(userData.email || "");
                }
            }).catch((error) => {
                console.error("Erro ao buscar dados do usuário:", error);
            });
        }
    }, [userId]);

    const handleSave = async () => {
        if (!userId) {
            Alert.alert("Erro", "Usuário não autenticado.");
            return;
        }
        try {
            const userRef = ref(db, `user/${userId}`);
            await update(userRef, { nome: name });

            if (email !== originalEmail) {
                await updateEmail(auth.currentUser, email);
            }

            Alert.alert("Sucesso", "Dados atualizados com sucesso!");
        } catch (error) {
            Alert.alert("Erro", "Ocorreu um erro ao atualizar os dados.");
            console.error(error);
        }
    };

    const logout = () => {
        signOut(auth).then(() => {
            router.push("/");
        }).catch((error) => {
            console.error("Erro ao fazer logout:", error);
        });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Dados do Usuário</Text>

            <TextInput
                style={styles.input}
                placeholder="Nome"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#1E1E1E',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        color: '#FFF',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        backgroundColor: '#333',
        color: '#FFF',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 18,
    },
    saveButton: {
        backgroundColor: '#00BFFF',
        padding: 15,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    logoutButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        padding: 10,
    },
    logoutText: {
        color: '#FF6347',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
