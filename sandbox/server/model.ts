// Picks the chat model from whichever FREE provider key is in the env.
//
//   GEMINI_API_KEY (or GOOGLE_GENERATIVE_AI_API_KEY) → Google Gemini, free-tier models only
//   OPENROUTER_API_KEY                               → OpenRouter, ":free" models only
//
// SANDBOX_LLM_PROVIDER picks one when both keys are set (default: gemini, falling back to
// OpenRouter if the Gemini key is rejected). SANDBOX_MODEL overrides the model, but it must
// still be a free one. Keys are verified at startup; with no valid key the sandbox still runs
// and only the Chat tab is disabled.

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import type { LanguageModel } from 'ai';

export type LlmProvider = 'gemini' | 'openrouter';

export type LlmStatus =
  | { ok: true; provider: LlmProvider; modelId: string; model: LanguageModel; note?: string }
  | {
      ok: false;
      code: 'no_llm_key' | 'invalid_llm_key' | 'invalid_llm_config';
      message: string;
      hint: string;
    };

export const GEMINI_FREE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
];
const GEMINI_DEFAULT_MODEL = 'gemini-2.5-flash';

// Used only when the OpenRouter model list can't be fetched.
const OPENROUTER_FALLBACK_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';
// Picked first, in order, when they're in the live free list. Others are still allowed.
const OPENROUTER_PREFERRED = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen3-235b-a22b:free',
  'deepseek/deepseek-chat-v3-0324:free',
  'mistralai/mistral-small-3.2-24b-instruct:free',
];

const KEY_HINT =
  'Add GEMINI_API_KEY (https://aistudio.google.com/apikey) or OPENROUTER_API_KEY (https://openrouter.ai/keys) to sandbox/.env.local — both are free.';

const PROVIDERS = {
  gemini: {
    envName: 'GEMINI_API_KEY',
    keysUrl: 'https://aistudio.google.com/apikey',
    // Lists models; rejects invalid keys with 400/401/403.
    verify: (apiKey: string) =>
      fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1', {
        headers: { 'x-goog-api-key': apiKey },
        signal: AbortSignal.timeout(5000),
      }),
  },
  openrouter: {
    envName: 'OPENROUTER_API_KEY',
    keysUrl: 'https://openrouter.ai/keys',
    // Returns the key's own info; 401 when the key is revoked or unknown.
    verify: (apiKey: string) =>
      fetch('https://openrouter.ai/api/v1/key', {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(5000),
      }),
  },
} as const;

type KeyCheck = { valid: true; note?: string } | { valid: false; reason: string };

async function checkKey(provider: LlmProvider, apiKey: string): Promise<KeyCheck> {
  try {
    const res = await PROVIDERS[provider].verify(apiKey);
    if (res.ok) return { valid: true };
    if ([400, 401, 403].includes(res.status)) {
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      return { valid: false, reason: body?.error?.message ?? `HTTP ${res.status}` };
    }
    return { valid: true, note: `Could not verify the ${provider} key (HTTP ${res.status}).` };
  } catch {
    return { valid: true, note: `Could not verify the ${provider} key (offline?).` };
  }
}

function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

type OpenRouterModel = {
  id: string;
  pricing?: { prompt?: string; completion?: string };
  supported_parameters?: string[];
};

async function listFreeOpenRouterToolModels(): Promise<string[] | null> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const { data } = (await res.json()) as { data: OpenRouterModel[] };
    return data
      .filter(
        (m) =>
          m.id.endsWith(':free') &&
          Number(m.pricing?.prompt ?? 1) === 0 &&
          Number(m.pricing?.completion ?? 1) === 0 &&
          m.supported_parameters?.includes('tools'),
      )
      .map((m) => m.id);
  } catch {
    return null;
  }
}

async function resolveOpenRouter(apiKey: string, requested?: string): Promise<LlmStatus> {
  const openrouter = createOpenRouter({ apiKey });

  if (requested) {
    if (!requested.endsWith(':free')) {
      return {
        ok: false,
        code: 'invalid_llm_config',
        message: `SANDBOX_MODEL "${requested}" is not a free OpenRouter model.`,
        hint: 'Use an id ending in ":free" (see https://openrouter.ai/models?max_price=0) or leave SANDBOX_MODEL empty to auto-pick.',
      };
    }
    return { ok: true, provider: 'openrouter', modelId: requested, model: openrouter.chat(requested) };
  }

  const free = await listFreeOpenRouterToolModels();
  if (!free || free.length === 0) {
    return {
      ok: true,
      provider: 'openrouter',
      modelId: OPENROUTER_FALLBACK_MODEL,
      model: openrouter.chat(OPENROUTER_FALLBACK_MODEL),
      note: 'Could not fetch the OpenRouter model list; using the fallback free model.',
    };
  }
  const modelId = OPENROUTER_PREFERRED.find((id) => free.includes(id)) ?? free[0];
  return { ok: true, provider: 'openrouter', modelId, model: openrouter.chat(modelId) };
}

