import type { ApiResponse } from './types';

// Use Next.js API proxy to avoid CORS issues
// Disable proxy by default; only use when explicitly enabled
const USE_PROXY = process.env.NEXT_PUBLIC_USE_API_PROXY === 'true';
const API_BASE_URL = USE_PROXY ? '' : (process.env.NEXT_PUBLIC_BACKEND_URI || 'https://backend-lvlw.onrender.com');
const API_PREFIX = USE_PROXY ? '/api/proxy' : '/api/v1';

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
  
  console.log(`[API Client] ${options.method || 'GET'} ${url} (Proxy: ${USE_PROXY})`, options.body ? '(with body)' : '');
  
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
  
  console.log(`[API Client] Response ${response.status}:`, data);

  if (data.code >= 400 || !response.ok) {
    console.error(`[API Client] Error response:`, data);
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

