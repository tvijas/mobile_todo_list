import apiClient from "./client";
import { Task, CreateTaskRequest, UpdateTaskRequest } from "../types/task";
import { UUID } from "../types/common";
import { formatDateToRequiredString, formatDateForApi } from "../utils/dateHelpers";


export const taskApi = {
  getAll: async (): Promise<Task[]> => {
    const response = await apiClient.get("/api/task");
    console.log(response.data);
    return response.data.map((task: Task) => ({ ...task, isSynced: true }));
  },

  create: async (task: CreateTaskRequest): Promise<Task> => {
    const formattedTask = {
      ...task,
      deadLine: task.deadLine ? formatDateForApi(task.deadLine) : undefined,
      notificationDateTime: task.notificationDateTime
        ? formatDateForApi(task.notificationDateTime)
        : undefined,
    };

    const response = await apiClient.post("/api/task", formattedTask);
    const createdTask: Task = { ...response.data, isSynced: true };
    return createdTask;
  },

  update: async (id: UUID, task: UpdateTaskRequest): Promise<Task> => {
    const params = new URLSearchParams();
    if (task.name) params.append("name", task.name);
    if (task.deadLine)
      params.append(
        "deadLine",
        formatDateToRequiredString(new Date(task.deadLine))
      );
    if (task.notificationDateTime)
      params.append(
        "notificationDateTime",
        formatDateToRequiredString(new Date(task.notificationDateTime))
      );
    const url = `/api/task/${id}?${params.toString()}`;
    const response = await apiClient.put(url);
    const createdTask: Task = { ...response.data, isSynced: true };
    return createdTask;
  },

  finish: async (id: UUID): Promise<Task> => {
    const response = await apiClient.patch(`/api/task/${id}`);
    const createdTask: Task = { ...response.data, isSynced: true };
    return createdTask;
  },

  delete: async (id: UUID): Promise<void> => {
    await apiClient.delete(`/api/task/${id}`);
  },
};
