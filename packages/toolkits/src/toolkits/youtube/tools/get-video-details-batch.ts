// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { chunk, youtubeRequest, youtubeTokenField } from './client.js';

const VALID_PARTS = ['contentDetails', 'fileDetails', 'id', 'liveStreamingDetails', 'localizations', 'paidProductPlacementDetails', 'player', 'processingDetails', 'recordingDetails', 'snippet', 'statistics', 'status', 'suggestions', 'topicDetails'];

export const getVideoDetailsBatch = tool({
    description:
        'Retrieves video resources for many IDs in one batched call (auto-split at 50 per request). Use for cohort-level metrics with less quota and latency.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        id: z.array(z.string()).min(1).describe('Video IDs to retrieve (auto-split past 50)'),
        parts: z.array(z.string()).min(1).optional().describe("Resource parts (default snippet,statistics)"),
        hl: z.string().optional().describe('IETF language tag for localized metadata, e.g. en'),
    }),
    execute: async ({ youtubeToken, id, parts, hl }) => {
        try {
            const partList = parts && parts.length > 0 ? parts : ['snippet', 'statistics'];
            const invalid = partList.filter((p) => !VALID_PARTS.includes(p));
            if (invalid.length > 0) return { error: `Invalid parts: ${invalid.join(', ')}` };
            const partParam = partList.join(',');
            const items: Array<Record<string, unknown>> = [];
            for (const batch of chunk(id, 50)) {
                const result = await youtubeRequest(youtubeToken, '/videos', {
                    query: { part: partParam, id: batch.join(','), hl },
                });
                if (!result.ok) return { error: 'Failed to get video details', details: result.error };
                items.push(...(((result.data as { items?: Array<Record<string, unknown>> }).items) ?? []));
            }
            const foundIds = new Set(items.map((v) => v.id as string));
            const notFound = id.filter((v) => !foundIds.has(v));
            return {
                kind: 'youtube#videoListResponse',
                items,
                foundCount: items.length,
                requestedCount: id.length,
                requestedVideoIds: id,
                notFoundVideoIds: notFound,
                notFoundCount: notFound.length,
                partialFailure: notFound.length > 0,
            };
        } catch (error) {
            return {
                error: 'Error getting video details',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
