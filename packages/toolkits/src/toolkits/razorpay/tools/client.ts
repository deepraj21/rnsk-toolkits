// @ts-nocheck
import { z } from 'zod';

export const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1';

/** Raw 'key_id:key_secret' pair (Basic auth). Keys: Razorpay Dashboard > Settings > API Keys. */
export const razorpayCredentialsField = z
    .string()
    .optional()
    .describe("Razorpay credentials as 'key_id:key_secret'. Injected at runtime.");

export function missingCredentials() {
    return { error: 'Razorpay credentials are required. Connect Razorpay first with your key_id and key_secret.' };
}

function basicHeader(credentials: string): string {
    return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

export interface RazorpayRequestOptions {
    method?: string;
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
}

export async function razorpayRequest(credentials: string | undefined, path: string, options?: RazorpayRequestOptions, action = 'call Razorpay API') {
    if (!credentials || !credentials.includes(':')) return missingCredentials();
    let url = `${RAZORPAY_API_BASE}${path}`;
    if (options?.query) {
        const search = new URLSearchParams();
        for (const [k, v] of Object.entries(options.query)) {
            if (v !== undefined) search.set(k, String(v));
        }
        const qs = search.toString();
        if (qs) url += `?${qs}`;
    }
    const headers: Record<string, string> = {
        Authorization: basicHeader(credentials),
        Accept: 'application/json',
    };
    if (options?.body !== undefined) headers['Content-Type'] = 'application/json';
    try {
        const response = await fetch(url, {
            method: options?.method ?? 'GET',
            headers,
            body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || (data as any)?.error) {
            return { error: `Failed to ${action}`, details: data };
        }
        return data;
    } catch (error) {
        return { error: `Error while trying to ${action}`, message: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export const paginationFields = {
    count: z.number().int().min(1).max(100).optional().describe('Records per page (default 10, max 100)'),
    skip: z.number().int().min(0).optional().describe('Records to skip (default 0)'),
};

export const timeRangeFields = {
    from: z.number().int().min(0).optional().describe('Unix seconds: records created on/after this time'),
    to: z.number().int().min(0).optional().describe('Unix seconds: records created on/before this time'),
};

/** Recursively convert camelCase keys to snake_case for Razorpay payloads. */
export function toSnakeCase(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(toSnakeCase);
    if (value && typeof value === 'object') {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
            const snake = k.replace(/([A-Z])/g, (m) => `_${m.toLowerCase()}`);
            out[snake] = toSnakeCase(v);
        }
        return out;
    }
    return value;
}
