import notifee, {
  TimestampTrigger,
  TriggerType,
  AndroidImportance,
  RepeatFrequency,
} from "@notifee/react-native";
import { Task } from "../types/task";
import { getTasks } from "../utils/taskStorage";

class NotificationService {
  async initialize() {
    await this.requestPermissions();
    await this.createNotificationChannels();
  }

  async requestPermissions() {
    await notifee.requestPermission();
  }

  async createNotificationChannels() {
    await notifee.createChannel({
      id: "task-reminders",
      name: "Task Reminders",
      description: "Notifications for upcoming tasks",
      lights: true,
      vibration: true,
      importance: AndroidImportance.HIGH,
    });
  }

  async scheduleTaskNotification(task: Task) {
    if (!task.notificationDateTime || task.isFinished || task.isExpired) {
      return;
    }

    const notificationTime = new Date(task.notificationDateTime).getTime();
    const now = Date.now();

    if (notificationTime <= now) {
      return;
    }

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: notificationTime,
    };

    await notifee.createTriggerNotification(
      {
        id: `task-${task.id}`,
        title: "Task Reminder",
        body: `The task "${task.name}" is about to start.`,
        android: {
          channelId: "task-reminders",
          pressAction: {
            id: "default",
          },
          smallIcon: "ic_launcher",
        },
      },
      trigger
    );

    console.log(
      `Notification scheduled for task: ${task.name} at ${new Date(
        notificationTime
      ).toLocaleString()}`
    );
  }

  async cancelTaskNotification(taskId: string) {
    await notifee.cancelNotification(`task-${taskId}`);
  }

  async rescheduleAllNotifications() {
    try {
      await notifee.cancelAllNotifications();

      const tasks = await getTasks();

      for (const task of tasks) {
        if (!task.isFinished && task.notificationDateTime) {
          await this.scheduleTaskNotification(task);
        }
      }

      console.log("All notifications have been successfully rescheduled");
    } catch (error) {
      console.error("Error while rescheduling notifications:", error);
    }
  }
}

export default new NotificationService();
