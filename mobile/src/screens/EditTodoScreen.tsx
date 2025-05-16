// src/screens/EditTodoScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Task, UpdateTaskRequest } from '../types/task';
import { useTodo } from '../store/todoStore';
import TaskForm from '../components/TaskForm';

type RootStackParamList = {
  TodoList: undefined;
  EditTodo: { task: Task };
};

type EditTodoScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EditTodo'>;
  route: RouteProp<RootStackParamList, 'EditTodo'>;
};

const EditTodoScreen: React.FC<EditTodoScreenProps> = ({ navigation, route }) => {
  const { task } = route.params;
  const { updateTask, state } = useTodo();
  const { isLoading } = state;

  const handleSubmit = async (data: UpdateTaskRequest) => {
    await updateTask(task.id as string, data);
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TaskForm
        task={task}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default EditTodoScreen;