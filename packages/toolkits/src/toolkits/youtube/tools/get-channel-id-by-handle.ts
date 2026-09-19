// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { extractHandle, youtubeRequest, youtubeTokenField } from './client.js';

export const getChannelIdByHandle = tool({
    description:
        'Resolves a channel handle (with or without @, or a full youtube.com/@handle URL) to its channel ID.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        channelHandle: z.string().describe("Handle like '@Google', 'Google', or a full channel URL"),
    }),
    execute: async ({ youtubeToken, channelHandle }) => {
        try {
            const handle = extractHandle(channelHandle);
            if (!handle) return { error: 'Could not extract a handle from channelHandle' };
            const result = await youtubeRequest(youtubeToken, '/channels', {
                query: { part: 'snippet,statistics,status', forHandle: handle },
            });
            if (!result.ok) return { error: 'Failed to resolve channel handle', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error resolving channel handle',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
