// context/TodoContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TodoContext = createContext < any > (null);

export const TodoProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState < any[] > ([]);
  const [filter, setFilter] = useState < 'coming' | 'past' | 'completed' > ('coming');
  const [user, setUser] = useState < any > (null);

  // Load tasks and user from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem('tasks');
        const savedUser = await AsyncStorage.getItem('user');

        if (savedTasks) setTasks(JSON.parse(savedTasks));
        if (savedUser) setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Error loading data', err);
      }
    };

    loadData();
  }, []);

  // Save tasks when they change
  useEffect(() => {
    AsyncStorage.setItem('tasks', JSON.stringify(tasks)).catch(console.error);
  }, [tasks]);

  // Save user when they change
  useEffect(() => {
    AsyncStorage.setItem('user', JSON.stringify(user)).catch(console.error);
  }, [user]);

  const addTask = (task: any) => {
    setTasks([...tasks, task]);
  };

  const toggleComplete = (id: string) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getFilteredTasks = () => {
    const now = new Date();

    switch (filter) {
      case 'coming':
        return tasks.filter(task =>
          !task.completed && new Date(task.dueDate) > now
        );
      case 'past':
        return tasks.filter(task =>
          !task.completed && new Date(task.dueDate) <= now
        );
      case 'completed':
        return tasks.filter(task => task.completed);
      default:
        return tasks;
    }
  };

  return (
    <TodoContext.Provider
      value={{
        tasks,
        addTask,
        toggleComplete,
        filter,
        setFilter,
        getFilteredTasks,
        user,
        setUser
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};
