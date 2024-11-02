import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, Modal, TextInput, Button } from 'react-native';
import { ref, onValue, remove, update, push } from 'firebase/database';
import { db } from '@/scripts/firebase-config';
import { getAuth } from 'firebase/auth';
import { Link } from 'expo-router';

export default function IncomeScreen() {
    const [incomes, setIncomes] = useState([]);
    const [selectedIncome, setSelectedIncome] = useState(null);
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
            <Text style={styles.incomeDate}>Data: {item.dueDate}</Text>
            <Text style={styles.incomeStatus}>Status: {item.status || "PENDENTE"}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
                     
                <Text style={styles.header}>Minhas Receitas</Text>
                <FlatList
                    data={incomes} // Assuming your income data is stored in the 'incomes' array
                    keyExtractor={(item) => item.id}
                    renderItem={renderIncomeItem} // Use the function you defined for rendering income items
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
                            <Button title="Atualizar" onPress={handleUpdateIncome} />
                            <Button title="Excluir" onPress={handleDeleteIncome} color="red" />
                            <Button title="Marcar como Recebida" onPress={handleMarkAsReceived} color="green" />
                            <Button title="Marcar como Pendente" onPress={handleMarkAsPending} color="orange" />
                            <Button title="Cancelar" onPress={closeModal} color="gray" />
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
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    incomeItem: {
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    incomeStatusReceived: {
        backgroundColor: '#32CD32', // Verde para "RECEBIDO"
    },
    incomeStatusPending: {
        backgroundColor: '#FF6347', // Vermelho para "PENDENTE"
    },
    incomeAmount: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    incomeDescription: {
        color: '#FFF',
        fontSize: 16,
        marginTop: 5,
    },
    incomeDate: {
        color: 'white',
        fontSize: 14,
        marginTop: 5,
    },
    incomeStatus: {
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
