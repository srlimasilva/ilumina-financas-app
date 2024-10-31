import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { ref, onValue, off } from "firebase/database";
import { db } from '@/scripts/firebase-config';
import { Link, useRouter } from 'expo-router';


export default function Transactions() {
    const router = useRouter();
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const transactionsRef = ref(db, 'transactions');

        const unsubscribe = onValue(transactionsRef, (snapshot) => {
            const transactionsData = snapshot.val() || {};
            const transactionList = Object.keys(transactionsData).map(key => ({
                id: key,
                ...transactionsData[key]
            }));
            setTransactions(transactionList);
        });

        return () => off(transactionsRef);
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Transações</Text>
            <FlatList
                data={transactions}
                renderItem={({ item }) => (
                    <View style={styles.transactionItem}>
                        <Text>{item.date}</Text>
                        <Text>{item.description}</Text>
                        <Text>{item.amount}</Text>
                        <Text>{item.category}</Text>
                    </View>
                )}
                keyExtractor={(item) => item.id}
            />

            {/* Botão para redirecionar para a tela de adicionar despesas */}
            <Link href= '../adcDespesas' style={styles.addButton}>
                <Text style={styles.addButtonText}>+ Adicionar Despesa</Text>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    transactionItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        flexDirection: 'column',
    },
    addButton: {
        backgroundColor: '#00BFFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});