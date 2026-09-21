// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { accountIdField, lookupsApi, newRelicApiKeyField, restV2, synthApi } from './client.js';

// ---- APM applications ----

export const getApplications = tool({
    description: 'Lists APM applications with health, Apdex, and throughput. Filter by name, host, or IDs.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        name: z.string().optional().describe('Case-insensitive partial name match'),
        host: z.string().optional().describe('Case-insensitive partial host match'),
        ids: z.string().optional().describe("Comma-separated IDs, e.g. '123,456'"),
        page: z.number().int().min(1).optional().describe('Page number (1-indexed)'),
    }),
    execute: async ({ newRelicApiKey, name, host, ids, page }) =>
        restV2(newRelicApiKey, 'GET', '/applications.json', { query: { 'filter[name]': name, 'filter[host]': host, 'filter[ids]': ids, page } }, 'list applications'),
});

export const getAppMetricsNames = tool({
    description: 'Lists available metric names for an app. Run before getAppMetricData to discover queryable metrics.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        applicationId: z.number().int().describe('Application ID'),
        name: z.string().optional().describe('Partial metric-name filter'),
        cursor: z.string().optional().describe('Pagination cursor (preferred over page)'),
        page: z.number().int().min(1).optional().describe('Page number (deprecated, use cursor)'),
    }),
    execute: async ({ newRelicApiKey, applicationId, name, cursor, page }) =>
        restV2(newRelicApiKey, 'GET', `/applications/${applicationId}/metrics.json`, { query: { name, cursor, page } }, 'list application metric names'),
});

export const getAppMetricData = tool({
    description: 'Fetches metric timeslice data (call counts, response times) for an app over a time range. Discover names via getAppMetricsNames first.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        applicationId: z.number().int().describe('Application ID'),
        names: z.array(z.string()).min(1).describe("Metrics, e.g. ['HttpDispatcher','EndUser']"),
        values: z.array(z.string()).optional().describe("Values, e.g. ['call_count','average_response_time'] (default all)"),
        from: z.string().optional().describe("Range start ISO-8601, e.g. '2014-05-20T23:00:00+00:00'"),
        to: z.string().optional().describe('Range end ISO-8601'),
        period: z.number().int().min(1).optional().describe('Timeslice seconds'),
        summarize: z.boolean().optional().describe('Single summary timeslice for the range'),
        raw: z.boolean().optional().describe('Unformatted raw values'),
    }),
    execute: async ({ newRelicApiKey, applicationId, names, ...rest }) => {
        const query: Record<string, string | number | boolean | undefined> = { ...rest };
        (query as any)['names[]'] = names;
        if (rest.values) (query as any)['values[]'] = rest.values;
        delete (query as any).values;
        return restV2(newRelicApiKey, 'GET', `/applications/${applicationId}/metrics/data.json`, { query }, 'get application metric data');
    },
});

export const listDeployments = tool({
    description: 'Lists deployment markers for an app (history for correlating releases with performance). Paginated.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        applicationId: z.number().int().describe('Application ID'),
        page: z.number().int().min(1).optional().describe('Page number (1-indexed)'),
    }),
    execute: async ({ newRelicApiKey, applicationId, page }) =>
        restV2(newRelicApiKey, 'GET', `/applications/${applicationId}/deployments.json`, { query: { page } }, 'list deployments'),
});

export const listKeyTransactions = tool({
    description: 'Lists key transactions (critical paths) with Apdex and performance summaries. Filter by name or IDs.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        name: z.string().optional().describe('Partial name match'),
        ids: z.string().optional().describe("Comma-separated IDs, e.g. '123,456'"),
        page: z.number().int().min(1).optional(),
    }),
    execute: async ({ newRelicApiKey, name, ids, page }) =>
        restV2(newRelicApiKey, 'GET', '/key_transactions.json', { query: { 'filter[name]': name, 'filter[ids]': ids, page } }, 'list key transactions'),
});

// ---- Browser / mobile ----

