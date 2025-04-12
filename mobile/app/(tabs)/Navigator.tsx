// app/Navigator.tsx
import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../components/Login';
import Register from '../components/Register';
import TodoList from '../components/TodoList';
import NewItem from '../components/NewItem';
import { TodoContext } from '../context/TodoContext';

const Stack = createNativeStackNavigator();

export default function Navigator() {
  const { user } = useContext(TodoContext);
  const isLoggedIn = user && user.isLoggedIn;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </>
      ) : (
        <>
          <Stack.Screen name="TodoList" component={TodoList} />
          <Stack.Screen name="NewItem" component={NewItem} />
        </>
      )}
    </Stack.Navigator>
  );
}
