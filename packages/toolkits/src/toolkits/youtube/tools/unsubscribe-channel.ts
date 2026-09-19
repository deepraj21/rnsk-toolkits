// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const unsubscribeChannel = tool({
    description:
        'Removes a subscription by subscription ID (from listUserSubscriptions). The subscription must belong to the authenticated user.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        subscriptionId: z.string().describe('Subscription ID to delete'),
    }),
    execute: async ({ youtubeToken, subscriptionId }) => {
        try {
            const result = await youtubeRequest(youtubeToken, '/subscriptions', {
                method: 'DELETE',
                query: { id: subscriptionId },
            });
            if (!result.ok) return { error: 'Failed to unsubscribe from channel', details: result.error };
            return { subscriptionId, unsubscribed: true, httpStatus: 204 };
        } catch (error) {
            return {
                error: 'Error unsubscribing from channel',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
