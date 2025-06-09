import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Task,
  TaskStore,
  CreateTaskRequest,
  UpdateTaskRequest,
  PendingChange,
} from "../types/task";
import { taskApi } from "../api/tasks";
import {
  saveTasks,
  getTasks,
  savePendingChanges,
  getPendingChanges,
  clearSavedPendingChanges,
} from "../utils/taskStorage";
import { networkStatus } from "../utils/networkStatus";
import uuid from "react-native-uuid";
import { useAuth } from "../context/AuthContext";
import { UUID } from "../types/common";
import NotificationService from "../services/NotificationService";
import { updateTaskNotification, updateAllNotifications, cancelTaskNotification } from "../utils/notificationUtils";

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

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(
    !networkStatus.getConnectionStatus()
  );
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);

  const { state: authState } = useAuth();

  // Initialize data and notifications
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await NotificationService.initialize();
        
        const [storedTasks, storedChanges] = await Promise.all([
          getTasks(),
          getPendingChanges(),
        ]);

        setTasks(storedTasks);
        setPendingChanges(storedChanges);
        setIsOffline(!networkStatus.getConnectionStatus());
        
        await updateAllNotifications();
      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    };

    if (authState.isAuthenticated) {
      loadInitialData();
    }
  }, [authState.isAuthenticated]);

  // Save tasks to storage when they change
  useEffect(() => {
    if (tasks.length > 0) {
      saveTasks(tasks);
    }
  }, [tasks]);

  // Save pending changes to storage when they change
  useEffect(() => {
    savePendingChanges(pendingChanges);
  }, [pendingChanges]);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = networkStatus.addListener((isConnected) => {
      setIsOffline(!isConnected);

      if (isConnected && pendingChanges.length > 0) {
        syncPendingChanges();
      }
    });

    return unsubscribe;
  }, [pendingChanges]);

  // Fetch tasks
  const fetchTasks = async () => {
    if (!authState.isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      if (isOffline) {
        // Use cached tasks in offline mode
        const cachedTasks = await getTasks();
        setTasks(cachedTasks);
      } else {
        // Fetch from API when online
        const fetchedTasks = await taskApi.getAll();
        setTasks(fetchedTasks);
        (await getTasks()).forEach(task => console.log("Task setted in localstore after fetch: " + task.id + " is synced: " + task.isSynced));
        // Update cache
        await saveTasks(fetchedTasks);
        
        // Перепланируем уведомления после обновления задач
        await updateAllNotifications();
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setError("Failed to fetch tasks. Please try again.");

      // Fall back to cached tasks
      try {
        const cachedTasks = await getTasks();
        if (cachedTasks.length > 0) {
          setTasks(cachedTasks);
        }
      } catch (cacheError) {
        console.error("Failed to get cached tasks:", cacheError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Create task
  const createTask = async (task: CreateTaskRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isOffline) {
        // Create temporary task in offline mode
        const tempTask: Task = {
          id: uuid.v4() as UUID,
          creatorId: (authState.accessToken || "offline-user") as string,
          name: task.name,
          deadLine: task.deadLine,
          isFinished: task.isFinished || false,
          isExpired: false,
          notificationDateTime: task.notificationDateTime,
          isSynced: false,
        };

        setTasks((currentTasks) => [...currentTasks, tempTask]);

        // Add to pending changes
        const pendingChange: PendingChange = {
          type: "create",
          taskId: tempTask.id,
          data: task,
          tempTask: tempTask,
          timestamp: Date.now(),
        };

        setPendingChanges((current) => [...current, pendingChange]);
        
        if (task.notificationDateTime) {
          await NotificationService.scheduleTaskNotification(tempTask);
        }
      } else {
        // Create task via API when online
        const newTask = await taskApi.create(task);
        setTasks((currentTasks) => [...currentTasks, newTask]);
        
        if (task.notificationDateTime) {
          await NotificationService.scheduleTaskNotification(newTask);
        }
      }
    } catch (error) {
      console.error("Failed to create task:", error);
      setError("Failed to create task. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Update task
  const updateTask = async (id: string, taskUpdate: UpdateTaskRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isOffline) {
        // Update task locally in offline mode
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === id && !task.isSynced
              ? {
                  ...task,
                  name: taskUpdate.name || task.name,
                  deadLine: taskUpdate.deadLine || task.deadLine,
                  notificationDateTime:
                    taskUpdate.notificationDateTime ||
                    task.notificationDateTime,
                }
              : task
          )
        );
        const optionalCreatePendingChange = pendingChanges.find(
          (pendingChange) =>
            pendingChange.taskId === id &&
            pendingChange.type === "create" &&
            !pendingChange.tempTask.isSynced
        );
        if (optionalCreatePendingChange) {
          console.log("pass");
          setPendingChanges((pendingChanges) =>
            pendingChanges.map((change) =>
              change === optionalCreatePendingChange
                ? {
                    ...change,
                    type: "create",
                    data: {
                      ...change.data,
                      name: taskUpdate.name || change.tempTask.name,
                      deadLine: taskUpdate.deadLine || change.tempTask.deadLine,
                      notificationDateTime:
                        taskUpdate.notificationDateTime ||
                        change.tempTask.notificationDateTime,
                    },
                    tempTask: {
                      ...change.tempTask,
                      name: taskUpdate.name || change.tempTask.name,
                      deadLine: taskUpdate.deadLine || change.tempTask.deadLine,
                      notificationDateTime:
                        taskUpdate.notificationDateTime ||
                        change.tempTask.notificationDateTime,
                    },
                  }
                : change
            )
          );
          
          if (taskUpdate.notificationDateTime) {
            const updatedTask = tasks.find(task => task.id === id);
            if (updatedTask) {
              await updateTaskNotification(id);
            }
          }
          
          return;
        }
          // Add to pending changes
          const pendingChange: PendingChange = {
            type: "update",
            taskId: id,
            data: taskUpdate,
            timestamp: Date.now(),
          };

          setPendingChanges((current) => [...current, pendingChange]);
          
          if (taskUpdate.notificationDateTime) {
            await updateTaskNotification(id);
          }
      } else {
        const optionalTask = tasks.find(
          (task) => task.id === id && task.isSynced
        );

        if (!optionalTask) {
          setError("Failed to update task. Please try again.");
          return;
        }

        console.log('found');

        const updatedTask = await taskApi.update(id, taskUpdate);

        console.log("updated task: " + updatedTask)

        setTasks((current) =>
          current.map((task) =>
            task.id === id ? { ...task, ...updatedTask } : task
          )
        );
        
        await updateTaskNotification(id);
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      setError("Failed to update this task");
    } finally {
      setIsLoading(false);
    }
  };

  const finishTask = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isOffline) {
        // Mark task as finished locally
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === id ? { ...task, isFinished: true } : task
          )
        );

        // Add to pending changes
        const pendingChange: PendingChange = {
          type: "finish",
          taskId: id,
          timestamp: Date.now(),
        };

        setPendingChanges((current) => [...current, pendingChange]);
        
        await cancelTaskNotification(id);
      } else {
        const optionalTask = tasks.find(
          (task) => task.id === id && task.isSynced
        );

        if (!optionalTask) {
          setError("Task is not synced. Try sync before doing any changes");
          return;
        }
        // Finish via API when online
        const finishedTask = await taskApi.finish(id);
        setTasks((currentTasks) =>
          currentTasks.map((task) => (task.id === id ? finishedTask : task))
        );
        
        await cancelTaskNotification(id);
      }
    } catch (error) {
      console.error("Failed to finish task:", error);
      setError("Failed to mark task as finished. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete task
  const deleteTask = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isOffline) {
        // Remove task locally
        setTasks((currentTasks) =>
          currentTasks.filter((task) => task.id !== id)
        );

        // Add to pending changes
        const pendingChange: PendingChange = {
          type: "delete",
          taskId: id,
          timestamp: Date.now(),
        };

        setPendingChanges((current) => [...current, pendingChange]);
        
        await cancelTaskNotification(id);
      } else {
        const optionalTask = tasks.find(
          (task) => task.id === id && task.isSynced
        );

        if (!optionalTask) {
          setError("Task is not synced. Try sync before doing any changes");
          return;
        }
        // Delete via API when online
        await taskApi.delete(id);
        setTasks((currentTasks) =>
          currentTasks.filter((task) => task.id !== id)
        );
        
        await cancelTaskNotification(id);
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
      setError("Failed to delete task. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset error
  const resetError = () => {
    setError(null);
  };

  // Sync pending changes when back online
  const syncPendingChanges = async () => {
    if (isOffline || pendingChanges.length === 0) {
      return;
    }

    setIsLoading(true);

    try {
      const taskMap = new Map();

      pendingChanges.forEach((change) => {
        const taskId =
          change.taskId ||
          (change.type === "create" && change.tempTask
            ? change.tempTask.id
            : undefined);

        if (!taskId) return;

        const taskInfo = taskMap.get(taskId) || {
          finalAction: null,
          task: null,
          tempTask: null,
          createData: null,
          timestamp: 0,
        };

        if (change.timestamp > taskInfo.timestamp) {
          taskInfo.finalAction = change.type;
          taskInfo.timestamp = change.timestamp;

          if (change.type === "create" && change.tempTask) {
            taskInfo.tempTask = change.tempTask;
            taskInfo.createData = change.data;
          } else {
            // For updates and finish, we need the current task state
            taskInfo.task = tasks.find((t) => t.id === taskId);
          }
        }

        taskMap.set(taskId, taskInfo);
      });

      for (const [taskId, taskInfo] of taskMap.entries()) {
        try {
          if (taskInfo.finalAction === "delete") {
            // const wasCreatedOffline = pendingChanges.some(
            //   (change) =>
            //     change.type === "create" &&
            //     ((change.tempTask && change.tempTask.id === taskId) ||
            //       change.taskId === taskId)
            // );

            // if (!wasCreatedOffline) {
              // If it was an existing task, delete it on the server
              await taskApi.delete(taskId);
            // }
            
            await cancelTaskNotification(taskId);
          } else if (taskInfo.finalAction === "create" && taskInfo.createData) {
            // Create the task on the server
            console.log("CREATE SYNC: " + pendingChanges);
            const newTask = await taskApi.create(taskInfo.createData);
            
            if (taskInfo.tempTask && taskInfo.tempTask.notificationDateTime) {
              await cancelTaskNotification(taskId);
              await NotificationService.scheduleTaskNotification(newTask);
            }
          } else if (taskInfo.task) {
            // Handle updates and finishes
            if (taskInfo.finalAction === "finish") {
              await taskApi.finish(taskId);
              await cancelTaskNotification(taskId);
            } else if (taskInfo.finalAction === "update") {
              console.log("UPDATE SYNC: " + pendingChanges);
              // Find the most recent update data
              const latestUpdate = [...pendingChanges]
                .filter(
                  (change) =>
                    change.type === "update" &&
                    (change.taskId === taskId ||
                      (change.tempTask && change.tempTask.id === taskId))
                )
                .sort((a, b) => b.timestamp - a.timestamp)[0];

              if (latestUpdate && latestUpdate.data) {
                const updatedTask = await taskApi.update(taskId, latestUpdate.data);
                if (updatedTask.notificationDateTime) {
                  await updateTaskNotification(taskId);
                }
              }
            }
          }
        } catch (error) {
          console.error(`Failed to sync task ${taskId}:`, error);
        }
      }

      // Clear all pending changes
      setPendingChanges([]);
      clearSavedPendingChanges();

      // Refresh tasks from server
      await fetchTasks();
      
      await updateAllNotifications();
    } catch (error) {
      console.error("Failed to sync tasks:", error);
      setError("Failed to sync tasks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Create the context value object
  const state: TaskStore = {
    tasks,
    isLoading,
    error,
    isOffline,
    pendingChanges,
  };

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
    <TodoContext.Provider value={contextValue}>{children}</TodoContext.Provider>
  );
};

export const useTodo = (): TodoContextValue => {
  const context = useContext(TodoContext);

  if (context === undefined) {
    throw new Error("useTodo must be used within a TodoProvider");
  }

  return context;
};