// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { chunk, youtubeRequest, youtubeTokenField } from './client.js';

export const getChannelStatistics = tool({
    description:
        'Gets subscriber, view, and video counts for channels by ID, handle, username, or ownership. ID lists over 50 are batched and merged.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        id: z.string().optional().describe('Comma-separated channel IDs (max 50 per request, auto-batched)'),
        forHandle: z.string().optional().describe('Channel handle, @ optional'),
        forUsername: z.string().optional().describe('Legacy username'),
        mine: z.boolean().optional().describe('True for the authenticated user channel'),
        part: z.string().optional().describe('Resource parts (default statistics)'),
    }),
    execute: async ({ youtubeToken, id, forHandle, forUsername, mine, part }) => {
        try {
            if (!id && !forHandle && !forUsername && !mine) {
                return { error: 'At least one of id, forHandle, forUsername, or mine is required' };
            }
            const partParam = part ?? 'statistics';
            if (!id) {
                const result = await youtubeRequest(youtubeToken, '/channels', {
                    query: { part: partParam, forHandle, forUsername, mine },
                });
                if (!result.ok) return { error: 'Failed to get channel statistics', details: result.error };
                const data = result.data as { items?: Array<Record<string, unknown>> };
                return { ...result.data, channels: data.items ?? [] };
            }
            const ids = id.split(',').map((s) => s.trim()).filter(Boolean);
            const items: Array<Record<string, unknown>> = [];
            let pageInfo: unknown;
            for (const batch of chunk(ids, 50)) {
                const result = await youtubeRequest(youtubeToken, '/channels', {
                    query: { part: partParam, id: batch.join(',') },
                });
                if (!result.ok) return { error: 'Failed to get channel statistics', details: result.error };
                const data = result.data as { items?: Array<Record<string, unknown>>; pageInfo?: unknown };
                items.push(...(data.items ?? []));
                pageInfo = data.pageInfo;
            }
            return { kind: 'youtube#channelListResponse', items, channels: items, pageInfo };
        } catch (error) {
            return {
                error: 'Error getting channel statistics',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
