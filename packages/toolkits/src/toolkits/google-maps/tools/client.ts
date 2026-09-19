// @ts-nocheck
import { z } from 'zod';

export const PLACES_API_BASE = 'https://places.googleapis.com/v1';
export const ROUTES_API_BASE = 'https://routes.googleapis.com';
export const GEOCODE_API_BASE = 'https://geocode.googleapis.com/v4beta';
export const TILE_API_BASE = 'https://tile.googleapis.com/v1';
export const AERIAL_API_BASE = 'https://aerialview.googleapis.com/v1';

export const googleMapsTokenField = z.string().describe('Google Maps OAuth access token (Bearer)');

export function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) search.set(key, String(value));
    }
    const qs = search.toString();
    return qs ? `?${qs}` : '';
}

export interface MapsRequestOptions {
    method?: string;
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
    headers?: Record<string, string>;
    responseType?: 'json' | 'bytes';
}

export async function mapsRequest(
    googleMapsToken: string,
    base: string,
    path: string,
    options?: MapsRequestOptions,
) {
    const url = `${base}${path}${buildQuery(options?.query ?? {})}`;
    const headers: Record<string, string> = { Authorization: `Bearer ${googleMapsToken}` };
    if (options?.body !== undefined) headers['Content-Type'] = 'application/json';
    if (options?.headers) Object.assign(headers, options.headers);
    const response = await fetch(url, {
        method: options?.method ?? 'GET',
        headers,
        body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        return { ok: false as const, error: details };
    }

    if (response.status === 204) {
        return { ok: true as const, data: { success: true } };
    }

    if (options?.responseType === 'bytes') {
        const bytes = Buffer.from(await response.arrayBuffer());
        return {
            ok: true as const,
            data: { contentBase64: bytes.toString('base64'), byteSize: bytes.length, mimetype: response.headers.get('content-type') ?? 'application/octet-stream' },
        };
    }

    const data = await response.json().catch(() => ({}));
    return { ok: true as const, data };
}

export function toFieldMask(mask: string | undefined, prefix: string, fallback: string): string {
    if (!mask || mask.trim() === '' || mask.trim() === '*') return fallback;
    return mask
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean)
        .map((f) => {
            if (f.startsWith(`${prefix}.`) || f === prefix) return f;
            const aliases: Record<string, string> = {
                name: 'displayName',
                address: 'formattedAddress',
                url: 'websiteUri',
                website: 'websiteUri',
                type: 'types',
                phone: 'nationalPhoneNumber',
            };
            return `${prefix}.${aliases[f] ?? f}`;
        })
        .join(',');
}

export function normalizePlaceName(name: string): string {
    return name.startsWith('places/') ? name : `places/${name}`;
}
