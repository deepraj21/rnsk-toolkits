// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { ddApi, toDatadogError } from './client.js';

const credsField = z.string().describe('Datadog credentials JSON with apiKey and appKey (injected by system)');

export const datadogListAwsIntegrations = tool({
    description:
        'List configured AWS account integrations with roles and collection settings. Filter by account ID or IAM role name. Use to verify monitoring coverage.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        account_id: z.string().optional().describe('Filter by AWS account ID'),
        role_name: z.string().optional().describe('Filter by IAM role name'),
        access_key_id: z.string().optional().describe('Filter by access key ID'),
    }),
    execute: async ({ datadogCredentials, ...query }) => {
        try {
            const data = await ddApi(datadogCredentials, 'GET', '/api/v1/integration/aws', { query });
            const accounts = (data as any)?.accounts ?? (Array.isArray(data) ? data : []);
            return { accounts, total_count: (data as any)?.total_count ?? accounts.length };
        } catch (error) {
            return toDatadogError(error, 'Failed to list AWS integrations');
        }
    },
});

export const datadogCreateWebhook = tool({
    description:
        'Register a named HTTPS destination for monitor alerts. Monitors must reference the webhook by name in their message/notification settings to deliver alerts.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        name: z.string().min(1).max(100).describe('Webhook name'),
        url: z.string().describe('Reachable HTTPS endpoint'),
        payload: z.string().optional().describe('Custom payload template'),
        encode_as: z.string().optional().describe("Encoding: 'json' (default) or 'form'"),
        custom_headers: z.string().optional().describe('Custom headers as a JSON string'),
    }),
    execute: async ({ datadogCredentials, ...body }) => {
        try {
            const data = await ddApi(datadogCredentials, 'POST', '/api/v1/integration/webhooks/configuration/webhooks', {
                body,
            });
            return { ...(data as object), success: true };
        } catch (error) {
            return toDatadogError(error, 'Failed to create webhook');
        }
    },
});
