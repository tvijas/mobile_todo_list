import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Task, TaskStore, CreateTaskRequest, UpdateTaskRequest, PendingChange } from '../types/task';
import { taskApi } from '../api/tasks';
import { saveTasks, getTasks, savePendingChanges, getPendingChanges } from '../utils/taskStorage';
import { networkStatus } from '../utils/networkStatus';
import uuid from 'react-native-uuid';
import { useAuth } from '../context/AuthContext';
import { UUID } from '../types/common';

// Action types
type TodoAction =
  | { type: 'FETCH_TASKS_REQUEST' }
  | { type: 'FETCH_TASKS_SUCCESS'; payload: Task[] }
  | { type: 'FETCH_TASKS_FAILURE'; payload: string }
  | { type: 'CREATE_TASK_REQUEST' }
  | { type: 'CREATE_TASK_SUCCESS'; payload: Task }
  | { type: 'CREATE_TASK_FAILURE'; payload: string }
  | { type: 'UPDATE_TASK_REQUEST' }
  | { type: 'UPDATE_TASK_SUCCESS'; payload: Task }
  | { type: 'UPDATE_TASK_FAILURE'; payload: string }
  | { type: 'FINISH_TASK_REQUEST' }
  | { type: 'FINISH_TASK_SUCCESS'; payload: Task }
  | { type: 'FINISH_TASK_FAILURE'; payload: string }
  | { type: 'DELETE_TASK_REQUEST' }
  | { type: 'DELETE_TASK_SUCCESS'; payload: string } // task id
  | { type: 'DELETE_TASK_FAILURE'; payload: string }
  | { type: 'SET_NETWORK_STATUS'; payload: boolean }
  | { type: 'ADD_PENDING_CHANGE'; payload: PendingChange }
  | { type: 'REMOVE_PENDING_CHANGE'; payload: number } // timestamp
  | { type: 'RESET_ERROR' }
  | { type: 'RESTORE_STATE'; payload: Partial<TaskStore> };

// Initial state
const initialState: TaskStore = {
  tasks: [],
  isLoading: false,
  error: null,
  isOffline: false,
  pendingChanges: [],
};

