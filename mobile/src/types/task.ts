import { UUID } from './common';

export interface Task {
  id: UUID;
  creatorId: UUID;
  name: string;
  deadLine: string; // ISO string format
  isFinished: boolean;
  isExpired: boolean;
  notificationDateTime: string;
}

export interface CreateTaskRequest {
  name: string;
  deadLine: string; // ISO string format
  isFinished: boolean;
  notificationDateTime: string;
}

export interface UpdateTaskRequest {
  name?: string;
  deadLine?: string; // ISO string format
  notificationDateTime: string;
}

export interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;
  pendingChanges: PendingChange[];
}

export type PendingChangeType = 'create' | 'update' | 'finish' | 'delete';

export interface PendingChange {
  type: PendingChangeType;
  taskId?: UUID;
  data?: CreateTaskRequest | UpdateTaskRequest;
  timestamp: number;
}