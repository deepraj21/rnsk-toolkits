// @ts-nocheck
import { z } from 'zod';

export const FIGMA_API_BASE = 'https://api.figma.com';
export const FIGMA_SCIM_BASE = 'https://www.figma.com/scim/v2';

export const figmaTokenField = z.string().describe('Figma OAuth access token (sent as Bearer)');

export function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) search.set(key, String(value));
    }
    const qs = search.toString();
    return qs ? `?${qs}` : '';
}

export async function figmaRequest(
    figmaToken: string,
    path: string,
    options?: {
        method?: string;
        query?: Record<string, string | number | boolean | undefined>;
        body?: unknown;
        base?: string;
    },
) {
    const base = options?.base ?? FIGMA_API_BASE;
    const url = `${base}${path}${buildQuery(options?.query ?? {})}`;
    const response = await fetch(url, {
        method: options?.method ?? 'GET',
        headers: {
            Authorization: `Bearer ${figmaToken}`,
            ...(options?.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        },
        body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        return { ok: false as const, error: details };
    }

    if (response.status === 204) {
        return { ok: true as const, data: { success: true } };
    }

    const data = await response.json().catch(() => ({}));
    return { ok: true as const, data };
}
