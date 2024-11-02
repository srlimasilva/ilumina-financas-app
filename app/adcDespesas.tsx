import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ref, push } from 'firebase/database';
import { db } from '@/scripts/firebase-config';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';

export default function AddExpenseScreen() {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const auth = getAuth();
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    const router = useRouter();

    const handleSave = async () => {
        if (amount && description) {
            if (!userId) {
                Alert.alert('Erro', 'Usuário não autenticado.');
                return;
            }

            const expenseData = {
                amount: parseFloat(amount),
                description,
                dueDate: dueDate.toISOString().split('T')[0],

            };

            try {
                await push(ref(db, `users/${userId}/expenses`), expenseData);
                Alert.alert('Sucesso', 'Despesa adicionada com sucesso!');
                router.push('/internas/despesas'); // Redireciona para a tela de despesas
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
