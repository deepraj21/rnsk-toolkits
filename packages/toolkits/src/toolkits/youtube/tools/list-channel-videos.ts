// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { extractHandle, youtubeRequest, youtubeTokenField } from './client.js';

async function resolveChannelId(youtubeToken: string, channelId?: string, mine?: boolean): Promise<{ id?: string; error?: unknown }> {
    if (mine) return { id: 'me' };
    if (!channelId) return {};
    const trimmed = channelId.trim();
    if (trimmed === 'me' || /^UC[\w-]{22}$/.test(trimmed)) return { id: trimmed };
    const channelMatch = trimmed.match(/youtube\.com\/channel\/(UC[\w-]{22})/i);
    if (channelMatch) return { id: channelMatch[1] };
    const handle = extractHandle(trimmed);
    const resolved = await youtubeRequest(youtubeToken, '/channels', {
        query: { part: 'id', forHandle: handle },
    });
    if (!resolved.ok) return { error: resolved.error };
    const items = (resolved.data as { items?: Array<{ id?: string }> }).items ?? [];
    if (!items[0]?.id) return { error: `No channel found for handle '${trimmed}'` };
    return { id: items[0].id };
}

export const listChannelVideos = tool({
    description:
        'Lists videos from a channel via its uploads playlist (cheap), with automatic search fallback if the uploads playlist is missing. Accepts channel IDs, handles, URLs, or mine.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        channelId: z.string().optional().describe("Channel ID, @handle, 'me', or channel URL"),
        mine: z.boolean().optional().describe('True for the authenticated user channel'),
        part: z.string().optional().describe('Playlist item parts (default snippet)'),
        maxResults: z.number().min(1).max(50).optional().describe('Videos per page (1-50, default 5)'),
        pageToken: z.string().optional().describe('Page token from a previous response'),
    }),
    execute: async ({ youtubeToken, channelId, mine, part, maxResults, pageToken }) => {
        try {
            if (!channelId && !mine) return { error: 'Either channelId or mine must be provided' };
            const resolved = await resolveChannelId(youtubeToken, channelId, mine);
            if (resolved.error) return { error: 'Failed to resolve channel', details: resolved.error };
            const cid = resolved.id as string;

            const channelResult = await youtubeRequest(youtubeToken, '/channels', {
                query: { part: 'contentDetails', id: cid === 'me' ? undefined : cid, mine: cid === 'me' ? true : undefined },
            });
            const channelData = channelResult.data as { items?: Array<{ contentDetails?: { relatedPlaylists?: { uploads?: string } } }> };
            const uploadsId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

            if (uploadsId) {
                const itemsResult = await youtubeRequest(youtubeToken, '/playlistItems', {
                    query: { part: part ?? 'snippet', playlistId: uploadsId, maxResults: maxResults ?? 5, pageToken },
                });
                if (itemsResult.ok) return itemsResult.data;
                const code = (itemsResult.error as { error?: { code?: number } })?.error?.code;
                if (code !== 404) return { error: 'Failed to list channel videos', details: itemsResult.error };
            }

            // Fallback: search endpoint (higher quota cost, capped at ~500 results).
            const searchResult = await youtubeRequest(youtubeToken, '/search', {
                query: { part: 'snippet', channelId: cid, type: 'video', order: 'date', maxResults: maxResults ?? 5, pageToken },
            });
            if (!searchResult.ok) return { error: 'Failed to list channel videos', details: searchResult.error };
            return searchResult.data;
        } catch (error) {
            return {
                error: 'Error listing channel videos',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
