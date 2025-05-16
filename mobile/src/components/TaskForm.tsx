import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Platform,
  Switch,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: CreateTaskRequest | UpdateTaskRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [name, setName] = useState(task?.name || '');
  const [deadline, setDeadline] = useState<Date | null>(
    task?.deadLine ? new Date(task.deadLine) : null
  );
  const [isFinished, setIsFinished] = useState(task?.isFinished || false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const isEditing = !!task;

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      const currentDeadline = deadline || new Date();
      selectedDate.setHours(currentDeadline.getHours());
      selectedDate.setMinutes(currentDeadline.getMinutes());
      setDeadline(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    
    if (selectedTime) {
      const newDeadline = deadline || new Date();
      newDeadline.setHours(selectedTime.getHours());
      newDeadline.setMinutes(selectedTime.getMinutes());
      setDeadline(new Date(newDeadline));
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const showTimepicker = () => {
    setShowTimePicker(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      return; // Don't submit with empty name
    }

    const data: CreateTaskRequest | UpdateTaskRequest = {
      name,
      deadLine: deadline ? deadline.toISOString() : undefined,
    };

    // For new tasks, we need to include isFinished
    if (!isEditing) {
      (data as CreateTaskRequest).isFinished = isFinished;
    }

    onSubmit(data);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Task Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter task name"
            autoFocus
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Deadline (Optional)</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={showDatepicker}
            >
              <Text style={styles.dateTimeButtonText}>
                {deadline ? format(deadline, 'MMM d, yyyy') : 'Select Date'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={showTimepicker}
            >
              <Text style={styles.dateTimeButtonText}>
                {deadline ? format(deadline, 'HH:mm') : 'Select Time'}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={deadline || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={deadline || new Date()}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>

        {!isEditing && (
          <View style={styles.formGroup}>
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Mark as Completed</Text>
              <Switch
                value={isFinished}
                onValueChange={setIsFinished}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={isFinished ? '#FFFFFF' : '#F5F5F5'}
              />
            </View>
          </View>
        )}

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              !name.trim() ? styles.disabledButton : null,
            ]}
            onPress={handleSubmit}
            disabled={!name.trim() || isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#333333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 12,
    marginRight: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: '#333333',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#2196F3',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
});

export default TaskForm;