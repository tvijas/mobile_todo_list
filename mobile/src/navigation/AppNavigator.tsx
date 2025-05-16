import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import TestScreen from "../screens/TestScreen";
import TodoListScreen from "../screens/TodoListScreen";
import EditTodoScreen from "../screens/EditTodoScreen";
import CreateTodoScreen from "../screens/CreateTodoScreen";
import Loading from "../components/Loading";
import { TodoProvider } from "../store/todoStore";

const Stack = createNativeStackNavigator();

// Create a separate navigator for todo screens
const TodoNavigator = () => {
  return (
    <TodoProvider>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        <Stack.Screen name="TodoList" component={TodoListScreen} options={{ title: "My Tasks" }} />
        <Stack.Screen name="CreateTodo" component={CreateTodoScreen} options={{ title: "New Task" }} />
        <Stack.Screen name="EditTodo" component={EditTodoScreen} options={{ title: "Edit Task" }} />
        {/* <Stack.Screen name="TestScreen" component={TestScreen} /> */}
      </Stack.Navigator>
    </TodoProvider>
  );
};

const AppNavigator: React.FC = () => {
  const { state } = useAuth();

  if (state.isLoading) {
    return <Loading message="Loading..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {state.isAuthenticated ? (
          <Stack.Screen name="TodoApp" component={TodoNavigator} />
        ) : (
          // User not authenticated - show auth screens
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;