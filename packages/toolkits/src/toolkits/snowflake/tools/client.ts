// @ts-nocheck
import { z } from 'zod';

export const STATUSPAGE_BASE = 'https://status.snowflake.com/api/v2';

/** Credential JSON: { accountHost, token }. Token is an OAuth access token (or PAT / key-pair JWT). */
export interface SnowflakeCredentials {
    accountHost: string;
    token: string;
}

export const snowflakeCredentialsField = z
    .string()
    .optional()
    .describe('Snowflake credential JSON {accountHost, token}. Injected at runtime.');

export function missingCredentials() {
    return { error: 'Snowflake credentials are required. Connect Snowflake first with your account host and access token.' };
}

export function parseCredentials(raw: string | undefined): SnowflakeCredentials | { error: string } {
    if (!raw) return missingCredentials();
    try {
        const parsed = JSON.parse(raw);
        if (!parsed.accountHost || !parsed.token) {
            return { error: 'Snowflake credentials must be JSON with accountHost and token, e.g. {"accountHost":"org-account","token":"..."}' };
        }
        return parsed as SnowflakeCredentials;
    } catch {
        return { error: 'Snowflake credentials must be valid JSON with accountHost and token.' };
    }
}

/** Normalize account host: accepts bare locator, full host, or URL. */
export function normalizeHost(accountHost: string): string {
    let host = accountHost.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    if (!host.includes('.')) host = `${host}.snowflakecomputing.com`;
    return `https://${host}`;
}

export interface SnowflakeRequestOptions {
    method?: string;
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
    /** Idempotency key sent as requestId for statement submission. */
    requestId?: string;
}

export async function snowflakeSqlApi(creds: SnowflakeCredentials, path: string, options?: SnowflakeRequestOptions) {
    const base = normalizeHost(creds.accountHost);
    let url = `${base}/api/v2${path}`;
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(options?.query ?? {})) {
        if (v !== undefined) search.set(k, String(v));
    }
    if (options?.requestId) search.set('requestId', options.requestId);
    const qs = search.toString();
    if (qs) url += `?${qs}`;
    try {
        const response = await fetch(url, {
            method: options?.method ?? 'GET',
            headers: {
                Authorization: `Bearer ${creds.token}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-Snowflake-Authorization-Token-Type': 'OAUTH',
                'User-Agent': 'rnsk-toolkits/1.0',
            },
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
        if (!response.ok) return { error: 'Snowflake SQL API request failed', status: response.status, details: data };
        return data;
    } catch (error) {
        return { error: 'Error calling Snowflake SQL API', message: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/** Submit a statement (sync by default) and return the raw API response. */
export async function submitStatement(
    creds: SnowflakeCredentials,
    input: {
        statement: string;
        role?: string;
        warehouse?: string;
        database?: string;
        schema?: string;
        timeout?: number;
        bindings?: Record<string, unknown>;
        parameters?: Record<string, unknown>;
        async?: boolean;
        requestId?: string;
    },
    action = 'execute SQL statement',
) {
    try {
        const body: Record<string, unknown> = { statement: input.statement };
        if (input.timeout !== undefined) body.timeout = input.timeout;
        if (input.database) body.database = input.database;
        if (input.schema) body.schema = input.schema;
        if (input.warehouse) body.warehouse = input.warehouse;
        if (input.role) body.role = input.role;
        if (input.bindings) body.bindings = input.bindings;
        if (input.parameters) body.parameters = input.parameters;
        if (input.async !== undefined) body.async = input.async;
        const result = await snowflakeSqlApi(creds, '/statements', { method: 'POST', body, requestId: input.requestId });
        if ((result as any)?.error) return { error: `Failed to ${action}`, ...(result as any) };
        return result;
    } catch (error) {
        return { error: `Error while trying to ${action}`, message: error instanceof Error ? error.message : 'Unknown error' };
    }
}

function quoteIdent(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
}

function quoteLiteral(value: string): string {
    return `'${value.replace(/'/g, "''")}'`;
}

export interface ShowOptions {
    terse?: boolean;
    history?: boolean;
    likePattern?: string;
    startsWith?: string;
    limit?: number;
    fromName?: string;
}

/** Build SHOW <objects> SQL from common filter options. */
export function buildShow(objects: 'DATABASES' | 'SCHEMAS' | 'TABLES', scope: string | undefined, opts: ShowOptions): string {
    const parts = ['SHOW'];
    if (opts.terse) parts.push('TERSE');
    parts.push(objects);
    if (opts.history) parts.push('HISTORY');
    if (opts.likePattern) parts.push(`LIKE ${quoteLiteral(opts.likePattern)}`);
    if (scope) parts.push(scope);
    if (opts.startsWith) parts.push(`STARTS WITH ${quoteLiteral(opts.startsWith)}`);
    if (opts.limit !== undefined) {
        parts.push(`LIMIT ${opts.limit}`);
        if (opts.fromName) parts.push(`FROM ${quoteLiteral(opts.fromName)}`);
    }
    return parts.join(' ');
}

export { quoteIdent, quoteLiteral };

/** Public Snowflake status page (Statuspage API, no auth). */
export async function statusPage(path: string, action = 'query Snowflake status page') {
    try {
        const response = await fetch(`${STATUSPAGE_BASE}${path}`, { headers: { Accept: 'application/json' } });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) return { error: `Failed to ${action}`, details: data };
        return data;
    } catch (error) {
        return { error: `Error while trying to ${action}`, message: error instanceof Error ? error.message : 'Unknown error' };
    }
}
