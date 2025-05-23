import { Task } from '../types/task';
import { getTasks, saveTasks } from './taskStorage';
import NotificationService from '../services/NotificationService';

export const updateTaskNotification = async (taskId: string) => {
  try {
    const tasks = await getTasks();
    
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      console.error(`Task with ID ${taskId} not found`);
      return;
    }
    
    await NotificationService.cancelTaskNotification(taskId);
    
    if (!task.isFinished && task.notificationDateTime) {
      await NotificationService.scheduleTaskNotification(task);
    }
  } catch (error) {
    console.error('Error while updating task notification:', error);
  }
};

export const updateAllNotifications = async () => {
  try {
    await NotificationService.rescheduleAllNotifications();
  } catch (error) {
    console.error('Error while updating all notifications:', error);
  }
};

export const cancelTaskNotification = async (taskId: string) => {
  try {
    await NotificationService.cancelTaskNotification(taskId);
  } catch (error) {
    console.error(`Error while canceling notification for task ${taskId}:`, error);
  }
};
