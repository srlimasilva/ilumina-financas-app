import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, Modal, TextInput, Button } from 'react-native';
import { ref, onValue, remove, update, push } from 'firebase/database';
import { db } from '@/scripts/firebase-config';
import { getAuth } from 'firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Link } from 'expo-router';

export default function ExpensesScreen() {
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
        update(expenseRef, { status: "PAGO" })
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

    const calculateTotalByType = (filteredExpenses) => {
        let totalDespesas = 0;
        let totalReceitas = 0;

        filteredExpenses.forEach((expense) => {
            if (expense.type === 'DESPESA') {
                totalDespesas += expense.amount;
            } else if (expense.type === 'RECEITA') {
                totalReceitas += expense.amount;
            }
        });

        return { totalDespesas, totalReceitas };
    };

    const renderExpenseItem = ({ item }) => (
        <TouchableOpacity 
            onPress={() => openModal(item)} 
            style={[
                styles.expenseItem, 
                item.status === 'PAGO' ? styles.expenseStatusPaid : styles.expenseStatusPending
            ]}
        >
            <Text style={styles.expenseAmount}>R$ {item.amount.toFixed(2)}</Text>
            <Text style={styles.expenseDescription}>{item.description}</Text>
            <Text style={styles.expenseDate}>Vencimento: {new Date(item.dueDate).toLocaleDateString('pt-BR')}</Text>
            <Text style={styles.expenseStatus}>Status: {item.status || "PENDENTE"}</Text>
        </TouchableOpacity>
    );

    const filteredExpenses = filterExpensesByMonth();
    const { totalDespesas, totalReceitas } = calculateTotalByType(filteredExpenses);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setShowMonthPicker(true)}>
                    <Text style={styles.headerText}>Selecionar Mês</Text>
                </TouchableOpacity>
                <Text style = {styles.despesa}>Minhas despesas</Text>
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
                            <Button title="Atualizar" onPress={handleUpdateExpense} />
                            <Button title="Excluir" onPress={handleDeleteExpense} color="red" />
                            <Button title="Marcar como Paga" onPress={handleMarkAsPaid} color="green" />
                            <Button title="Marcar como Pendente" onPress={handleMarkAsPending} color="orange" />
                            <Button title="Cancelar" onPress={closeModal} color="gray" />
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
    despesa:{
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    monthPickerButton: {
        backgroundColor: '#00BFFF',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        width: '100%',
        alignItems: 'center',
    },
    monthPickerButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    totalText: {
        color: '#FFF',
        fontSize: 18,
    },
    expenseItem: {
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    expenseStatusPaid: {
        backgroundColor: '#32CD32', // Verde para "PAGO"
    },
    expenseStatusPending: {
        backgroundColor: '#FF6347', // Vermelho para "PENDENTE"
    },
    expenseAmount: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    expenseDescription: {
        color: '#FFF',
        fontSize: 16,
        marginTop: 5,
    },
    expenseDate: {
        color: 'white',
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
        marginTop: 20
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
