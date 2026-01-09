export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };
