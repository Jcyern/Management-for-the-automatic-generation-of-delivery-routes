/**
 * Base URL of the backend API.
 *
 * Uses `VITE_API_URL` when defined; otherwise falls back to
 * `http://localhost:3000`. A trailing slash is removed to avoid
 * double slashes when building endpoint paths.
 */
const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
).replace(/\/$/, '');

/**
 * Error thrown by `request` when the API responds with a non-successful
 * status or when the connection fails.
 *
 * `status` holds the HTTP status code, or `0` for network-level failures.
 */
export class ApiError extends Error {
  readonly status: number;

  /**
   * @param message Human-readable error message.
   * @param status HTTP status code, or `0` for network-level failures.
   */
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Extracts a readable message from a backend error body.
 *
 * NestJS may return `message` as a string or as an array of strings
 * (for example, validation errors). If no message is present, the
 * HTTP status is used as a fallback.
 *
 * @param body Parsed error response body.
 * @param status HTTP status code of the response.
 * @returns A message suitable for displaying to the user.
 */
function getErrorMessage(body: unknown, status: number): string {
  if (body && typeof body === 'object') {
    if ('message' in body) {
      const message = (body as { message?: unknown }).message;
      if (Array.isArray(message)) return message.join(', ');
      if (typeof message === 'string') return message;
    }
    if ('mensaje' in body) {
      const mensaje = (body as { mensaje?: unknown }).mensaje;
      if (typeof mensaje === 'string') return mensaje;
    }
  }
  return `Error ${status}`;
}

/**
 * Performs an HTTP request to the API.
 *
 * Automatically attaches the JWT token (when available) and the
 * appropriate `Content-Type`. Throws `ApiError` when the response is not
 * successful or when the network request fails.
 *
 * @template T Expected type of the response data.
 * @param path Relative endpoint path, for example `'/zona'`.
 * @param options `fetch` options such as method, body, and headers.
 * @returns The parsed response data, or `undefined` when there is no body.
 * @throws {ApiError} When the API returns an error or the connection fails.
 *
 * @example
 * const zonas = await request<Zona[]>('/zona');
 * const nueva = await request<Zona>('/zona', {
 *   method: 'POST',
 *   body: JSON.stringify({ nombre: 'Playa' }),
 * });
 */
export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers);

  const isFormData = options.body instanceof FormData;

  if (options.body && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor', 0);
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new ApiError(getErrorMessage(body, response.status), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
