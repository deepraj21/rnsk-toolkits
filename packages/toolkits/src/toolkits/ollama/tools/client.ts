// @ts-nocheck
// Shared HTTP helper for the Ollama API (native + OpenAI-compatible endpoints).
// Endpoints verified against https://docs.ollama.com/api and the spec at
// https://github.com/ollama/ollama/blob/main/docs/openapi.yaml (security: []).

export const DEFAULT_BASE_URL = 'http://localhost:11434';

export interface OllamaCredentials {
  baseUrl: string;
  apiKey?: string;
}

export function parseOllamaCredentials(ollamaCredentials?: string): OllamaCredentials {
  if (!ollamaCredentials) return { baseUrl: DEFAULT_BASE_URL };
  let parsed: Partial<OllamaCredentials>;
  try {
    parsed = JSON.parse(ollamaCredentials) as Partial<OllamaCredentials>;
  } catch {
    throw new Error('Ollama credentials must be JSON like {"baseUrl":"http://localhost:11434"}');
  }
  return {
    baseUrl: (parsed.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, ''),
    ...(parsed.apiKey ? { apiKey: parsed.apiKey } : {}),
  };
}

export interface OllamaResponse {
  ok: boolean;
  status: number;
  data: any;
}

/** Parse an NDJSON streaming response into individual events. */
function parseNdjson(text: string): any[] {
  const events: any[] = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      events.push(JSON.parse(trimmed));
    } catch {
      events.push({ raw: trimmed });
    }
  }
  return events;
}

export async function ollamaRequest(
  ollamaCredentials: string | undefined,
  path: string,
  options?: {
    method?: string;
    body?: unknown;
  },
): Promise<OllamaResponse> {
  let credentials: OllamaCredentials;
  try {
    credentials = parseOllamaCredentials(ollamaCredentials);
  } catch (error) {
    return {
      ok: false,
      status: 400,
      data: { error: error instanceof Error ? error.message : 'Invalid Ollama credentials' },
    };
  }
  const url = `${credentials.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (credentials.apiKey) {
    headers.Authorization = `Bearer ${credentials.apiKey}`;
  }
  const response = await fetch(url, {
    method: options?.method ?? 'GET',
    headers,
    body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const contentType = response.headers.get('content-type') ?? '';
  const text = await response.text().catch(() => '');
  let data: any;
  if (
    contentType.includes('x-ndjson') ||
    (text.includes('\n') && text.trimStart().startsWith('{'))
  ) {
    const events = parseNdjson(text);
    data = events.length === 1 ? events[0] : events;
  } else {
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }
  }
  return { ok: response.ok, status: response.status, data };
}

export function failedResult(action: string, result: OllamaResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toOllamaError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
