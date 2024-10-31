import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import   
 { ref, onValue, off } from "firebase/database";
import { auth, db } from '@/scripts/firebase-config';
import { Link, useRouter } from 'expo-router';

export default function Transactions() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const userId = auth.currentUser ? auth.currentUser.uid : null; // Replace with actual user ID

  useEffect(() => {
    const unsubscribe = onValue(ref(db, `users/${userId}/expenses`), (snapshot) => {
      const data = snapshot.val();
      if (data) { // Verifica se há dados antes de iterar
        const transactionsArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setTransactions(transactionsArray);
      } else {
        setTransactions([]); // Limpa o array de transações se não houver dados
      }
    });
  
    return () => unsubscribe();
  }, [userId]);

  
  const handleDeleteTransaction = () => {
    // Delete transaction from Firebase
    ref(db, `users/${userId}/expenses/${transactionId}`).remove()
      .then(() => {
        // Update the transactions state
        setTransactions(transactions.filter(transaction => transaction.id !== transactionId));
      })
      .catch(error => {
        console.error('Error deleting transaction:', error);   

      });
  };

  const handleMarkAsPaid = (expenseData) => {
    // Update the transaction's "paid" status in Firebase
    ref(db, `users/${userId}/expenses/${transactionId}`).update({
      paid: true
    })
      .then(() => {
        // Update the transactions state
        setTransactions(transactions.map(transaction => {
          if (transaction.id === transactionId) {
            return { ...transaction, paid: true };
          }
          return transaction;
        }));
      })
      .catch(error => {
        console.error('Error marking transaction as paid:', error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transações</Text>
      <FlatList
        data={transactions}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <Text>{item.description}</Text>
            <Text>R$ {item.amount}</Text>
            <Text>Vencimento: {item.dueDate}</Text>
            <Text>Repetição: {item.repeatOption}</Text>
            <Text>Pago: {item.paid ? 'Sim' : 'Não'}</Text>
            <TouchableOpacity onPress={() => handleEditTransaction(item.id)}>
              <Text style={styles.actionButton}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteTransaction(item.id)}>
              <Text style={styles.actionButton}>Excluir</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleMarkAsPaid(item.id)}>
              <Text style={styles.actionButton}>{item.paid ? 'Desmarcar como Pago' : 'Marcar como Pago'}</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={item => item.id}
      />

      {/* Botão para redirecionar para a tela de adicionar despesas */}
      <Link href="/adcDespesas" style={styles.addButton}>
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