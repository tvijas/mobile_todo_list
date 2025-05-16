import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '../types/task';
import { formatDateTime } from '../utils/dateHelpers';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onEdit,
  onToggleComplete,
  onDelete,
}) => {
  return (
    <View style={[
      styles.container,
      task.isFinished ? styles.completedTask : null,
      task.isExpired && !task.isFinished ? styles.expiredTask : null,
    ]}>
      <TouchableOpacity 
        style={styles.checkbox}
        onPress={() => onToggleComplete(task.id as string)}
      >
        <Icon
          name={task.isFinished ? 'check-box' : 'check-box-outline-blank'}
          size={24}
          color={task.isFinished ? '#4CAF50' : '#757575'}
        />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.content}
        onPress={() => onEdit(task)}
      >
        <Text style={[
          styles.title,
          task.isFinished ? styles.completedText : null,
        ]}>
          {task.name}
        </Text>
        
        <Text style={[
          styles.deadline,
          task.isExpired && !task.isFinished ? styles.expiredText : null,
        ]}>
          {formatDateTime(task.deadLine)}
          {task.isExpired && !task.isFinished ? ' (Expired)' : ''}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => onDelete(task.id as string)}
      >
        <Icon name="delete" size={24} color="#F44336" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  completedTask: {
    backgroundColor: '#F5F5F5',
  },
  expiredTask: {
    backgroundColor: '#FFEBEE',
  },
  checkbox: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9E9E9E',
  },
  deadline: {
    fontSize: 14,
    color: '#757575',
  },
  expiredText: {
    color: '#F44336',
  },
  deleteButton: {
    padding: 8,
  },
});

export default TaskItem;