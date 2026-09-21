// @ts-nocheck
import { z } from 'zod';

export const NERDGRAPH_URL = 'https://api.newrelic.com/graphql';
export const REST_V2_BASE = 'https://api.newrelic.com/v2';
export const INFRA_API_BASE = 'https://infra-api.newrelic.com/v2';
export const SYNTHETICS_API_BASE = 'https://synthetics.newrelic.com/synthetics/api/v3';
export const LOOKUPS_API_BASE = 'https://nrql-lookup.service.newrelic.com/v1';
export const EVENTS_API_BASE = 'https://insights-collector.newrelic.com/v1';
export const TRACE_API_BASE = 'https://trace-api.newrelic.com/trace/v1';

export const newRelicApiKeyField = z
    .string()
    .optional()
    .describe('New Relic user API key (NRAK-...). Injected at runtime — find it at one.newrelic.com > API keys.');

export function missingKey() {
    return { error: 'New Relic API key is required. Connect New Relic first.' };
}

async function parseBody(response: Response): Promise<any> {
    const text = await response.text();
    if (!text) return {};
    try {
        return JSON.parse(text);
    } catch {
        return { raw: text };
    }
}

export interface NrRequestOptions {
    method?: string;
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
    headers?: Record<string, string>;
}

export async function nrFetch(url: string, apiKey: string | undefined, options?: NrRequestOptions) {
    if (!apiKey) return { ok: false as const, error: missingKey() };
    let full = url;
    if (options?.query) {
        const search = new URLSearchParams();
        for (const [k, v] of Object.entries(options.query)) {
            if (v !== undefined) search.set(k, String(v));
        }
        const qs = search.toString();
        if (qs) full += (full.includes('?') ? '&' : '?') + qs;
    }
    const headers: Record<string, string> = { 'Api-Key': apiKey, ...(options?.headers ?? {}) };
    if (options?.body !== undefined && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    try {
        const response = await fetch(full, {
            method: options?.method ?? 'GET',
            headers,
            body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
        });
        const data = await parseBody(response);
        if (!response.ok) return { ok: false as const, error: data };
        return { ok: true as const, data };
    } catch (error) {
        return { ok: false as const, error: { message: error instanceof Error ? error.message : 'Unknown error' } };
    }
}

/** NerdGraph GraphQL request. Returns raw { data, errors } on success. */
export async function nerdgraph(apiKey: string | undefined, query: string, variables?: Record<string, unknown>, action = 'call NerdGraph') {
    const result = await nrFetch(NERDGRAPH_URL, apiKey, {
        method: 'POST',
        body: { query, variables: variables ?? {} },
    });
    if (!result.ok) {
        if ((result.error as any)?.error) return result.error;
        return { error: `Failed to ${action}`, details: result.error };
    }
    return (result as any).data;
}

/** REST API v2 request (api.newrelic.com/v2). */
export async function restV2(
    apiKey: string | undefined,
    method: string,
    path: string,
    options?: { query?: Record<string, string | number | boolean | undefined>; body?: unknown },
    action = 'call New Relic REST API',
) {
    try {
        const result = await nrFetch(`${REST_V2_BASE}${path}`, apiKey, { method, ...options });
        if (!result.ok) {
            if ((result.error as any)?.error) return result.error;
            return { error: `Failed to ${action}`, details: result.error };
        }
        return (result as any).data;
    } catch (error) {
        return { error: `Error while trying to ${action}`, message: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/** Infrastructure alerts API (infra-api.newrelic.com/v2). Bodies are wrapped in { data }. */
export async function infraApi(
    apiKey: string | undefined,
    method: string,
    path: string,
    options?: { query?: Record<string, string | number | boolean | undefined>; data?: unknown },
    action = 'call New Relic Infrastructure API',
) {
    try {
        const result = await nrFetch(`${INFRA_API_BASE}${path}`, apiKey, {
            method,
            query: options?.query,
            body: options?.data !== undefined ? { data: options.data } : undefined,
        });
        if (!result.ok) {
            if ((result.error as any)?.error) return result.error;
            return { error: `Failed to ${action}`, details: result.error };
        }
        return (result as any).data;
    } catch (error) {
        return { error: `Error while trying to ${action}`, message: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/** Synthetics REST API v3 (uses X-Api-Key with a User/Admin key). */
export async function synthApi(
    apiKey: string | undefined,
    method: string,
    path: string,
    options?: { query?: Record<string, string | number | boolean | undefined>; body?: unknown },
    action = 'call New Relic Synthetics API',
) {
    try {
        if (!apiKey) return missingKey();
        let full = `${SYNTHETICS_API_BASE}${path}`;
        if (options?.query) {
            const search = new URLSearchParams();
            for (const [k, v] of Object.entries(options.query)) {
                if (v !== undefined) search.set(k, String(v));
            }
            const qs = search.toString();
            if (qs) full += `?${qs}`;
        }
        const headers: Record<string, string> = { 'X-Api-Key': apiKey };
        if (options?.body !== undefined) headers['Content-Type'] = 'application/json';
        const response = await fetch(full, {
            method,
            headers,
            body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
        });
        if (response.status === 204) return { success: true };
        const data = await parseBody(response);
        if (!response.ok) return { error: `Failed to ${action}`, details: data };
        return data;
    } catch (error) {
        return { error: `Error while trying to ${action}`, message: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/** NRQL Lookups API (lookup tables). */
export async function lookupsApi(
    apiKey: string | undefined,
    method: string,
    path: string,
    options?: { query?: Record<string, string | number | boolean | undefined>; body?: unknown },
    action = 'call New Relic Lookups API',
) {
    try {
        const result = await nrFetch(`${LOOKUPS_API_BASE}${path}`, apiKey, {
            method,
            ...options,
            headers: { Accept: 'application/json' },
        });
        if (!result.ok) {
            if ((result.error as any)?.error) return result.error;
            return { error: `Failed to ${action}`, details: result.error };
        }
        return (result as any).data;
    } catch (error) {
        return { error: `Error while trying to ${action}`, message: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export const accountIdField = (desc = 'New Relic account ID') =>
    z.number().int().positive().describe(desc);

export const tagInput = z.object({
    key: z.string().describe('Tag key, e.g. environment'),
    values: z.array(z.string()).min(1).describe('Tag values for this key'),
});

export const RULE_RESULT_FIELDS = 'errors { message type } rule { id action enabled evalOrder matchExpression notes replacement terminateChain applicationGuid applicationName createdAt }';
