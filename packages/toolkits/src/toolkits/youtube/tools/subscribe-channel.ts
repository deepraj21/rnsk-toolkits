// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const subscribeChannel = tool({
    description:
        'Subscribes the authenticated user to a channel by channel ID.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        channelId: z.string().describe("Channel ID to subscribe to (starts with 'UC')"),
    }),
    execute: async ({ youtubeToken, channelId }) => {
        try {
            const result = await youtubeRequest(youtubeToken, '/subscriptions', {
                method: 'POST',
                query: { part: 'snippet' },
                body: { snippet: { resourceId: { kind: 'youtube#channel', channelId } } },
            });
            if (!result.ok) return { error: 'Failed to subscribe to channel', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error subscribing to channel',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
