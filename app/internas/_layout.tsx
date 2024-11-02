import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";

export default function Layout() {
    return (
        <Tabs
            screenOptions={{
                //Cor do cabeçalho
                headerStyle: { backgroundColor: "grey" },
                //Cor da tab bar
                tabBarStyle: { backgroundColor: "#070A52" },
                //Centraliza o título no cabeçalho
                headerTitleAlign: 'center',
                //Cor do texto cabeçalho
                headerTintColor: '#FFF',
                //Define a cor do menu ativo na tab bar
                tabBarActiveTintColor: "#F60",
                //Cor do ícone inativa na tab bar
                tabBarInactiveTintColor: "#FFF"
            }}
        >

            <Tabs.Screen name="user" options={{
                headerTitle: "Dados do Usuário",
                tabBarIcon: ({ color }) => (
                    <MaterialCommunityIcons
                        name="account"
                        color={color}
                        size={32}
                    />)
            }} />

            <Tabs.Screen name="receitas" options={{
                headerShown: false,
                headerTitle: "",
                tabBarIcon: ({ color }) => (
                    <MaterialCommunityIcons
                        name="bank-transfer-in"
                        color={color}
                        size={32}
                    />)
            }} />

            <Tabs.Screen name="despesas" options={{
                headerShown: false,
                headerTitle: "",
                tabBarIcon: ({ color }) => (
                    <MaterialCommunityIcons
                        name="bank-transfer-out"
                        color={color}
                        size={32}
                    />)
            }} />



        </Tabs>
    );
}
