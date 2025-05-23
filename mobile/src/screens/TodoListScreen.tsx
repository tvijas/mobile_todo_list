import React, { useCallback, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  RefreshControl,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTodo } from "../store/todoStore";
import { Task } from "../types/task";
import TaskItem from "../components/TaskItem";
import Loading from "../components/Loading";
import Error from "../components/Error";
import NetworkStatus from "../components/NetworkStatus";

type RootStackParamList = {
  TodoList: undefined;
  CreateTodo: undefined;
  EditTodo: { task: Task };
};

type TodoListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "TodoList">;
};

const TodoListScreen: React.FC<TodoListScreenProps> = ({ navigation }) => {
  const { state, fetchTasks, finishTask, deleteTask, syncPendingChanges } =
    useTodo();

  const { tasks, isLoading, error, isOffline, pendingChanges } = state;

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleEditTask = (task: Task) => {
    navigation.navigate("EditTodo", { task });
  };

  const handleToggleComplete = (taskId: string) => {
    finishTask(taskId);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

  const handleRefresh = () => {
    fetchTasks();
  };

  const handleSync = () => {
    syncPendingChanges();
  };

  // Sort tasks: unfinished first, then by deadline (most urgent first)
  const sortedTasks = [...tasks].sort((a, b) => {
    // Unfinished tasks before finished ones
    if (a.isFinished !== b.isFinished) {
      return a.isFinished ? 1 : -1;
    }

    // If both have deadlines, sort by deadline
    if (a.deadLine && b.deadLine) {
      return new Date(a.deadLine).getTime() - new Date(b.deadLine).getTime();
    }

    // Tasks with deadlines before tasks without deadlines
    if (a.deadLine && !b.deadLine) return -1;
    if (!a.deadLine && b.deadLine) return 1;

    // Default: sort by name
    return a.name.localeCompare(b.name);
  });

  // Separate completed and active tasks
  const activeTasks = sortedTasks.filter((task) => !task.isFinished);
  const completedTasks = sortedTasks.filter((task) => task.isFinished);

  // Combine with a section header for completed tasks
  const sectionsWithHeaders = [
    ...activeTasks,
    ...(completedTasks.length > 0
      ? [{ id: "completed-header", isHeader: true }]
      : []),
    ...completedTasks,
  ];

  // Render content based on state
  if (isLoading && tasks.length === 0) {
    return <Loading />;
  }

  if (error && tasks.length === 0) {
    return <Error message={error} onRetry={fetchTasks} />;
  }

  return (
    <View style={styles.container}>
      <NetworkStatus
        isOffline={isOffline}
        pendingChangesCount={pendingChanges.length}
        onSync={handleSync}
      />

      <FlatList
        removeClippedSubviews={false}
        data={sectionsWithHeaders}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }: { item: any }) => {
          if (item.isHeader) {
            return (
              <View style={styles.completedHeader}>
                <Text style={styles.completedHeaderText}>Completed Tasks</Text>
              </View>
            );
          }

          return (
            <TaskItem
              task={item}
              onEdit={handleEditTask}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTask}
            />
          );
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && tasks.length > 0}
            onRefresh={handleRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="check-circle" size={64} color="#BDBDBD" />
            <Text style={styles.emptyText}>No tasks yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to create your first task
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreateTodo")}
      >
        <Icon name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#757575",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9E9E9E",
    marginTop: 8,
    textAlign: "center",
  },
  completedHeader: {
    backgroundColor: "#EEEEEE",
    padding: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  completedHeaderText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#757575",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default TodoListScreen;
