export type UUID = string;

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
}