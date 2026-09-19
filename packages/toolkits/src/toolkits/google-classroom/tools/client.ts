// @ts-nocheck
import { z } from 'zod';

export const CLASSROOM_API_BASE = 'https://classroom.googleapis.com/v1';

export const googleClassroomTokenField = z.string().describe('Google Classroom OAuth access token (Bearer)');

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

export async function classroomRequest(
    googleClassroomToken: string,
    path: string,
    options?: {
        method?: string;
        query?: Record<string, string | number | boolean | string[] | undefined>;
        body?: unknown;
    },
) {
    const url = `${CLASSROOM_API_BASE}${path}${buildQuery(options?.query ?? {})}`;
    const response = await fetch(url, {
        method: options?.method ?? 'GET',
        headers: {
            Authorization: `Bearer ${googleClassroomToken}`,
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