// Reducer
const todoReducer = (state: TaskStore, action: TodoAction): TaskStore => {
  switch (action.type) {
    case 'FETCH_TASKS_REQUEST':
    case 'CREATE_TASK_REQUEST':
    case 'UPDATE_TASK_REQUEST':
    case 'FINISH_TASK_REQUEST':
    case 'DELETE_TASK_REQUEST':
      return { ...state, isLoading: true, error: null };

    case 'FETCH_TASKS_SUCCESS':
      return { ...state, isLoading: false, tasks: action.payload };

    case 'CREATE_TASK_SUCCESS':
      return {
        ...state,
        isLoading: false,
        tasks: [...state.tasks, action.payload],
      };

    case 'UPDATE_TASK_SUCCESS':
    case 'FINISH_TASK_SUCCESS':
      return {
        ...state,
        isLoading: false,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        ),
      };

    case 'DELETE_TASK_SUCCESS':
      return {
        ...state,
        isLoading: false,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };

    case 'FETCH_TASKS_FAILURE':
    case 'CREATE_TASK_FAILURE':
    case 'UPDATE_TASK_FAILURE':
    case 'FINISH_TASK_FAILURE':
    case 'DELETE_TASK_FAILURE':
      return { ...state, isLoading: false, error: action.payload };

    case 'SET_NETWORK_STATUS':
      return { ...state, isOffline: !action.payload };

    case 'ADD_PENDING_CHANGE':
      return {
        ...state,
        pendingChanges: [...state.pendingChanges, action.payload],
      };

    case 'REMOVE_PENDING_CHANGE':
      return {
        ...state,
        pendingChanges: state.pendingChanges.filter(
          change => change.timestamp !== action.payload
        ),
      };

    case 'RESET_ERROR':
      return { ...state, error: null };

    case 'RESTORE_STATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

// Context
interface TodoContextValue {
  state: TaskStore;
  fetchTasks: () => Promise<void>;
  createTask: (task: CreateTaskRequest) => Promise<void>;
  updateTask: (id: string, task: UpdateTaskRequest) => Promise<void>;
  finishTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  resetError: () => void;
  syncPendingChanges: () => Promise<void>;
}

const TodoContext = createContext<TodoContextValue | undefined>(undefined);

// Provider
export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(todoReducer, initialState);
  const { state: authState } = useAuth();

  // Load tasks and pending changes from storage
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [storedTasks, storedChanges] = await Promise.all([
          getTasks(),
          getPendingChanges(),
        ]);
        
        dispatch({
          type: 'RESTORE_STATE',
          payload: {
            tasks: storedTasks,
            pendingChanges: storedChanges,
            isOffline: !networkStatus.getConnectionStatus(),
          },
        });
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    if (authState.isAuthenticated) {
      loadInitialData();
    }
  }, [authState.isAuthenticated]);

  // Save tasks to storage whenever they change
  useEffect(() => {
    if (state.tasks.length > 0) {
      saveTasks(state.tasks);
    }
  }, [state.tasks]);

  // Save pending changes to storage whenever they change
  useEffect(() => {
    if (state.pendingChanges.length > 0) {
      savePendingChanges(state.pendingChanges);
    }
  }, [state.pendingChanges]);

  // Network status monitoring
  useEffect(() => {
    const unsubscribe = networkStatus.addListener((isConnected) => {
      dispatch({ type: 'SET_NETWORK_STATUS', payload: isConnected });
      
      // Try to sync if we're back online
      if (isConnected && state.pendingChanges.length > 0) {
        syncPendingChanges();
      }
    });

    return unsubscribe;
  }, [state.pendingChanges]);

  // Fetch tasks
  const fetchTasks = async () => {
    if (!authState.isAuthenticated) return;
    
    dispatch({ type: 'FETCH_TASKS_REQUEST' });
    
    try {
      if (state.isOffline) {
        // Use cached tasks in offline mode
        const cachedTasks = await getTasks();
        dispatch({ type: 'FETCH_TASKS_SUCCESS', payload: cachedTasks });
      } else {
        // Fetch from API when online
        const tasks = await taskApi.getAll();
        dispatch({ type: 'FETCH_TASKS_SUCCESS', payload: tasks });
        // Update cache
        await saveTasks(tasks);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      dispatch({
        type: 'FETCH_TASKS_FAILURE',
        payload: 'Failed to fetch tasks. Please try again.',
      });
      
      // Fall back to cached tasks
      try {
        const cachedTasks = await getTasks();
        if (cachedTasks.length > 0) {
          dispatch({ type: 'FETCH_TASKS_SUCCESS', payload: cachedTasks });
        }
      } catch (cacheError) {
        console.error('Failed to get cached tasks:', cacheError);
      }
    }
  };

  // Create task
  const createTask = async (task: CreateTaskRequest) => {
    dispatch({ type: 'CREATE_TASK_REQUEST' });
    
    try {
      if (state.isOffline) {
        // Create temporary task in offline mode
        const tempTask: Task = {
          id: uuid.v4() as UUID,
          creatorId: (authState.accessToken || 'offline-user') as string,
          name: task.name,
          deadLine: task.deadLine,
          isFinished: task.isFinished,
          isExpired: false,
          notificationDateTime: task.notificationDateTime
        };
        
        dispatch({ type: 'CREATE_TASK_SUCCESS', payload: tempTask });
        
        // Add to pending changes
        const pendingChange: PendingChange = {
          type: 'create',
          data: task,
          timestamp: Date.now(),
        };
        
        dispatch({ type: 'ADD_PENDING_CHANGE', payload: pendingChange });
      } else {
        // Create task via API when online
        const newTask = await taskApi.create(task);
        dispatch({ type: 'CREATE_TASK_SUCCESS', payload: newTask });
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      dispatch({
        type: 'CREATE_TASK_FAILURE',
        payload: 'Failed to create task. Please try again.',
      });
    }
  };

  // Update task
  const updateTask = async (id: string, taskUpdate: UpdateTaskRequest) => {
    dispatch({ type: 'UPDATE_TASK_REQUEST' });
    
    try {
      if (state.isOffline) {
        // Update task locally in offline mode
        const taskToUpdate = state.tasks.find(task => task.id === id);
        
        if (taskToUpdate) {
          const updatedTask: Task = {
            ...taskToUpdate,
            name: taskUpdate.name || taskToUpdate.name,
            deadLine: taskUpdate.deadLine || taskToUpdate.deadLine,
          };
          
          dispatch({ type: 'UPDATE_TASK_SUCCESS', payload: updatedTask });
          
          // Add to pending changes
          const pendingChange: PendingChange = {
            type: 'update',
            taskId: id as string,
            data: taskUpdate,
            timestamp: Date.now(),
          };
          
          dispatch({ type: 'ADD_PENDING_CHANGE', payload: pendingChange });
        } else {
          throw new Error('Task not found');
        }
      } else {
        // Update via API when online
        const updatedTask = await taskApi.update(id as string, taskUpdate);
        dispatch({ type: 'UPDATE_TASK_SUCCESS', payload: updatedTask });
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      dispatch({
        type: 'UPDATE_TASK_FAILURE',
        payload: 'Failed to update task. Please try again.',
      });
    }
  };

  // Finish task
  const finishTask = async (id: string) => {
    dispatch({ type: 'FINISH_TASK_REQUEST' });
    
    try {
      if (state.isOffline) {
        // Update task locally in offline mode
        const taskToFinish = state.tasks.find(task => task.id === id);
        
        if (taskToFinish) {
          const finishedTask: Task = {
            ...taskToFinish,
            isFinished: true,
          };
          
          dispatch({ type: 'FINISH_TASK_SUCCESS', payload: finishedTask });
          
          // Add to pending changes
          const pendingChange: PendingChange = {
            type: 'finish',
            taskId: id as string,
            timestamp: Date.now(),
          };
          
          dispatch({ type: 'ADD_PENDING_CHANGE', payload: pendingChange });
        } else {
          throw new Error('Task not found');
        }
      } else {
        // Finish via API when online
        const finishedTask = await taskApi.finish(id as string);
        dispatch({ type: 'FINISH_TASK_SUCCESS', payload: finishedTask });
      }
    } catch (error) {
      console.error('Failed to finish task:', error);
      dispatch({
        type: 'FINISH_TASK_FAILURE',
        payload: 'Failed to mark task as finished. Please try again.',
      });
    }
  };

  // Delete task
  const deleteTask = async (id: string) => {
    dispatch({ type: 'DELETE_TASK_REQUEST' });
    
    try {
      if (state.isOffline) {
        // Delete locally in offline mode
        dispatch({ type: 'DELETE_TASK_SUCCESS', payload: id });
        
        // Add to pending changes
        const pendingChange: PendingChange = {
          type: 'delete',
          taskId: id as string,
          timestamp: Date.now(),
        };
        
        dispatch({ type: 'ADD_PENDING_CHANGE', payload: pendingChange });
      } else {
        // Delete via API when online
        await taskApi.delete(id as string);
        dispatch({ type: 'DELETE_TASK_SUCCESS', payload: id });
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      dispatch({
        type: 'DELETE_TASK_FAILURE',
        payload: 'Failed to delete task. Please try again.',
      });
    }
  };

  // Reset error
  const resetError = () => {
    dispatch({ type: 'RESET_ERROR' });
  };

  // Sync pending changes when back online
  const syncPendingChanges = useCallback(async () => {
    if (state.isOffline || state.pendingChanges.length === 0) {
      return;
    }
    
    // Sort changes by timestamp (oldest first)
    const sortedChanges = [...state.pendingChanges].sort(
      (a, b) => a.timestamp - b.timestamp
    );
    
    for (const change of sortedChanges) {
      try {
        switch (change.type) {
          case 'create':
            if (change.data) {
              await taskApi.create(change.data as CreateTaskRequest);
            }
            break;
            
          case 'update':
            if (change.taskId && change.data) {
              await taskApi.update(
                change.taskId as string,
                change.data as UpdateTaskRequest
              );
            }
            break;
            
          case 'finish':
            if (change.taskId) {
              await taskApi.finish(change.taskId as string);
            }
            break;
            
          case 'delete':
            if (change.taskId) {
              await taskApi.delete(change.taskId as string);
            }
            break;
        }
        
        // Remove processed change
        dispatch({ type: 'REMOVE_PENDING_CHANGE', payload: change.timestamp });
      } catch (error) {
        console.error(`Failed to sync ${change.type} operation:`, error);
      }
    }
    
    // Refresh tasks after sync
    await fetchTasks();
  }, [state.isOffline, state.pendingChanges]);

  // Context value
  const contextValue: TodoContextValue = {
    state,
    fetchTasks,
    createTask,
    updateTask,
    finishTask,
    deleteTask,
    resetError,
    syncPendingChanges,
  };

  return (
    <TodoContext.Provider value={contextValue}>
      {children}
    </TodoContext.Provider>
  );
};

// Hook
export const useTodo = (): TodoContextValue => {
  const context = useContext(TodoContext);
  
  if (context === undefined) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  
  return context;
};