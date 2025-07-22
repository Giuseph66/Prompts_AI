// app/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Layout() {
  const [isLoading, setIsLoading] = useState(true);

  // Mostrar loading enquanto verifica autenticação
  if (!isLoading) {
    return;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Drawer
        screenOptions={{
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#00FF41',
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#00FF41',
          },
          headerShown: false,
          drawerStyle: {
            backgroundColor: '#000',
            width: 280,
          },
          drawerActiveTintColor: '#00FF41',
          drawerInactiveTintColor: '#666',
          drawerLabelStyle: {
            color: '#00FF41',
            fontSize: 16,
            fontWeight: '600',
          },
          drawerItemStyle: {
            borderBottomWidth: 1,
            borderBottomColor: '#333',
            marginVertical: 2,
          },
          drawerActiveBackgroundColor: 'rgba(0, 255, 65, 0.1)',
          drawerType: 'slide',
          overlayColor: 'rgba(0, 0, 0, 0.8)',
          swipeEnabled: true,
          swipeEdgeWidth: 50,
          swipeMinDistance: 10,
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            title: '💬 CHAT PRINCIPAL',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="chatbubble" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="history"
          options={{
            title: '📚 HISTÓRICO',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="time" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: '⚙️ CONFIGURAÇÕES',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="reco_facial"
          options={{
            title: '👤 RECONHECIMENTO FACIAL',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
