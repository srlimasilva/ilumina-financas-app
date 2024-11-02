import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, Modal, TextInput, Button } from 'react-native';
import { ref, onValue, remove, update } from 'firebase/database';
import { db } from '@/scripts/firebase-config';
import { getAuth } from 'firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Link } from 'expo-router';

export default function IncomeScreen() {
    const [incomes, setIncomes] = useState([]);
    const [selectedIncome, setSelectedIncome] = useState(null);
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

        const incomesRef = ref(db, `users/${userId}/incomes`);
        const unsubscribe = onValue(incomesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const loadedIncomes = Object.keys(data).map((key) => ({
                    id: key,
                    ...data[key]
                }));
                setIncomes(loadedIncomes);
            } else {
                setIncomes([]);
            }
        });

        return () => unsubscribe();
    }, [userId]);

    const openModal = (income) => {
        setSelectedIncome(income);
        setEditAmount(income.amount.toString());
        setEditDescription(income.description);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setSelectedIncome(null);
    };

    const handleUpdateIncome = () => {
        if (!editAmount || !editDescription) {
            Alert.alert("Erro", "Preencha todos os campos.");
            return;
        }

        const incomeRef = ref(db, `users/${userId}/incomes/${selectedIncome.id}`);
        update(incomeRef, {
            amount: parseFloat(editAmount),
            description: editDescription,
        })
            .then(() => {
                Alert.alert("Sucesso", "Receita atualizada com sucesso.");
                closeModal();
            })
            .catch((error) => {
                Alert.alert("Erro", "Ocorreu um erro ao atualizar a receita.");
                console.error(error);
            });
    };

    const handleDeleteIncome = () => {
        const incomeRef = ref(db, `users/${userId}/incomes/${selectedIncome.id}`);
        remove(incomeRef)
            .then(() => {
                Alert.alert("Sucesso", "Receita excluída com sucesso.");
                closeModal();
            })
            .catch((error) => {
                Alert.alert("Erro", "Ocorreu um erro ao excluir a receita.");
                console.error(error);
            });
    };

    const handleMarkAsReceived = () => {
        const incomeRef = ref(db, `users/${userId}/incomes/${selectedIncome.id}`);
        update(incomeRef, { status: "RECEBIDO" })
            .then(() => {
                Alert.alert("Sucesso", "Receita marcada como recebida.");
                closeModal();
            })
            .catch((error) => {
                Alert.alert("Erro", "Ocorreu um erro ao marcar a receita como recebida.");
                console.error(error);
            });
    };

    const handleMarkAsPending = () => {
        const incomeRef = ref(db, `users/${userId}/incomes/${selectedIncome.id}`);
        update(incomeRef, { status: "PENDENTE" })
            .then(() => {
                Alert.alert("Sucesso", "Receita marcada como pendente.");
                closeModal();
            })
            .catch((error) => {
                Alert.alert("Erro", "Ocorreu um erro ao marcar a receita como pendente.");
                console.error(error);
            });
    };

    const filterIncomesByMonth = () => {
        const selectedMonthNumber = selectedMonth.getMonth();
        const selectedYear = selectedMonth.getFullYear();
        return incomes.filter((income) => {
            const incomeDate = new Date(income.dueDate);
            return (
                incomeDate.getMonth() === selectedMonthNumber &&
                incomeDate.getFullYear() === selectedYear
            );
        });
    };

    const calculateTotalIncomes = (filteredIncomes) => {
        return filteredIncomes.reduce((total, income) => total + income.amount, 0);
    };

    const renderIncomeItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => openModal(item)}
            style={[
                styles.incomeItem,
                item.status === 'RECEBIDO' ? styles.incomeStatusReceived : styles.incomeStatusPending
            ]}
        >
            <Text style={styles.incomeAmount}>R$ {item.amount.toFixed(2)}</Text>
            <Text style={styles.incomeDescription}>{item.description}</Text>
            <Text style={styles.incomeDate}>Data: {new Date(item.dueDate).toLocaleDateString('pt-BR')}</Text>
            <Text style={styles.incomeStatus}>Status: {item.status || "PENDENTE"}</Text>
        </TouchableOpacity>
    );

    const filteredIncomes = filterIncomesByMonth();
    const totalIncomes = calculateTotalIncomes(filteredIncomes);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setShowMonthPicker(true)}>
                    <Text style={styles.headerText}>Selecionar Mês</Text>
                </TouchableOpacity>
                <Text style={styles.despesa}>Minhas Receitas</Text>
                <Text style={styles.totalText}>Total Receitas: R$ {totalIncomes.toFixed(2)}</Text>
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
                data={filteredIncomes}
                keyExtractor={(item) => item.id}
                renderItem={renderIncomeItem}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma receita encontrada.</Text>}
            />

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={closeModal}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Editar Receita</Text>
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
                            <TouchableOpacity style={styles.button} onPress={handleUpdateIncome}>
                                <Text style={styles.buttonText}>Atualizar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, { backgroundColor: 'red' }]} onPress={handleDeleteIncome}>
                                <Text style={styles.buttonText}>Excluir</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, { backgroundColor: 'green' }]} onPress={handleMarkAsReceived}>
                                <Text style={styles.buttonText}>Marcar como Recebida</Text>
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

            <Link href="/adcReceitas" style={styles.addButton} onPress={() => { setEditAmount(''); setEditDescription(''); }}>
                <Text style={styles.addButtonText}>+ Adicionar Receita</Text>
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
    incomeItem: {
        backgroundColor: '#333',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    incomeStatusReceived: {
        borderLeftColor: '#32CD32',
        borderLeftWidth: 5,
    },
    incomeStatusPending: {
        borderLeftColor: '#FFA500',
        borderLeftWidth: 5,
    },
    incomeAmount: {
        color: '#87CEEB',
        fontSize: 20,
        fontWeight: 'bold',
    },
    incomeDescription: {
        color: '#FFF',
        fontSize: 16,
        marginBottom: 5,
    },
    incomeDate: {
        color: '#FFF',
        fontSize: 14,
    },
    incomeStatus: {
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






