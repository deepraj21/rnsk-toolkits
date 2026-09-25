// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dynatraceRequest, failedResult, toDynatraceError } from './client.js';

const credsField = z
    .string()
    .describe(
        'Dynatrace credentials JSON with baseUrl and apiToken, e.g. {"baseUrl":"https://abc123.live.dynatrace.com","apiToken":"..."} (Managed: "https://dynatrace.example.com/e/ENV_ID").',
    );

export const listAuditLogs = tool({
    description:
        'List environment audit log entries: configuration changes with user, timestamp and entity. Requires auditLogs.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        from: z.string().optional().describe('Start: relative ("now-7d") or ISO timestamp'),
        to: z.string().optional().describe('End: relative or ISO timestamp (default now)'),
        filter: z
            .string()
            .optional()
            .describe('Filter, e.g. \'user("john.doe")\', \'entityType("SETTINGS_OBJECT")\''),
        sort: z.string().optional().describe('Sort, e.g. "-timestamp"'),
        pageSize: z.number().int().min(1).max(1000).optional().describe('Results per page (default 100)'),
    }),
    execute: async ({ dynatraceCredentials, from, to, filter, sort, pageSize }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/auditlogs', {
                query: { from, to, filter, sort, pageSize },
            });
            if (!result.ok) return failedResult('Failed to list Dynatrace audit logs', result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, 'Error listing Dynatrace audit logs');
        }
    },
});

export const getAuditLog = tool({
    description: 'Get a single audit log entry by ID. Requires auditLogs.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        logId: z.string().describe('Audit log entry ID'),
    }),
    execute: async ({ dynatraceCredentials, logId }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/auditlogs/${encodeURIComponent(logId)}`,
            );
            if (!result.ok)
                return failedResult(`Failed to get Dynatrace audit log "${logId}"`, result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, `Error getting Dynatrace audit log "${logId}"`);
        }
    },
});

export const listApiTokens = tool({
    description:
        'List API tokens in the environment with owners, scopes and expiration. Requires apiTokens.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
    }),
    execute: async ({ dynatraceCredentials }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/apiTokens');
            if (!result.ok) return failedResult('Failed to list Dynatrace API tokens', result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, 'Error listing Dynatrace API tokens');
        }
    },
});

export const getApiToken = tool({
    description: 'Get one API token metadata (never the secret value). Requires apiTokens.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        tokenId: z.string().describe('Token ID (UUID)'),
    }),
    execute: async ({ dynatraceCredentials, tokenId }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/apiTokens/${encodeURIComponent(tokenId)}`,
            );
            if (!result.ok)
                return failedResult(`Failed to get Dynatrace API token "${tokenId}"`, result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, `Error getting Dynatrace API token "${tokenId}"`);
        }
    },
});

export const createApiToken = tool({
    description:
        'Create an API token with scopes. The secret is returned once — store it immediately. Requires apiTokens.write scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        name: z.string().describe('Token name'),
        scopes: z.array(z.string()).describe('Scopes, e.g. ["metrics.read","problems.read"]'),
        expirationDate: z.string().optional().describe('Expiration ISO timestamp, e.g. "2026-12-31T00:00:00Z"'),
        personalAccessToken: z.boolean().optional().describe('Create as personal access token (default false)'),
    }),
    execute: async ({ dynatraceCredentials, name, scopes, expirationDate, personalAccessToken }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/apiTokens', {
                method: 'POST',
                body: { name, scopes, expirationDate, personalAccessToken },
            });
            if (!result.ok) return failedResult('Failed to create Dynatrace API token', result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, 'Error creating Dynatrace API token');
        }
    },
});

export const updateApiToken = tool({
    description: 'Update an API token (name, enabled state, scopes). Requires apiTokens.write scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        tokenId: z.string().describe('Token ID (UUID) to update'),
        name: z.string().optional().describe('New token name'),
        enabled: z.boolean().optional().describe('Enable or disable the token'),
        scopes: z.array(z.string()).optional().describe('Replacement scope list'),
    }),
    execute: async ({ dynatraceCredentials, tokenId, name, enabled, scopes }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/apiTokens/${encodeURIComponent(tokenId)}`,
                { method: 'PUT', body: { name, enabled, scopes } },
            );
            if (!result.ok)
                return failedResult(`Failed to update Dynatrace API token "${tokenId}"`, result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, `Error updating Dynatrace API token "${tokenId}"`);
        }
    },
});

export const deleteApiToken = tool({
    description: 'Delete (revoke) an API token. Requires apiTokens.write scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        tokenId: z.string().describe('Token ID (UUID) to delete'),
    }),
    execute: async ({ dynatraceCredentials, tokenId }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/apiTokens/${encodeURIComponent(tokenId)}`,
                { method: 'DELETE' },
            );
            if (!result.ok)
                return failedResult(`Failed to delete Dynatrace API token "${tokenId}"`, result);
            return { success: true, tokenId, statusCode: result.status };
        } catch (error) {
            return toDynatraceError(error, `Error deleting Dynatrace API token "${tokenId}"`);
        }
    },
});

export const lookupApiToken = tool({
    description:
        'Look up what a token value belongs to (owner, scopes) without exposing other secrets. Requires apiTokens.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        token: z.string().describe('Token secret value to look up'),
    }),
    execute: async ({ dynatraceCredentials, token }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/apiTokens/lookup', {
                method: 'POST',
                body: { token },
            });
            if (!result.ok) return failedResult('Failed to look up Dynatrace API token', result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, 'Error looking up Dynatrace API token');
        }
    },
});
