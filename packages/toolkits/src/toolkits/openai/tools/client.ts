// @ts-nocheck
// Shared helpers for the OpenAI toolkit (OpenAI REST API, version v1).
// Endpoint paths verified against the OpenAI API reference
// (developers.openai.com/api/reference — responses, chat, embeddings,
// moderations, images, audio, files, batches, fine-tuning, vector stores):
//   Base: https://api.openai.com/v1
//   Auth: Authorization: Bearer <OpenAI API key>
//   JSON bodies for inference endpoints, multipart/form-data for uploads
//   (files, audio, image edits), binary responses for speech synthesis.

const BASE_URL = 'https://api.openai.com/v1';

export interface OpenAIResponse {
  ok: boolean;
  status: number;
  data: any;
  contentType?: string;
}

/** Guard for the api_key auth: every tool returns this when the key is absent. */
export function missingKey() {
  return { error: 'OpenAI API key is required. Connect OpenAI first.' };
}

function appendQuery(url: URL, query?: Record<string, unknown>) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, String(item));
      continue;
    }
    if (typeof value === 'object') {
      // Objects travel JSON-encoded (e.g. vector store `filters`).
      url.searchParams.set(key, JSON.stringify(value));
      continue;
    }
    url.searchParams.set(key, String(value));
  }
}

async function readBody(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('json')) return response.json().catch(() => null);
  const text = await response.text().catch(() => '');
  return text === '' ? null : text;
}

/**
 * Call the OpenAI API. Returns an envelope — never throws for auth errors.
 * `form` sends multipart/form-data (file uploads), `rawBody` sends a string
 * untouched, and `binary: true` reads the response as base64 (audio files).
 */
export async function openaiRequest(
  openaiApiKey: string | undefined,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    headers?: Record<string, string>;
    body?: unknown;
    form?: FormData;
    rawBody?: string;
    binary?: boolean;
  },
): Promise<OpenAIResponse> {
  if (!openaiApiKey) {
    return { ok: false, status: 401, data: missingKey() };
  }
  const url = new URL(`${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`);
  appendQuery(url, options?.query);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${openaiApiKey}`,
    ...(options?.headers ?? {}),
  };
  const fetchOptions: RequestInit = { method: options?.method ?? 'GET', headers };
  if (options?.form) {
    fetchOptions.body = options.form;
  } else if (options?.rawBody !== undefined) {
    fetchOptions.body = options.rawBody;
    headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
  } else if (options?.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
    headers['Content-Type'] = 'application/json';
  }
  try {
    const response = await fetch(url.toString(), fetchOptions);
    if (options?.binary && response.ok) {
      const bytes = Buffer.from(await response.arrayBuffer()).toString('base64');
      return {
        ok: true,
        status: response.status,
        data: {
          base64: bytes,
          contentType: response.headers.get('content-type') ?? undefined,
        },
        contentType: response.headers.get('content-type') ?? undefined,
      };
    }
    return {
      ok: response.ok,
      status: response.status,
      data: await readBody(response),
      contentType: response.headers.get('content-type') ?? undefined,
    };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      data: { error: error instanceof Error ? error.message : 'OpenAI request failed' },
    };
  }
}

export function failedResult(action: string, result: OpenAIResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toOpenAIError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}

/**
 * Build a multipart FormData body from simple values plus file fields given as
 * `{ base64, filename, contentType }` (or plain strings sent as regular parts).
 */
function appendFilePart(form: FormData, key: string, file: any) {
  const bytes = Buffer.from(String(file.base64).replace(/^data:[^,]+,/, ''), 'base64');
  form.append(
    key,
    new Blob([bytes], { type: file.contentType ?? 'application/octet-stream' }),
    file.filename ?? 'file',
  );
}

export function buildForm(fields: Record<string, any>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === '') continue;
    if (value && typeof value === 'object' && !Array.isArray(value) && 'base64' in value) {
      appendFilePart(form, key, value);
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === 'object' && 'base64' in item) appendFilePart(form, key, item);
        else form.append(key, String(item));
      }
      continue;
    }
    form.append(key, String(value));
  }
  return form;
}
