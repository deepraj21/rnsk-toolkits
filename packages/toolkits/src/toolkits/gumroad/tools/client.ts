// @ts-nocheck
import { z } from 'zod';

export const GUMROAD_API_BASE = 'https://api.gumroad.com/v2';

export const gumroadTokenField = z
    .string()
    .optional()
    .describe('Gumroad OAuth access token. Injected at runtime.');

export function missingToken() {
    return { error: 'Gumroad access token is required. Connect Gumroad first.' };
}

export interface GumroadRequestOptions {
    method?: string;
    query?: Record<string, string | number | boolean | undefined>;
    /** Form fields for POST endpoints (Gumroad v2 expects form-encoded bodies). */
    form?: Record<string, string | number | boolean | undefined>;
}

export async function gumroadRequest(token: string | undefined, path: string, options?: GumroadRequestOptions, action = 'call Gumroad API') {
    if (!token) return missingToken();
    let url = `${GUMROAD_API_BASE}${path}`;
    if (options?.query) {
        const search = new URLSearchParams();
        for (const [k, v] of Object.entries(options.query)) {
            if (v !== undefined) search.set(k, String(v));
        }
        const qs = search.toString();
        if (qs) url += `?${qs}`;
    }
    const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
    };
    let body: string | undefined;
    if (options?.form) {
        const form = new URLSearchParams();
        for (const [k, v] of Object.entries(options.form)) {
            if (v !== undefined) form.set(k, String(v));
        }
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        body = form.toString();
    }
    try {
        const response = await fetch(url, { method: options?.method ?? 'GET', headers, body });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || (data as any)?.success === false) {
            return { error: `Failed to ${action}`, details: data };
        }
        return data;
    } catch (error) {
        return { error: `Error while trying to ${action}`, message: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export const RESOURCE_NAMES = ['sale', 'refund', 'dispute', 'dispute_won', 'cancellation', 'subscription_updated', 'subscription_ended', 'subscription_restarted'] as const;

export const resourceNameField = z.enum(RESOURCE_NAMES).describe('Event type: sale, refund, dispute, dispute_won, cancellation, subscription_updated, subscription_ended, subscription_restarted');
