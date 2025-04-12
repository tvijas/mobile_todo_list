// components/NewItem.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TodoContext } from '../context/TodoContext';

export default function NewItem() {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { addTask } = useContext(TodoContext);
  const navigation = useNavigation();

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task');
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      title,
      dueDate: dueDate.toISOString(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    addTask(newTask);
    navigation.navigate('TodoList');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Task</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your task"
        value={title}
        onChangeText={setTitle}
        multiline
        numberOfLines={3}
      />

      <View style={styles.dateSection}>
        <Text style={styles.label}>Due Date:</Text>
        <Button title={dueDate.toLocaleString()} onPress={() => setShowDatePicker(true)} />
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="datetime"
          is24Hour={true}
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDueDate(selectedDate);
          }}
        />
      )}

      <Button title="Save Task" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 5,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  dateSection: { marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 8 },
});
