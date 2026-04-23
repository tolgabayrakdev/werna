const BASE_URL = '/api';

interface QueueItem {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown = null, token: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

async function refreshTokens() {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new ApiError(res.status, 'Refresh failed');
  }

  return res.json();
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    let message = 'Bir hata oluştu';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      // JSON parse edilemiyorsa varsayılan mesajı kullan
    }
    throw new ApiError(res.status, message);
  }

  return res.json();
}

export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;

  constructor(status: number, message: string, data: Record<string, unknown> = {}) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: Record<string, unknown>;
}

export async function apiClient(endpoint: string, options: RequestOptions = {}) {
  const { body, headers: customHeaders, ...rest } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const config: RequestInit = {
    credentials: 'include',
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...customHeaders,
    },
    ...rest,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    let res = await fetch(`${BASE_URL}${endpoint}`, config);

    if (res.status === 401) {
      const authEndpoints = ['/auth/login', '/auth/register', '/auth/verify', '/auth/refresh', '/auth/resend-verification'];
      const isAuthEndpoint = authEndpoints.some((ep) => endpoint.startsWith(ep));

      if (isAuthEndpoint) {
        throw new ApiError(res.status, (await res.json().catch(() => ({}))).message || 'Bir hata oluştu');
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return fetch(`${BASE_URL}${endpoint}`, config).then(handleResponse);
        });
      }

      isRefreshing = true;

      try {
        await refreshTokens();
        processQueue();
        res = await fetch(`${BASE_URL}${endpoint}`, config);
        return handleResponse(res);
      } catch (refreshError) {
        processQueue(refreshError);
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    return handleResponse(res);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(0, 'İstek zaman aşımına uğradı. Sunucuya ulaşılamıyor.');
    }
    if (error instanceof TypeError) {
      throw new ApiError(0, 'Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}