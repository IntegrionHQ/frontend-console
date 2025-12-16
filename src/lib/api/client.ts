import type { ApiResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URI || 'http://localhost:3001';
const API_PREFIX = '/api/v1';

class ApiError extends Error {
  constructor(
    public code: number,
    public message: string,
    public error: { name: string; details?: string | object } | null
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${API_PREFIX}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  };

  const response = await fetch(url, config);
  const data: ApiResponse<T> = await response.json();

  if (data.code >= 400 || !response.ok) {
    throw new ApiError(
      data.code || response.status,
      data.message || 'Request failed',
      data.error
    );
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};

export { ApiError };

