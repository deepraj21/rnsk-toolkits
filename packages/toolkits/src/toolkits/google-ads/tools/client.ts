// @ts-nocheck
import { z } from 'zod';

export const GOOGLE_ADS_API_BASE = 'https://googleads.googleapis.com';
export const GOOGLE_ADS_API_VERSION = 'v23';

export const googleAdsTokenField = z.string().describe('The Google Ads OAuth access token (Bearer)');
export const developerTokenField = z
    .string()
    .describe('Google Ads developer token from the API Center (sent as developer-token header)');
export const customerIdField = z
    .string()
    .optional()
    .describe(
        'Target Google Ads customer ID; hyphens and spaces are stripped. For MCC workflows pass the child/sub-account ID.',
    );
export const loginCustomerIdField = z
    .string()
    .optional()
    .describe('Manager (MCC) customer ID sent as login-customer-id header. Omit for direct accounts.');

export function normalizeCustomerId(id?: string): string {
    return (id ?? '').replace(/[-\s]/g, '');
}

function buildHeaders(googleAdsToken: string, developerToken: string, loginCustomerId?: string) {
    const headers: Record<string, string> = {
        Authorization: `Bearer ${googleAdsToken}`,
        'developer-token': developerToken,
        'Content-Type': 'application/json',
    };
    const loginId = normalizeCustomerId(loginCustomerId);
    if (loginId) headers['login-customer-id'] = loginId;
    return headers;
}

export async function adsRequest(
    googleAdsToken: string,
    developerToken: string,
    path: string,
    options?: { method?: string; body?: unknown; loginCustomerId?: string },
) {
    const response = await fetch(`${GOOGLE_ADS_API_BASE}${path}`, {
        method: options?.method ?? 'GET',
        headers: buildHeaders(googleAdsToken, developerToken, options?.loginCustomerId),
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

function toCamelKey(key: string): string {
    return key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

export function toGoogleAdsJson(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(toGoogleAdsJson);
    if (value && typeof value === 'object') {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
            out[toCamelKey(k)] = toGoogleAdsJson(v);
        }
        return out;
    }
    return value;
}

export interface MutateOptions {
    customerId?: string;
    loginCustomerId?: string;
    operations: Array<Record<string, unknown>>;
    validateOnly?: boolean;
    partialFailure?: boolean;
    responseContentType?: string;
}

export async function adsMutate(
    googleAdsToken: string,
    developerToken: string,
    resource: string,
    opts: MutateOptions,
) {
    const customerId = normalizeCustomerId(opts.customerId);
    if (!customerId) return { ok: false as const, error: { message: 'customerId is required' } };
    const body: Record<string, unknown> = {
        operations: toGoogleAdsJson(opts.operations),
    };
    if (opts.validateOnly !== undefined) body.validateOnly = opts.validateOnly;
    if (opts.partialFailure !== undefined) body.partialFailure = opts.partialFailure;
    if (opts.responseContentType !== undefined) body.responseContentType = opts.responseContentType;
    return adsRequest(
        googleAdsToken,
        developerToken,
        `/${GOOGLE_ADS_API_VERSION}/customers/${customerId}/${resource}:mutate`,
        { method: 'POST', body, loginCustomerId: opts.loginCustomerId },
    );
}

export interface SearchOptions {
    customerId?: string;
    loginCustomerId?: string;
    query: string;
    pageToken?: string;
    pageSize?: number;
    summaryRowSetting?: string;
}

export async function adsSearchStream(
    googleAdsToken: string,
    developerToken: string,
    opts: SearchOptions,
) {
    const customerId = normalizeCustomerId(opts.customerId);
    if (!customerId) return { ok: false as const, error: { message: 'customerId is required' } };
    const body: Record<string, unknown> = { query: opts.query };
    if (opts.summaryRowSetting) body.summaryRowSetting = opts.summaryRowSetting;
    return adsRequest(
        googleAdsToken,
        developerToken,
        `/${GOOGLE_ADS_API_VERSION}/customers/${customerId}/googleAds:searchStream`,
        { method: 'POST', body, loginCustomerId: opts.loginCustomerId },
    );
}

export function collectStreamRows(data: unknown): {
    rows: Array<Record<string, unknown>>;
    requestId?: string;
    summaryRow?: Record<string, unknown>;
} {
    const rows: Array<Record<string, unknown>> = [];
    let requestId: string | undefined;
    let summaryRow: Record<string, unknown> | undefined;
    const batches = Array.isArray(data) ? data : [data];
    for (const batch of batches) {
        const b = batch as Record<string, unknown>;
        if (typeof b?.requestId === 'string' && !requestId) requestId = b.requestId;
        for (const r of (b?.results as Array<Record<string, unknown>>) ?? []) rows.push(r);
        if (b?.summaryRow && !summaryRow) summaryRow = b.summaryRow as Record<string, unknown>;
    }
    return { rows, requestId, summaryRow };
}
