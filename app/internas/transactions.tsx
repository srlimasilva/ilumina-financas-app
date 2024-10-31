import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, Alert } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { db } from '@/scripts/firebase-config';
import { getAuth } from 'firebase/auth';
import { Link } from 'expo-router';

export default function ExpensesScreen() {
    const [expenses, setExpenses] = useState([]);
    const auth = getAuth();
    const userId = auth.currentUser ? auth.currentUser.uid : null;

    useEffect(() => {
        if (!userId) {
            Alert.alert("Erro", "Usuário não autenticado.");
            return;
        }

        const expensesRef = ref(db, `users/${userId}/expenses`);
        const unsubscribe = onValue(expensesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const loadedExpenses = Object.keys(data).map((key) => ({
                    id: key,
                    ...data[key]
                }));
                setExpenses(loadedExpenses);
            } else {
                setExpenses([]);
            }
        });

        return () => unsubscribe();
    }, [userId]);

    const renderExpenseItem = ({ item }) => (
        <View style={styles.expenseItem}>
            <Text style={styles.expenseAmount}>R$ {item.amount.toFixed(2)}</Text>
            <Text style={styles.expenseDescription}>{item.description}</Text>
            <Text style={styles.expenseDate}>Vencimento: {item.dueDate}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Minhas Despesas</Text>
            <FlatList
                data={expenses}
                keyExtractor={(item) => item.id}
                renderItem={renderExpenseItem}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma despesa encontrada.</Text>}
            />
            <Link href="/adcDespesas" style={styles.addButton}>
                <Text style={styles.addButtonText}>+ Adicionar Despesa</Text>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E1E1E',
        padding: 20,
    },
    header: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    expenseItem: {
        backgroundColor: '#333',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    expenseAmount: {
        color: '#00BFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    expenseDescription: {
        color: '#FFF',
        fontSize: 16,
        marginTop: 5,
    },
    expenseDate: {
        color: '#B0B0B0',
        fontSize: 14,
        marginTop: 5,
    },
    emptyText: {
        color: '#FFF',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 50,
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
