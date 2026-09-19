// @ts-nocheck
import { z } from 'zod';

export const PHOTOS_API_BASE = 'https://photoslibrary.googleapis.com/v1';

export const googlePhotosTokenField = z.string().describe('Google Photos OAuth access token (Bearer)');

export function buildQuery(params: Record<string, string | number | boolean | string[] | undefined>): string {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined) continue;
        if (Array.isArray(value)) {
            for (const v of value) search.append(key, String(v));
        } else {
            search.set(key, String(value));
        }
    }
    const qs = search.toString();
    return qs ? `?${qs}` : '';
}

export async function photosRequest(
    googlePhotosToken: string,
    path: string,
    options?: {
        method?: string;
        query?: Record<string, string | number | boolean | string[] | undefined>;
        body?: unknown;
    },
) {
    const url = `${PHOTOS_API_BASE}${path}${buildQuery(options?.query ?? {})}`;
    const response = await fetch(url, {
        method: options?.method ?? 'GET',
        headers: {
            Authorization: `Bearer ${googlePhotosToken}`,
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

export async function uploadBytes(googlePhotosToken: string, fileName: string, bytes: Buffer, contentType: string): Promise<string> {
    const response = await fetch(`${PHOTOS_API_BASE}/uploads`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${googlePhotosToken}`,
            'Content-Type': 'application/octet-stream',
            'X-Goog-Upload-Content-Type': contentType,
            'X-Goog-Upload-Protocol': 'raw',
            'X-Goog-Upload-File-Name': fileName,
        },
        body: bytes,
    });
    if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(`Upload failed: ${JSON.stringify(details)}`);
    }
    return response.text();
}

export async function fetchUrlBytes(url: string): Promise<{ bytes: Buffer; contentType: string }> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch file (HTTP ${response.status})`);
    return {
        bytes: Buffer.from(await response.arrayBuffer()),
        contentType: response.headers.get('content-type') ?? 'application/octet-stream',
    };
}

export function fileNameFromUrl(url: string, fallback: string): string {
    try {
        const name = new URL(url).pathname.split('/').filter(Boolean).pop();
        return name && name.includes('.') ? decodeURIComponent(name) : fallback;
    } catch {
        return fallback;
    }
}
