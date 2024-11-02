import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { ref, onValue, remove, update } from 'firebase/database';
import { db } from '@/scripts/firebase-config';
import { getAuth } from 'firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Link } from 'expo-router';

export default function ExpenseScreen() {
    const [expenses, setExpenses] = useState([]);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editAmount, setEditAmount] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [showMonthPicker, setShowMonthPicker] = useState(false);

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
        update(expenseRef, { status: "PAGA" })
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
        update(expenseRef, { status: "PENDENTE" })
            .then(() => {
                Alert.alert("Sucesso", "Despesa marcada como pendente.");
                closeModal();
            })
            .catch((error) => {
                Alert.alert("Erro", "Ocorreu um erro ao marcar a despesa como pendente.");
                console.error(error);
            });
    };

    const filterExpensesByMonth = () => {
        const selectedMonthNumber = selectedMonth.getMonth();
        const selectedYear = selectedMonth.getFullYear();
        return expenses.filter((expense) => {
            const expenseDate = new Date(expense.dueDate);
            return (
                expenseDate.getMonth() === selectedMonthNumber &&
                expenseDate.getFullYear() === selectedYear
            );
        });
    };

    const calculateTotalExpenses = (filteredExpenses: any[]) => {
        return filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
    };

    const renderExpenseItem = ({item}) => (
        <TouchableOpacity
            onPress={() => openModal(item)}
            style={[
                styles.expenseItem,
                item.status === 'PAGA' ? styles.expenseStatusPaid : styles.expenseStatusPending
            ]}
        >
            <Text style={styles.expenseAmount}>R$ {item.amount.toFixed(2)}</Text>
            <Text style={styles.expenseDescription}>{item.description}</Text>
            <Text style={styles.expenseDate}>Data: {new Date(item.dueDate).toLocaleDateString('pt-BR')}</Text>
            <Text style={styles.expenseStatus}>Status: {item.status || "PENDENTE"}</Text>
        </TouchableOpacity>
    );

    const filteredExpenses = filterExpensesByMonth();
    const totalExpenses = calculateTotalExpenses(filteredExpenses);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setShowMonthPicker(true)}>
                    <Text style={styles.headerText}>Selecionar Mês</Text>
                </TouchableOpacity>
                <Text style={styles.despesa}>Minhas Despesas</Text>
                <Text style={styles.totalText}>Total Despesas: R$ {totalExpenses.toFixed(2)}</Text>
            </View>

            {showMonthPicker && (
                <DateTimePicker
                    value={selectedMonth}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                        setShowMonthPicker(false);
                        if (date) setSelectedMonth(date);
                    }}
                />
            )}

            <FlatList
                data={filteredExpenses}
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
                            <TouchableOpacity style={styles.button} onPress={handleUpdateExpense}>
                                <Text style={styles.buttonText}>Atualizar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, { backgroundColor: 'red' }]} onPress={handleDeleteExpense}>
                                <Text style={styles.buttonText}>Excluir</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, { backgroundColor: 'green' }]} onPress={handleMarkAsPaid}>
                                <Text style={styles.buttonText}>Marcar como Paga</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, { backgroundColor: 'orange' }]} onPress={handleMarkAsPending}>
                                <Text style={styles.buttonText}>Marcar como Pendente</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, { backgroundColor: 'gray' }]} onPress={closeModal}>
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Link href="/adcDespesas" style={styles.addButton} onPress={() => { setEditAmount(''); setEditDescription(''); }}>
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
        backgroundColor: '#2A2A2A',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'center',
    },
    headerText: {
        color: '#87CEEB',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    despesa: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    totalText: {
        color: '#FFF',
        fontSize: 18,
        marginTop: 10,
    },
    expenseItem: {
        backgroundColor: '#333',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    expenseStatusPaid: {
        borderLeftColor: '#32CD32',
        borderLeftWidth: 5,
    },
    expenseStatusPending: {
        borderLeftColor: '#FFA500',
        borderLeftWidth: 5,
    },
    expenseAmount: {
        color: '#87CEEB',
        fontSize: 20,
        fontWeight: 'bold',
    },
    expenseDescription: {
        color: '#FFF',
        fontSize: 16,
        marginBottom: 5,
    },
    expenseDate: {
        color: '#FFF',
        fontSize: 14,
    },
    expenseStatus: {
        color: '#FFF',
        fontSize: 14,
    },
    emptyText: {
        color: '#FFF',
        textAlign: 'center',
        fontSize: 16,
        marginTop: 20,
    },
    addButton: {
        backgroundColor: '#87CEEB',
        padding: 15,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        backgroundColor: '#D3D3D3',
        padding: 20,
        borderRadius: 8,
        width: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#000',
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#87CEEB',
        padding: 8,
        fontSize: 16,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'column',
        gap: 10,
    },
    button: {
        backgroundColor: '#87CEEB',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 5,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
