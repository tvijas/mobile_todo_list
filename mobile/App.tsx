import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { TodoProvider } from './src/store/todoStore';
import AppNavigator from './src/navigation/AppNavigator';
import NotificationService from './src/services/NotificationService';
import BackgroundService from './src/services/BackgroundService';

const App = () => {
  useEffect(() => {
    const initializeServices = async () => {
      try {
        await NotificationService.initialize();
        BackgroundService.initialize();
        console.log('Services initialized');
      } catch (error) {
        console.error('Failed to initialize services:', error);
      }
    };
    
    initializeServices();
    
    // return () => {
    //   BackgroundService.cleanup();
    // };
  }, []);

  return (
    <AuthProvider>
      <TodoProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </TodoProvider>
    </AuthProvider>
  );
};

export default App;
