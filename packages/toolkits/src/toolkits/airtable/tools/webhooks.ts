// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
    airtableRequest,
    failedResult,
    missingTokenError,
    toAirtableError,
} from './client.js';

const tokenField = z
    .string()
    .optional()
    .describe('Injected Airtable access token (personal access token). Do not ask the user for it.');
const baseField = z.string().describe('Base ID, e.g. "appXXXXXXXXXXXXXX"');

export const listWebhooks = tool({
    description:
        'List webhooks registered on a base with enabled state, cursors and last notification results. Requires webhook:manage scope.',
    inputSchema: z.object({
        airtableAccessToken: tokenField,
        baseId: baseField,
    }),
    execute: async ({ airtableAccessToken, baseId }) => {
        if (!airtableAccessToken) return missingTokenError();
        try {
            const result = await airtableRequest(
                airtableAccessToken,
                `/v0/bases/${encodeURIComponent(baseId)}/webhooks`,
            );
            if (!result.ok) return failedResult('Failed to list Airtable webhooks', result);
            return result.data;
        } catch (error) {
            return toAirtableError(error, 'Error listing Airtable webhooks');
        }
    },
});

export const createWebhook = tool({
    description:
        'Register a webhook on a base to receive change notifications (max 10 per base; OAuth/PAT webhooks expire after 7 days unless refreshed). Requires webhook:manage scope.',
    inputSchema: z.object({
        airtableAccessToken: tokenField,
        baseId: baseField,
        notificationUrl: z.string().optional().describe('HTTPS URL receiving notification pings'),
        dataTypes: z
            .array(z.string())
            .optional()
            .describe('Data types to watch, e.g. ["tableData"]. Defaults to table data when omitted.'),
        recordChangeScope: z
            .string()
            .optional()
            .describe('Table ID limiting notifications to one table, e.g. "tblXXXXXXXXXXXXXX"'),
    }),
    execute: async ({ airtableAccessToken, baseId, notificationUrl, dataTypes, recordChangeScope }) => {
        if (!airtableAccessToken) return missingTokenError();
        try {
            const filters: Record<string, unknown> = {};
            if (dataTypes?.length) filters.dataTypes = dataTypes;
            if (recordChangeScope) filters.recordChangeScope = recordChangeScope;
            const result = await airtableRequest(
                airtableAccessToken,
                `/v0/bases/${encodeURIComponent(baseId)}/webhooks`,
                {
                    method: 'POST',
                    body: {
                        notificationUrl,
                        specification: { options: { filters } },
                    },
                },
            );
            if (!result.ok) return failedResult('Failed to create Airtable webhook', result);
            return result.data;
        } catch (error) {
            return toAirtableError(error, 'Error creating Airtable webhook');
        }
    },
});

export const deleteWebhook = tool({
    description: 'Delete a webhook from a base. Requires webhook:manage scope.',
    inputSchema: z.object({
        airtableAccessToken: tokenField,
        baseId: baseField,
        webhookId: z.string().describe('Webhook ID, e.g. "achXXXXXXXXXXXXXX"'),
    }),
    execute: async ({ airtableAccessToken, baseId, webhookId }) => {
        if (!airtableAccessToken) return missingTokenError();
        try {
            const result = await airtableRequest(
                airtableAccessToken,
                `/v0/bases/${encodeURIComponent(baseId)}/webhooks/${encodeURIComponent(webhookId)}`,
                { method: 'DELETE' },
            );
            if (!result.ok) return failedResult('Failed to delete Airtable webhook', result);
            return { success: true, webhookId, statusCode: result.status };
        } catch (error) {
            return toAirtableError(error, 'Error deleting Airtable webhook');
        }
    },
});

export const listWebhookPayloads = tool({
    description:
        'Consume webhook payloads (record changes) with cursor pagination. Calling this also extends an active webhook expiry by 7 days. Requires webhook:manage scope.',
    inputSchema: z.object({
        airtableAccessToken: tokenField,
        baseId: baseField,
        webhookId: z.string().describe('Webhook ID'),
        cursor: z
            .number()
            .int()
            .optional()
            .describe('Transaction number to start from (omit the first time; then reuse the returned cursor)'),
        limit: z.number().int().min(1).max(50).optional().describe('Max payloads per call (max 50)'),
    }),
    execute: async ({ airtableAccessToken, baseId, webhookId, cursor, limit }) => {
        if (!airtableAccessToken) return missingTokenError();
        try {
            const result = await airtableRequest(
                airtableAccessToken,
                `/v0/bases/${encodeURIComponent(baseId)}/webhooks/${encodeURIComponent(webhookId)}/payloads`,
                { query: { cursor, limit } },
            );
            if (!result.ok) return failedResult('Failed to list Airtable webhook payloads', result);
            return result.data;
        } catch (error) {
            return toAirtableError(error, 'Error listing Airtable webhook payloads');
        }
    },
});

export const refreshWebhook = tool({
    description:
        'Extend an active webhook expiry by 7 days. Requires webhook:manage scope.',
    inputSchema: z.object({
        airtableAccessToken: tokenField,
        baseId: baseField,
        webhookId: z.string().describe('Webhook ID to refresh'),
    }),
    execute: async ({ airtableAccessToken, baseId, webhookId }) => {
        if (!airtableAccessToken) return missingTokenError();
        try {
            const result = await airtableRequest(
                airtableAccessToken,
                `/v0/bases/${encodeURIComponent(baseId)}/webhooks/${encodeURIComponent(webhookId)}/refresh`,
                { method: 'POST' },
            );
            if (!result.ok) return failedResult('Failed to refresh Airtable webhook', result);
            return result.data;
        } catch (error) {
            return toAirtableError(error, 'Error refreshing Airtable webhook');
        }
    },
});
