import React, { useState, useEffect } from "react";
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
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { Task, CreateTaskRequest, UpdateTaskRequest } from "../types/task";

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
  const [name, setName] = useState(task?.name || "");
  const [deadline, setDeadline] = useState<Date | null>(
    task?.deadLine ? new Date(task.deadLine) : null
  );
  const [notification, setNotification] = useState<Date | null>(
    task?.notificationDateTime ? new Date(task.notificationDateTime) : null
  );
  const [isFinished, setIsFinished] = useState(task?.isFinished || false);
  const [showDeadLineDate, setShowDeadLineDatePicker] = useState(false);
  const [showDeadLineTime, setShowDeadLineTimePicker] = useState(false);
  const [showNotificationDate, setShowNotificationDatePicker] = useState(false);
  const [showNotificationTime, setShowNotificationTimePicker] = useState(false);

  const isEditing = !!task;

  const handleDeadLineDateChange = (event: any, selectedDate?: Date) => {
    setShowDeadLineDatePicker(Platform.OS === "ios");

    if (selectedDate) {
      const currentDeadline = deadline || new Date();
      selectedDate.setHours(currentDeadline.getHours());
      selectedDate.setMinutes(currentDeadline.getMinutes());
      setDeadline(selectedDate);
    }
  };

  const handleDeadLineTimeChange = (event: any, selectedTime?: Date) => {
    setShowDeadLineTimePicker(Platform.OS === "ios");

    if (selectedTime) {
      const newDeadline = deadline || new Date();
      newDeadline.setHours(selectedTime.getHours());
      newDeadline.setMinutes(selectedTime.getMinutes());
      setDeadline(new Date(newDeadline));
    }
  };

  const showDeadLineDatePicker = () => {
    setShowDeadLineDatePicker(true);
  };

  const showDeadLineTimePicker = () => {
    setShowDeadLineTimePicker(true);
  };

  const handleNotificationDateChange = (event: any, selectedDate?: Date) => {
    setShowNotificationDatePicker(Platform.OS === "ios");

    if (selectedDate) {
      const currentNotification = deadline || new Date();
      selectedDate.setHours(currentNotification.getHours());
      selectedDate.setMinutes(currentNotification.getMinutes());
      setNotification(selectedDate);
    }
  };

  const handleNotificationTimeChange = (event: any, selectedTime?: Date) => {
    setShowNotificationTimePicker(Platform.OS === "ios");

    if (selectedTime) {
      const newNotification = notification || new Date();
      newNotification.setHours(selectedTime.getHours()+ 2);
      newNotification.setMinutes(selectedTime.getMinutes());
      setNotification(new Date(newNotification));
    }
  };

  const showNotificationDatePicker = () => {
    setShowNotificationDatePicker(true);
  };

  const showNotificationTimePicker = () => {
    setShowNotificationTimePicker(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      return; 
    }

    const data: CreateTaskRequest | UpdateTaskRequest = {
      name,
      deadLine: deadline ? deadline.toISOString() : undefined,
      notificationDateTime: notification ? notification.toISOString() : undefined,
    };

    if (!isEditing) {
      (data as CreateTaskRequest).isFinished = isFinished;
    }

    onSubmit(data);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
              onPress={showDeadLineDatePicker}
            >
              <Text style={styles.dateTimeButtonText}>
                {deadline ? format(deadline, "MMM d, yyyy") : "Select Date"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={showDeadLineTimePicker}
            >
              <Text style={styles.dateTimeButtonText}>
                {deadline ? format(deadline, "HH:mm") : "Select Time"}
              </Text>
            </TouchableOpacity>
          </View>

          {showDeadLineDate && (
            <DateTimePicker
              value={deadline || new Date()}
              mode="date"
              display="default"
              onChange={handleDeadLineDateChange}
              minimumDate={new Date()}
            />
          )}

          {showDeadLineTime && (
            <DateTimePicker
              value={deadline || new Date()}
              mode="time"
              display="default"
              onChange={handleDeadLineTimeChange}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Notification time (Optional)</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={showNotificationDatePicker}
            >
              <Text style={styles.dateTimeButtonText}>
                {notification
                  ? format(notification, "MMM d, yyyy")
                  : "Select Date"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={showNotificationTimePicker}
            >
              <Text style={styles.dateTimeButtonText}>
                {notification ? format(notification, "HH:mm") : "Select Time"}
              </Text>
            </TouchableOpacity>
          </View>

          {showNotificationDate && (
            <DateTimePicker
              value={notification || new Date()}
              mode="date"
              display="default"
              onChange={handleNotificationDateChange}
              minimumDate={new Date()}
            />
          )}

          {showNotificationTime && (
            <DateTimePicker
              value={notification || new Date()}
              mode="time"
              display="default"
              onChange={handleNotificationTimeChange}
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
                trackColor={{ false: "#E0E0E0", true: "#4CAF50" }}
                thumbColor={isFinished ? "#FFFFFF" : "#F5F5F5"}
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
              {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
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
    backgroundColor: "#FFFFFF",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
    color: "#333333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateTimeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    padding: 12,
    marginRight: 8,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: "#333333",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#757575",
    fontSize: 16,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#2196F3",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  disabledButton: {
    backgroundColor: "#BDBDBD",
  },
});

export default TaskForm;