export const getBrowserApplications = tool({
    description: 'Lists browser applications with reporting status. Filter by name.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        name: z.string().optional().describe('Partial name match'),
        page: z.number().int().min(1).optional(),
    }),
    execute: async ({ newRelicApiKey, name, page }) =>
        restV2(newRelicApiKey, 'GET', '/browser_applications.json', { query: { 'filter[name]': name, page } }, 'list browser applications'),
});

export const listMobileApplications = tool({
    description: 'Lists mobile applications with crash and performance summaries. Filter by name.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        name: z.string().optional().describe('Partial name match'),
        page: z.number().int().min(1).optional(),
    }),
    execute: async ({ newRelicApiKey, name, page }) =>
        restV2(newRelicApiKey, 'GET', '/mobile_applications.json', { query: { 'filter[name]': name, page } }, 'list mobile applications'),
});

export const getMobileApplication = tool({
    description: 'Reads one mobile app (crash count/rate, active users, throughput, health).',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        id: z.number().int().describe('Mobile application ID'),
    }),
    execute: async ({ newRelicApiKey, id }) =>
        restV2(newRelicApiKey, 'GET', `/mobile_applications/${id}.json`, undefined, 'get mobile application'),
});

export const getMobileApplicationMetrics = tool({
    description: 'Lists available metric names for a mobile app. Run before getMobileMetricData.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        mobileApplicationId: z.number().int().describe('Mobile application ID'),
        name: z.string().optional().describe('Partial metric-name filter'),
        cursor: z.string().optional().describe('Pagination cursor'),
        page: z.number().int().min(1).optional().describe('Page (deprecated, use cursor)'),
    }),
    execute: async ({ newRelicApiKey, mobileApplicationId, name, cursor, page }) =>
        restV2(newRelicApiKey, 'GET', `/mobile_applications/${mobileApplicationId}/metrics.json`, { query: { name, cursor, page } }, 'list mobile application metrics'),
});

export const getMobileMetricData = tool({
    description: "Fetches mobile metric timeslices (e.g. 'Mobile/Crash/All' crash count/rate). Use summarize for range totals.",
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        mobileApplicationId: z.number().int().describe('Mobile application ID'),
        names: z.array(z.string()).min(1).describe("Metrics, e.g. ['Mobile/Crash/All']"),
        values: z.array(z.string()).optional().describe("Values, e.g. ['call_count'] (default all)"),
        from: z.string().optional().describe('Range start ISO-8601'),
        to: z.string().optional().describe('Range end ISO-8601'),
        period: z.number().int().min(1).optional().describe('Timeslice seconds'),
        summarize: z.boolean().optional().describe('Single aggregate for the range'),
        raw: z.boolean().optional(),
    }),
    execute: async ({ newRelicApiKey, mobileApplicationId, names, ...rest }) => {
        const query: Record<string, string | number | boolean | undefined> = { ...rest };
        (query as any)['names[]'] = names;
        if (rest.values) (query as any)['values[]'] = rest.values;
        delete (query as any).values;
        return restV2(newRelicApiKey, 'GET', `/mobile_applications/${mobileApplicationId}/metrics/data.json`, { query }, 'get mobile metric data');
    },
});

// ---- Secure credentials (Synthetics REST v3; values never returned) ----

const credentialKey = z.string().min(1).max(64).describe('UPPERCASE key (letters, numbers, underscores)');

export const createSecureCredential = tool({
    description: 'Stores an encrypted credential via REST v3 for monitor scripts (API keys, passwords, tokens).',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        key: credentialKey,
        value: z.string().min(1).max(3000).describe('Secret value (1-3000 chars, encrypted)'),
        description: z.string().optional(),
    }),
    execute: async ({ newRelicApiKey, key, value, description }) =>
        synthApi(newRelicApiKey, 'POST', '/secure_credentials', { body: { key, value, description } }, 'create secure credential'),
});

export const getSecureCredential = tool({
    description: 'Reads credential metadata (key, timestamps). The secret value is never returned.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        key: credentialKey.describe('Key name to look up'),
    }),
    execute: async ({ newRelicApiKey, key }) =>
        synthApi(newRelicApiKey, 'GET', `/secure_credentials/${encodeURIComponent(key)}`, undefined, 'get secure credential'),
});

