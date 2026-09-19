// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getAWebhook = tool({
    description:
        'Retrieves a webhook by ID, if it exists and is accessible.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        webhookId: z.string().describe('Webhook ID'),
    }),
    execute: async ({ figmaToken, webhookId }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v2/webhooks/${webhookId}`);
            if (!result.ok) return { error: 'Failed to get webhook', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting webhook',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
