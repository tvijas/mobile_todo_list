// components/TodoList.js
import React, { useContext, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TodoContext } from '../context/TodoContext';
import TaskItem from './TaskItem';

export default function TodoList() {
  const { filter, setFilter, getFilteredTasks, user } = useContext(TodoContext);
  const navigation = useNavigation();

  useEffect(() => {
    if (!user || !user.isLoggedIn) {
      navigation.navigate('Login');
    }
  }, [user]);

  const filteredTasks = getFilteredTasks();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>To Do List</Text>
        <Button title="+" onPress={() => navigation.navigate('NewItem')} />
      </View>

      <View style={styles.filterRow}>
        <FilterButton label="Coming" active={filter === 'coming'} onPress={() => setFilter('coming')} />
        <FilterButton label="Past due" active={filter === 'past'} onPress={() => setFilter('past')} />
        <FilterButton label="Completed" active={filter === 'completed'} onPress={() => setFilter('completed')} />
      </View>

      {filteredTasks.length === 0 ? (
        <Text style={styles.noTasks}>No tasks to display</Text>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TaskItem task={item} />}
        />
      )}
    </View>
  );
}

function FilterButton({ label, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.filterBtn, active && styles.activeFilter]}>
      <Text style={active ? styles.activeText : styles.filterText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 24 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  filterBtn: { padding: 10, borderRadius: 5, borderWidth: 1, borderColor: '#aaa' },
  activeFilter: { backgroundColor: '#007AFF' },
  filterText: { color: '#333' },
  activeText: { color: '#fff' },
  noTasks: { textAlign: 'center', marginTop: 20 },
});