export const listSecureCredentials = tool({
    description: 'Lists all secure-credential metadata for auditing. Values are never returned.',
    inputSchema: z.object({ newRelicApiKey: newRelicApiKeyField }),
    execute: async ({ newRelicApiKey }) =>
        synthApi(newRelicApiKey, 'GET', '/secure_credentials', undefined, 'list secure credentials'),
});

export const updateSecureCredential = tool({
    description: 'Rotates a credential value and/or description. The key must already exist.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        key: credentialKey.describe('Existing key name'),
        value: z.string().min(1).max(3000).describe('New secret value'),
        description: z.string().optional(),
    }),
    execute: async ({ newRelicApiKey, key, value, description }) =>
        synthApi(newRelicApiKey, 'PUT', `/secure_credentials/${encodeURIComponent(key)}`, { body: { value, description } }, 'update secure credential'),
});

export const deleteSecureCredential = tool({
    description: 'Deletes a stored credential that is no longer needed or must be replaced.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        key: credentialKey.describe('Key name to delete'),
    }),
    execute: async ({ newRelicApiKey, key }) =>
        synthApi(newRelicApiKey, 'DELETE', `/secure_credentials/${encodeURIComponent(key)}`, undefined, 'delete secure credential'),
});

// ---- Lookup tables (NRQL Lookups API) ----

const tableInput = z.object({
    headers: z.array(z.string()).describe("Column names, e.g. ['id','name','value']"),
    rows: z.array(z.array(z.string())).describe('Data rows matching the headers'),
}).describe('Table structure and data (replaces existing content on update)');

const accountIdString = z.string().describe('Account ID owning the table');

export const createLookupTable = tool({
    description: 'Uploads a lookup table enriching telemetry in NRQL joins (user mappings, catalogs). Name must be unique in the account.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdString,
        tableName: z.string().describe('Table name (lowercase + underscores recommended)'),
        table: tableInput,
        description: z.string().optional(),
    }),
    execute: async ({ newRelicApiKey, accountId, tableName, table, description }) =>
        lookupsApi(newRelicApiKey, 'POST', `/accounts/${accountId}/${encodeURIComponent(tableName)}`, { body: { description, table } }, 'create lookup table'),
});

export const getLookupTable = tool({
    description: 'Downloads a lookup table (metadata plus optional contents).',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdString,
        tableName: z.string().describe('Table name to download'),
        includeTable: z.boolean().optional().describe('Include table data (default false)'),
    }),
    execute: async ({ newRelicApiKey, accountId, tableName, includeTable }) =>
        lookupsApi(newRelicApiKey, 'GET', `/accounts/${accountId}/${encodeURIComponent(tableName)}`, { query: { includeTable } }, 'get lookup table'),
});

export const listLookupTables = tool({
    description: 'Lists lookup-table summaries (names, GUIDs, sizes, update info) for an account.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdString,
    }),
    execute: async ({ newRelicApiKey, accountId }) =>
        lookupsApi(newRelicApiKey, 'GET', `/accounts/${accountId}`, undefined, 'list lookup tables'),
});

export const updateLookupTable = tool({
    description: 'Fully replaces a lookup table (structure + data). The table must already exist.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdString,
        tableName: z.string().describe('Existing table name to replace'),
        table: tableInput,
        description: z.string().optional(),
    }),
    execute: async ({ newRelicApiKey, accountId, tableName, table, description }) =>
        lookupsApi(newRelicApiKey, 'PUT', `/accounts/${accountId}/${encodeURIComponent(tableName)}`, { body: { description, table } }, 'update lookup table'),
});

export const deleteLookupTable = tool({
    description: 'Deletes a lookup table. Deleted tables are not recoverable.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdString,
        tableName: z.string().describe('Table name to delete'),
    }),
    execute: async ({ newRelicApiKey, accountId, tableName }) =>
        lookupsApi(newRelicApiKey, 'DELETE', `/accounts/${accountId}/${encodeURIComponent(tableName)}`, undefined, 'delete lookup table'),
});

export { accountIdField };
