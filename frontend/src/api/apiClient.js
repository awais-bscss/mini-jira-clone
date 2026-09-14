export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function request(endpoint, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body,
    signal,
    params,
    fallbackMessage = 'Request failed',
    ...rest
  } = options;

  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.set(key, String(val));
      }
    }
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }

  const finalHeaders = { ...headers };
  let finalBody = body;

  if (body !== undefined && typeof body === 'object' && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = finalHeaders['Content-Type'] || 'application/json';
    finalBody = JSON.stringify(body);
  }

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: finalBody,
    signal,
    ...rest,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.error || `${fallbackMessage}: ${res.status}`, res.status, data);
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}

export const apiClient = {
  get: (url, options = {}) => request(url, { ...options, method: 'GET' }),
  post: (url, body, options = {}) => request(url, { ...options, method: 'POST', body }),
  patch: (url, body, options = {}) => request(url, { ...options, method: 'PATCH', body }),
  delete: (url, options = {}) => request(url, { ...options, method: 'DELETE' }),

  // Streaming for AI assistant or chunked endpoints
  stream: async (url, options = {}) => {
    const { body, headers = {}, signal, fallbackMessage = 'Stream request failed', ...rest } = options;
    const finalHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: finalHeaders,
      body: typeof body === 'object' ? JSON.stringify(body) : body,
      signal,
      ...rest,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new ApiError(data.error || `${fallbackMessage} (${res.status})`, res.status, data);
    }

    return res;
  },
};
