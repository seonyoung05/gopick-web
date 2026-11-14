// src/api/client.ts
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

/** 서버 공통 에러 형식 */
export interface ApiErrorBody {
  code: string;
  message: string;
  errors?: Record<string, string>; // VALIDATION_ERROR일 때 필드별 오류
}

export class ApiError extends Error {
  status: number;
  code: string;
  fieldErrors: Record<string, string>;

  constructor(status: number, body?: Partial<ApiErrorBody>) {
    super(body?.message ?? `요청에 실패했어요 (${status})`);
    this.status = status;
    this.code = body?.code ?? 'UNKNOWN_ERROR';
    this.fieldErrors = body?.errors ?? {};
  }
}

type QueryValue = string | number | boolean | null | undefined | readonly (string | number)[];
export type Query = Record<string, QueryValue>;

function toQueryString(query?: Query) {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) value.forEach((v) => params.append(key, String(v)));
    else params.append(key, String(value));
  }
  const s = params.toString();
  return s ? `?${s}` : '';
}

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

async function request<T>(method: Method, path: string, options: { body?: unknown; query?: Query } = {}) {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}${toQueryString(options.query)}`, {
      method,
      headers,
      credentials: 'include', // 세션 쿠키(JSESSIONID)를 항상 같이 보냄
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    // 서버가 꺼져 있거나 인터넷이 끊긴 경우
    throw new ApiError(0, { code: 'NETWORK_ERROR', message: '서버에 연결하지 못했어요.' });
  }

  // 204처럼 본문이 없는 응답도 있음
  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = undefined;
  }

  if (!res.ok) throw new ApiError(res.status, data as Partial<ApiErrorBody>);
  return data as T;
}

export const api = {
  get: <T>(path: string, query?: Query) => request<T>('GET', path, { query }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, { body }),
  delete: <T>(path: string) => request<T>('DELETE', path),
};