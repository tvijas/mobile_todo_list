// components/TaskItem.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { TodoContext } from '../context/TodoContext';

export default function TaskItem({ task }) {
  const { toggleComplete } = useContext(TodoContext);

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <View style={[styles.taskItem, task.completed && styles.completed]}>
      <Switch
        value={task.completed}
        onValueChange={() => toggleComplete(task.id)}
      />
      <View style={styles.taskContent}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.dueDate}>Due: {formatDate(task.dueDate)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    paddingBottom: 10,
    borderColor: '#ccc',
  },
  completed: {
    opacity: 0.5,
  },
  taskContent: {
    marginLeft: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dueDate: {
    fontSize: 12,
    color: '#666',
  },
});
