// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const updateAWebhook = tool({
    description:
        'Updates a webhook event type, endpoint, passcode, status, or description. Only provided fields change.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        webhookId: z.string().describe('Webhook ID to update'),
        eventType: z.enum(['FILE_COMMENT', 'FILE_DELETE', 'FILE_UPDATE', 'FILE_VERSION_UPDATE', 'LIBRARY_PUBLISH', 'PING']).optional(),
        endpoint: z.string().optional().describe('New HTTPS endpoint (max 2048 chars)'),
        passcode: z.string().optional().describe('New secret (max 100 chars)'),
        status: z.enum(['ACTIVE', 'PAUSED']).optional(),
        description: z.string().optional().describe('New description (max 140 chars; empty string removes)'),
    }),
    execute: async ({ figmaToken, webhookId, eventType, endpoint, passcode, status, description }) => {
        try {
            const body: Record<string, unknown> = {};
            if (eventType) body.event_type = eventType;
            if (endpoint) body.endpoint = endpoint;
            if (passcode) body.passcode = passcode;
            if (status) body.status = status;
            if (description !== undefined) body.description = description;
            const result = await figmaRequest(figmaToken, `/v2/webhooks/${webhookId}`, {
                method: 'PUT',
                body,
            });
            if (!result.ok) return { error: 'Failed to update webhook', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error updating webhook',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
