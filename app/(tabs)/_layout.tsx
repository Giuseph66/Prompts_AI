import { Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Stack
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
        contentStyle: {
          backgroundColor: '#000',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'TERMINAL HACKER',
        }}
      />
    </Stack>
  );
}
