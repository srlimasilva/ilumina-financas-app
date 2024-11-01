import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, Modal, TextInput, Button } from 'react-native';
import { ref, onValue, remove, update } from 'firebase/database';
import { db } from '@/scripts/firebase-config';
import { getAuth } from 'firebase/auth';

export default function ExpensesScreen() {
    const [expenses, setExpenses] = useState([]);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editAmount, setEditAmount] = useState('');
    const [editDescription, setEditDescription] = useState('');

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

    const openModal = (expense) => {
        setSelectedExpense(expense);
        setEditAmount(expense.amount.toString());
        setEditDescription(expense.description);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setSelectedExpense(null);
    };

    const handleUpdateExpense = () => {
        if (!editAmount || !editDescription) {
            Alert.alert("Erro", "Preencha todos os campos.");
            return;
        }

        const expenseRef = ref(db, `users/${userId}/expenses/${selectedExpense.id}`);
        update(expenseRef, {
            amount: parseFloat(editAmount),
            description: editDescription,
        })
        .then(() => {
            Alert.alert("Sucesso", "Despesa atualizada com sucesso.");
            closeModal();
        })
        .catch((error) => {
            Alert.alert("Erro", "Ocorreu um erro ao atualizar a despesa.");
            console.error(error);
        });
    };

    const handleDeleteExpense = () => {
        const expenseRef = ref(db, `users/${userId}/expenses/${selectedExpense.id}`);
        remove(expenseRef)
        .then(() => {
            Alert.alert("Sucesso", "Despesa excluída com sucesso.");
            closeModal();
        })
        .catch((error) => {
            Alert.alert("Erro", "Ocorreu um erro ao excluir a despesa.");
            console.error(error);
        });
    };

    const handleMarkAsPaid = () => {
        const expenseRef = ref(db, `users/${userId}/expenses/${selectedExpense.id}`);
        update(expenseRef, { status: "pago" })
        .then(() => {
            Alert.alert("Sucesso", "Despesa marcada como paga.");
            closeModal();
        })
        .catch((error) => {
            Alert.alert("Erro", "Ocorreu um erro ao marcar a despesa como paga.");
            console.error(error);
        });
    };

    const handleMarkAsPending = () => {
        const expenseRef = ref(db, `users/${userId}/expenses/${selectedExpense.id}`);
        update(expenseRef, { status: "pendente" })
        .then(() => {
            Alert.alert("Sucesso", "Despesa marcada como pendente.");
            closeModal();
        })
        .catch((error) => {
            Alert.alert("Erro", "Ocorreu um erro ao marcar a despesa como pendente.");
            console.error(error);
        });
    };

    const renderExpenseItem = ({ item }) => (
        <TouchableOpacity onPress={() => openModal(item)} style={styles.expenseItem}>
            <Text style={styles.expenseAmount}>R$ {item.amount.toFixed(2)}</Text>
            <Text style={styles.expenseDescription}>{item.description}</Text>
            <Text style={styles.expenseDate}>Vencimento: {item.dueDate}</Text>
            <Text style={styles.expenseStatus}>Status: {item.status || "pendente"}</Text>
        </TouchableOpacity>
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

            <Modal 
                visible={isModalVisible} 
                animationType="slide" 
                transparent={true}
                onRequestClose={closeModal}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Editar Despesa</Text>
                        <TextInput
                            style={styles.input}
                            value={editAmount}
                            onChangeText={setEditAmount}
                            keyboardType="numeric"
                            placeholder="Valor"
                        />
                        <TextInput
                            style={styles.input}
                            value={editDescription}
                            onChangeText={setEditDescription}
                            placeholder="Descrição"
                        />
                        <View style={styles.modalButtons}>
                            <Button title="Atualizar" onPress={handleUpdateExpense} />
                            <Button title="Excluir" onPress={handleDeleteExpense} color="red" />
                            <Button title="Marcar como Paga" onPress={handleMarkAsPaid} color="green" />
                            <Button title="Marcar como Pendente" onPress={handleMarkAsPending} color="orange" />
                            <Button title="Cancelar" onPress={closeModal} color="gray" />
                        </View>
                    </View>
                </View>
            </Modal>
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
    expenseStatus: {
        color: '#FFF',
        fontSize: 14,
        marginTop: 5,
    },
    emptyText: {
        color: '#FFF',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 50,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#1E1E1E',
        padding: 20,
        borderRadius: 8,
    },
    modalTitle: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#333',
        color: '#FFF',
        padding: 15,
        borderRadius: 8,
        marginVertical: 10,
        fontSize: 18,
    },
    modalButtons: {
        marginTop: 20,
    },
});
