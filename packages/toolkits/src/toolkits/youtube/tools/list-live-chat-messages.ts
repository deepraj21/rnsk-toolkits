// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const listLiveChatMessages = tool({
    description:
        'Lists live chat messages (text, Super Chat, moderation events) for a chat ID from a liveBroadcast resource. Use pollingIntervalMillis for polling cadence.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        liveChatId: z.string().describe('Chat ID from the liveBroadcast snippet.liveChatId'),
        part: z.string().optional().describe('Resource parts (default snippet,authorDetails)'),
        maxResults: z.number().min(200).max(2000).optional().describe('Messages per page (200-2000, default 500)'),
        pageToken: z.string().optional().describe('nextPageToken from a previous response for subsequent messages'),
        hl: z.string().optional().describe('BCP-47 language for Super Chat currency display'),
        profileImageSize: z.number().min(16).max(720).optional().describe('Profile image size in px (16-720, default 88)'),
    }),
    execute: async ({ youtubeToken, liveChatId, part, maxResults, pageToken, hl, profileImageSize }) => {
        try {
            const result = await youtubeRequest(youtubeToken, '/liveChat/messages', {
                query: { liveChatId, part: part ?? 'snippet,authorDetails', maxResults, pageToken, hl, profileImageSize },
            });
            if (!result.ok) return { error: 'Failed to list live chat messages', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error listing live chat messages',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
