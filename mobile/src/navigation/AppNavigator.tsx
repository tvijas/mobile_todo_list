import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import TodoListScreen from "../screens/TodoListScreen";
import EditTodoScreen from "../screens/EditTodoScreen";
import CreateTodoScreen from "../screens/CreateTodoScreen";
import { TodoProvider } from "../store/todoStore";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
const Stack = createNativeStackNavigator();

const TodoNavigator = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: () => {
            setTimeout(() => {
              try {
                logout();
              } catch (error) {
                console.error("Logout error:", error);
              }
            }, 10);
          }
        }
      ]
    );
  };

  return (
    <TodoProvider>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        <Stack.Screen
          name="TodoList"
          component={TodoListScreen}
          options={() => ({
            headerShown: true,
            header: () => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#FFFFFF",
                  paddingHorizontal: 16,
                  paddingVertical: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: "#E0E0E0",
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  Todo list
                </Text>
                <TouchableOpacity style={{ marginRight: 6 }} onPress={handleLogout}>
                  <Icon name="logout" size={24} color="#007AFF" />
                </TouchableOpacity>
              </View>
            ),
          })}
        />
        <Stack.Screen
          name="CreateTodo"
          component={CreateTodoScreen}
          options={{ title: "New Task" }}
        />
        <Stack.Screen
          name="EditTodo"
          component={EditTodoScreen}
          options={{ title: "Edit Task" }}
        />
      </Stack.Navigator>
    </TodoProvider>
  );
};

const AppNavigator = () => {
  const { state } = useAuth();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {state.isAuthenticated ? (
        <Stack.Screen
          name="TodoApp"
          component={TodoNavigator}
        />
      ) : (
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
