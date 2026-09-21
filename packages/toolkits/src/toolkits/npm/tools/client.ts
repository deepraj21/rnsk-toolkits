// @ts-nocheck
import { z } from 'zod';

export const REGISTRY_BASE = 'https://registry.npmjs.org';
export const DOWNLOADS_BASE = 'https://api.npmjs.org';
export const REPLICATE_BASE = 'https://replicate.npmjs.com';

export const npmApiKeyField = z
    .string()
    .optional()
    .describe('npm access token (Bearer). Injected at runtime — create at npmjs.com > Access Tokens.');

export function missingKey() {
    return { error: 'npm API key is required. Connect npm first.' };
}

function authHeaders(apiKey?: string, npmOtp?: string): Record<string, string> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
    if (npmOtp) headers['npm-otp'] = npmOtp;
    return headers;
}

export interface NpmRequestOptions {
    method?: string;
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
    apiKey?: string;
    npmOtp?: string;
}

export async function npmRequest(base: string, path: string, options?: NpmRequestOptions) {
    let url = `${base}${path}`;
    if (options?.query) {
        const search = new URLSearchParams();
        for (const [k, v] of Object.entries(options.query)) {
            if (v !== undefined) search.set(k, String(v));
        }
        const qs = search.toString();
        if (qs) url += `?${qs}`;
    }
    const headers = authHeaders(options?.apiKey, options?.npmOtp);
    if (options?.body !== undefined) headers['Content-Type'] = 'application/json';
    try {
        const response = await fetch(url, {
            method: options?.method ?? 'GET',
            headers,
            body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
        });
        const text = await response.text();
        let data: any = {};
        if (text) {
            try {
                data = JSON.parse(text);
            } catch {
                data = { raw: text };
            }
        }
        if (!response.ok) return { error: 'npm API request failed', status: response.status, details: data };
        return data;
    } catch (error) {
        return { error: 'Error calling npm API', message: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/** Escape a package name for URL paths (scoped packages need %2F). */
export function escapePackage(name: string): string {
    return name.replace('/', '%2F');
}
