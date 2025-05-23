import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreateTaskRequest } from '../types/task';
import { useTodo } from '../store/todoStore';
import TaskForm from '../components/TaskForm';

type RootStackParamList = {
  TodoList: undefined;
  CreateTodo: undefined;
};

type CreateTodoScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateTodo'>;
};

const CreateTodoScreen: React.FC<CreateTodoScreenProps> = ({ navigation }) => {
  const { createTask, state } = useTodo();
  const { isLoading } = state;

  const handleSubmit = async (data: CreateTaskRequest) => {
    await createTask(data);
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TaskForm
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

export default CreateTodoScreen;