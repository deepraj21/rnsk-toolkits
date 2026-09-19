// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getWebhookRequests = tool({
    description:
        'Shows delivery history for a webhook from the last seven days, with endpoint responses.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        webhookId: z.string().describe('Webhook subscription ID'),
    }),
    execute: async ({ figmaToken, webhookId }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v2/webhooks/${webhookId}/requests`);
            if (!result.ok) return { error: 'Failed to get webhook requests', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting webhook requests',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
