// app/App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TodoProvider } from '../context/TodoContext';
import Navigator from './Navigator';

export default function App() {
  return (
    <TodoProvider>
      <NavigationContainer>
        <Navigator />
      </NavigationContainer>
    </TodoProvider>
  );
}
