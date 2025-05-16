import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, PendingChange } from '../types/task';
// Keys for AsyncStorage
const TASKS_STORAGE_KEY = '@todo_app:tasks';
const PENDING_CHANGES_KEY = '@todo_app:pending_changes';

// Task storage functions
export const saveTasks = async (tasks: Task[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks to storage:', error);
    throw error;
  }
};

export const getTasks = async (): Promise<Task[]> => {
  try {
    const tasksJson = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    return tasksJson ? JSON.parse(tasksJson) : [];
  } catch (error) {
    console.error('Error getting tasks from storage:', error);
    return [];
  }
};

// Pending changes storage functions
export const savePendingChanges = async (changes: PendingChange[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify(changes));
  } catch (error) {
    console.error('Error saving pending changes to storage:', error);
    throw error;
  }
};

export const getPendingChanges = async (): Promise<PendingChange[]> => {
  try {
    const changesJson = await AsyncStorage.getItem(PENDING_CHANGES_KEY);
    return changesJson ? JSON.parse(changesJson) : [];
  } catch (error) {
    console.error('Error getting pending changes from storage:', error);
    return [];
  }
};