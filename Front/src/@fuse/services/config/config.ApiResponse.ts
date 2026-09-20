export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  title: string;
  status: number;
  detail: string;
}
