// @ts-nocheck
import { z } from 'zod';

export const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
export const YOUTUBE_UPLOAD_BASE = 'https://www.googleapis.com/upload/youtube/v3';

export const youtubeTokenField = z.string().describe('The YouTube OAuth access token (Bearer)');
export const onBehalfOfContentOwnerField = z
    .string()
    .optional()
    .describe('For content partners only: CMS user acting on behalf of this content owner');

export function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) search.set(key, String(value));
    }
    const qs = search.toString();
    return qs ? `?${qs}` : '';
}

export async function youtubeRequest(
    youtubeToken: string,
    path: string,
    options?: {
        method?: string;
        query?: Record<string, string | number | boolean | undefined>;
        body?: unknown;
        responseType?: 'json' | 'text';
    },
) {
    const url = `${YOUTUBE_API_BASE}${path}${buildQuery(options?.query ?? {})}`;
    const response = await fetch(url, {
        method: options?.method ?? 'GET',
        headers: {
            Authorization: `Bearer ${youtubeToken}`,
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

    if (options?.responseType === 'text') {
        return { ok: true as const, data: await response.text() };
    }

    const data = await response.json().catch(() => ({}));
    return { ok: true as const, data };
}

export function chunk<T>(items: T[], size: number): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
    return out;
}

export function extractHandle(input: string): string {
    const trimmed = input.trim();
    const urlMatch = trimmed.match(/youtube\.com\/@([^/?#\s]+)/i);
    if (urlMatch) return urlMatch[1];
    return trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
}
