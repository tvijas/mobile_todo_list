import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, PendingChange } from '../types/task';
const TASKS_STORAGE_KEY = '@todo_app:tasks';
const PENDING_CHANGES_KEY = '@todo_app:pending_changes';

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

export const clearTasks = async (): Promise<void> => {
try {
    await AsyncStorage.removeItem(TASKS_STORAGE_KEY);
    return;
  } catch (error) {
    console.error('Error clearing tasks from storage:', error);
    return;
  }  
}

export const savePendingChanges = async (changes: PendingChange[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify(changes));
  } catch (error) {
    console.error('Error saving pending changes to storage:', error);
    throw error;
  }
};

export const clearSavedPendingChanges = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PENDING_CHANGES_KEY);
    return;
  } catch (error) {
    console.error('Error clearing pending changes from storage:', error);
    return;
  }
}
export const getPendingChanges = async (): Promise<PendingChange[]> => {
  try {
    const changesJson = await AsyncStorage.getItem(PENDING_CHANGES_KEY);
    return changesJson ? JSON.parse(changesJson) : [];
  } catch (error) {
    console.error('Error getting pending changes from storage:', error);
    return [];
  }
};