import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AppNavigator />
    </AuthProvider>
  );
};

export default App;