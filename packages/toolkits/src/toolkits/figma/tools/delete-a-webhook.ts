// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const deleteAWebhook = tool({
    description:
        'Permanently and irreversibly deletes a webhook by ID.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        webhookId: z.string().describe('Webhook ID to delete'),
    }),
    execute: async ({ figmaToken, webhookId }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v2/webhooks/${webhookId}`, {
                method: 'DELETE',
            });
            if (!result.ok) return { error: 'Failed to delete webhook', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error deleting webhook',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