function resolveGemini(apiKey: string, requested?: string): LlmStatus {
  const modelId = requested ?? GEMINI_DEFAULT_MODEL;
  if (!GEMINI_FREE_MODELS.includes(modelId)) {
    return {
      ok: false,
      code: 'invalid_llm_config',
      message: `SANDBOX_MODEL "${modelId}" is not an allowed free Gemini model.`,
      hint: `Use one of: ${GEMINI_FREE_MODELS.join(', ')}.`,
    };
  }
  const google = createGoogleGenerativeAI({ apiKey });
  return { ok: true, provider: 'gemini', modelId, model: google(modelId) };
}

export async function resolveLlm(): Promise<LlmStatus> {
  const geminiKey = env('GEMINI_API_KEY') ?? env('GOOGLE_GENERATIVE_AI_API_KEY');
  const openrouterKey = env('OPENROUTER_API_KEY');
  const requestedModel = env('SANDBOX_MODEL');
  const preferred = env('SANDBOX_LLM_PROVIDER')?.toLowerCase();

  if (preferred && preferred !== 'gemini' && preferred !== 'openrouter') {
    return {
      ok: false,
      code: 'invalid_llm_config',
      message: `SANDBOX_LLM_PROVIDER "${preferred}" is not supported.`,
      hint: 'Use "gemini" or "openrouter".',
    };
  }

  const keys: Record<LlmProvider, string | undefined> = { gemini: geminiKey, openrouter: openrouterKey };
  // An explicit choice is final; otherwise try Gemini first and fall back to OpenRouter.
  const order: LlmProvider[] = preferred ? [preferred as LlmProvider] : ['gemini', 'openrouter'];
  const candidates = order.filter((provider) => keys[provider]);

  if (candidates.length === 0) {
    return {
      ok: false,
      code: 'no_llm_key',
      message: preferred
        ? `SANDBOX_LLM_PROVIDER is "${preferred}" but its API key is not set.`
        : 'No LLM key found — the Chat tab is disabled (the Tool runner still works).',
      hint: KEY_HINT,
    };
  }

  const rejected: string[] = [];
  for (const provider of candidates) {
    const apiKey = keys[provider]!;
    const check = await checkKey(provider, apiKey);
    if (!check.valid) {
      rejected.push(
        `${PROVIDERS[provider].envName} was rejected by ${provider}: ${check.reason.replace(/\.+$/, '')}`,
      );
      continue;
    }

    const status =
      provider === 'gemini'
        ? resolveGemini(apiKey, requestedModel)
        : await resolveOpenRouter(apiKey, requestedModel);
    if (!status.ok) return status;

    const notes = [...rejected, check.note, status.note].filter(Boolean);
    return notes.length > 0 ? { ...status, note: notes.join(' ') } : status;
  }

  const keysUrls = candidates.map((provider) => PROVIDERS[provider].keysUrl).join(' or ');
  return {
    ok: false,
    code: 'invalid_llm_key',
    message: `${rejected.join('. ')}. The Chat tab is disabled (the Tool runner still works).`,
    hint: `Create a new key at ${keysUrls} and put it in sandbox/.env.local. The server restarts automatically.`,
  };
}

/** Turns provider errors into something a contributor can act on; shown inside the chat. */
export function describeLlmError(error: unknown): string {
  const status =
    (error as { statusCode?: number })?.statusCode ?? (error as { status?: number })?.status;
  const message = error instanceof Error ? error.message : String(error);

  if (status === 429 || /rate.?limit|quota|RESOURCE_EXHAUSTED/i.test(message)) {
    return 'Free-tier rate limit hit. Wait a minute and retry, or switch provider (SANDBOX_LLM_PROVIDER).';
  }
  if (status === 401 || status === 403 || /api key|unauthori[sz]ed/i.test(message)) {
    return 'The LLM provider rejected the API key. Check GEMINI_API_KEY / OPENROUTER_API_KEY in sandbox/.env.local.';
  }
  if (/tool use|support tools|function calling/i.test(message)) {
    return 'This free model does not support tool calling. Set SANDBOX_MODEL to another ":free" model that does.';
  }
  return `LLM error: ${message}`;
}
