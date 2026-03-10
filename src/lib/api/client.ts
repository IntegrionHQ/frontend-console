import type { ApiResponse } from './types';

// Use Next.js API proxy by default unless explicitly disabled
const USE_PROXY = process.env.NEXT_PUBLIC_USE_API_PROXY !== 'false';
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

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  };

  const response = await fetch(url, config);

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/signin';
    }

    throw new ApiError(
      401,
      'Unauthorized',
      { name: 'AuthError', details: 'Session expired or not authenticated' }
    );
  }

  const text = await response.text();
  let data: ApiResponse<T>;

  try {
    const parsed = text ? JSON.parse(text) : null;
    const isApiResponse =
      parsed &&
      typeof parsed === 'object' &&
      ('data' in parsed || 'code' in parsed || 'message' in parsed || 'error' in parsed);

    if (isApiResponse) {
      const parsedAny = parsed as Partial<ApiResponse<T>> & { data?: T };
      data = {
        code: typeof parsedAny.code === 'number' ? parsedAny.code : response.status,
        message: parsedAny.message || response.statusText,
        data: parsedAny.data ?? (parsed as T),
        error: parsedAny.error ?? null,
      };
    } else {
      data = {
        code: response.status,
        message: response.statusText,
        data: parsed as T | null,
        error: null,
      };
    }
  } catch (e) {
    console.error('[API Client] Failed to parse JSON:', e, 'Raw response:', text);
    data = {
      code: response.status,
      message: response.statusText || 'Request failed',
      data: null,
      error: null,
    } as ApiResponse<T>;
  }

  if ((data.code ?? response.status) >= 400 || !response.ok) {
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

