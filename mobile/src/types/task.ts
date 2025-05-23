import { UUID } from './common';

export interface Task {
  id: UUID;
  creatorId: UUID;
  name: string;
  deadLine: string; 
  isFinished: boolean;
  isExpired: boolean;
  notificationDateTime: string;
  isSynced: boolean;
}

export interface CreateTaskRequest {
  name: string;
  deadLine: string; 
  isFinished: boolean;
  notificationDateTime: string;
}

export interface UpdateTaskRequest {
  name?: string;
  deadLine?: string; 
  notificationDateTime?: string;
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
  tempTask?: Task; 
  timestamp: number;
}