// @ts-nocheck
import { z } from 'zod';

export const ADMIN_V1BETA = 'https://analyticsadmin.googleapis.com/v1beta';
export const ADMIN_V1ALPHA = 'https://analyticsadmin.googleapis.com/v1alpha';
export const DATA_V1BETA = 'https://analyticsdata.googleapis.com/v1beta';
export const DATA_V1ALPHA = 'https://analyticsdata.googleapis.com/v1alpha';

export const googleAnalyticsTokenField = z.string().describe('Google Analytics OAuth access token (Bearer)');

export function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) search.set(key, String(value));
    }
    const qs = search.toString();
    return qs ? `?${qs}` : '';
}

export async function gaRequest(
    googleAnalyticsToken: string,
    base: string,
    path: string,
    options?: {
        method?: string;
        query?: Record<string, string | number | boolean | undefined>;
        body?: unknown;
    },
) {
    const url = `${base}${path.startsWith('/') ? path : `/${path}`}${buildQuery(options?.query ?? {})}`;
    const headers: Record<string, string> = { Authorization: `Bearer ${googleAnalyticsToken}` };
    if (options?.body !== undefined) headers['Content-Type'] = 'application/json';
    const response = await fetch(url, {
        method: options?.method ?? 'GET',
        headers,
        body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        return { ok: false as const, error: details };
    }
    if (response.status === 204) return { ok: true as const, data: { success: true } };
    return { ok: true as const, data: await response.json().catch(() => ({})) };
}

export async function gaGet(
    token: string,
    base: string,
    name: string,
    query?: Record<string, string | number | boolean | undefined>,
) {
    const result = await gaRequest(token, base, `/${name}`, { query });
    if (!result.ok) return { error: 'Failed to fetch resource', details: result.error };
    return result.data;
}

export async function gaPost(
    token: string,
    base: string,
    path: string,
    body?: unknown,
    query?: Record<string, string | number | boolean | undefined>,
    action = 'perform action',
) {
    try {
        const result = await gaRequest(token, base, `/${path}`, { method: 'POST', body: body ?? {}, query });
        if (!result.ok) return { error: `Failed to ${action}`, details: result.error };
        return result.data;
    } catch (error) {
        return { error: `Error while trying to ${action}`, message: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function gaList(
    token: string,
    base: string,
    parent: string,
    resource: string,
    options?: { pageSize?: number; pageToken?: string; extra?: Record<string, string | number | boolean | undefined> },
    action = 'list resources',
) {
    try {
        const result = await gaRequest(token, base, `/${parent}/${resource}`, {
            query: { pageSize: options?.pageSize, pageToken: options?.pageToken, ...options?.extra },
        });
        if (!result.ok) return { error: `Failed to ${action}`, details: result.error };
        return result.data;
    } catch (error) {
        return { error: `Error while trying to ${action}`, message: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export function normalizeProperty(property: string): string {
    return property.startsWith('properties/') ? property : `properties/${property}`;
}

export const paginationSchema = {
    pageSize: z.number().min(1).max(200).optional().describe('Max resources per page (default 50, max 200)'),
    pageToken: z.string().optional().describe('Page token from a previous list call'),
};

export const namedMetric = z.object({ name: z.string().describe("Metric API name, e.g. 'activeUsers'") }).catchall(z.unknown());
export const namedDimension = z.object({ name: z.string().describe("Dimension API name, e.g. 'country'") }).catchall(z.unknown());
