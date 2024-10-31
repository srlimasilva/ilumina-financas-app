import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ref, push } from 'firebase/database';
import { db } from '@/scripts/firebase-config';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import Transactions from './Transações';
import User from './user';

export default function AddExpenseScreen() {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState(new Date());
    const [repeatOption, setRepeatOption] = useState('Não repetir');
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Obtendo o ID do usuário autenticado
    const auth = getAuth();
    const userId = auth.currentUser ? auth.currentUser.uid : null; // ID do usuário

    const handleSave = async () => {
        if (amount && description) {
            if (!userId) {
                Alert.alert('Erro', 'Usuário não autenticado.');
                return; // Para a execução se o userId não estiver definido
            }

            const expenseData = {
                amount: parseFloat(amount),
                description,
                dueDate: dueDate.toISOString().split('T')[0],
                repeatOption,
            };

            try {
                // Salvar a despesa sob o ID do usuário
                await push(ref(db, `user/${userId}/expenses`), expenseData);
                Alert.alert('Sucesso', 'Despesa adicionada com sucesso!');
                router.push('/internas/transactions'); // Redireciona após salvar
            } catch (error) {
                Alert.alert('Erro', 'Ocorreu um erro ao salvar a despesa.');
                console.error(error);
            }
        } else {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="R$ 0,00"
                placeholderTextColor="#B0B0B0"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
            />

            <TextInput
                style={styles.input}
                placeholder="Descrição"
                placeholderTextColor="#B0B0B0"
                value={description}
                onChangeText={setDescription}
            />

            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                <Text style={{ color: '#fff' }}>{dueDate.toLocaleDateString()}</Text>
                <Icon name="calendar-today" size={24} color="#B0B0B0" style={styles.icon} />
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker
                    value={dueDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setDueDate(selectedDate);
                    }}
                />
            )}

            <View style={styles.repeatOptions}>
                {['Não repetir', 'Sempre', 'Parcelado'].map(option => (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.repeatButton,
                            repeatOption === option && styles.selectedRepeatButton,
                        ]}
                        onPress={() => setRepeatOption(option)}
                    >
                        <Text style={styles.repeatButtonText}>{option}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E1E1E',
        paddingHorizontal: 10,
    },

    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 150,
    },
    tab: {
        color: '#B0B0B0',
        fontSize: 16,
        marginHorizontal: 30,
        paddingBottom: 5,
    },
    input: {
        backgroundColor: '#333',
        color: '#fff',
        padding: 15,
        borderRadius: 8,
        marginVertical: 10,
        fontSize: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    icon: {
        position: 'absolute',
        right: 10,
    },
    repeatOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 15,
    },
    repeatButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderColor: '#00BFFF',
        borderWidth: 1,
    },
    selectedRepeatButton: {
        backgroundColor: '#00BFFF',
    },
    repeatButtonText: {
        color: '#fff',
        fontSize: 14,
    },
    saveButton: {
        backgroundColor: '#00BFFF',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
