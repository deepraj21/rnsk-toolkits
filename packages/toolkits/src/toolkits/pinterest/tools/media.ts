// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { failedResult, pinterestRequest, toPinterestError } from './client.js';

const tokenField = z
    .string()
    .optional()
    .describe('Injected Pinterest OAuth access token — match manifest tokenField');

export const registerMedia = tool({
    description:
        'Register a video upload and get the media ID, upload URL, and multipart parameters. Upload the bytes to upload_url then reference media_id when creating a video Pin.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        mediaType: z.string().optional().describe('Media type; Pinterest currently supports only "video"'),
    }),
    execute: async ({ pinterestToken, mediaType }) => {
        try {
            const result = await pinterestRequest(pinterestToken, '/media', {
                method: 'POST',
                body: { media_type: mediaType ?? 'video' },
            });
            if (!result.ok) return failedResult('Failed to register Pinterest media upload', result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, 'Error registering Pinterest media upload');
        }
    },
});

export const getMedia = tool({
    description: "Get a registered video's current upload/processing status by media ID.",
    inputSchema: z.object({
        pinterestToken: tokenField,
        mediaId: z.string().describe('Numeric media registration ID from registerMedia'),
    }),
    execute: async ({ pinterestToken, mediaId }) => {
        try {
            const result = await pinterestRequest(pinterestToken, `/media/${encodeURIComponent(mediaId)}`);
            if (!result.ok) return failedResult(`Failed to get Pinterest media "${mediaId}"`, result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, `Error getting Pinterest media "${mediaId}"`);
        }
    },
});

export const listMedia = tool({
    description: 'List media uploads registered by the connected account.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        bookmark: z.string().optional().describe('Opaque bookmark from the previous page'),
        pageSize: z.number().int().min(1).max(250).optional().describe('Max items, 1-250 (default 25)'),
    }),
    execute: async ({ pinterestToken, bookmark, pageSize }) => {
        try {
            const result = await pinterestRequest(pinterestToken, '/media', {
                query: { bookmark, page_size: pageSize },
            });
            if (!result.ok) return failedResult('Failed to list Pinterest media uploads', result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, 'Error listing Pinterest media uploads');
        }
    },
});

export const searchOwnContent = tool({
    description:
        "Search the connected account's own boards or Pins, including secret content when authorized. This does not search Pinterest's global index.",
    inputSchema: z.object({
        pinterestToken: tokenField,
        resourceType: z.enum(['boards', 'pins']).describe('Content type to search'),
        query: z
            .string()
            .optional()
            .describe('Search text. Required for pins; omit to browse boards without a term.'),
        bookmark: z.string().optional().describe('Opaque bookmark from the previous page'),
        pageSize: z
            .number()
            .int()
            .min(1)
            .max(250)
            .optional()
            .describe('Max board results, 1-250 (ignored for Pin search)'),
    }),
    execute: async ({ pinterestToken, resourceType, query, bookmark, pageSize }) => {
        try {
            if (resourceType === 'pins' && !query) {
                return { error: 'query is required when searching Pins.' };
            }
            const result = await pinterestRequest(
                pinterestToken,
                resourceType === 'boards' ? '/search/boards' : '/search/pins',
                { query: { query, bookmark, page_size: pageSize } },
            );
            if (!result.ok) return failedResult('Failed to search own Pinterest content', result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, 'Error searching own Pinterest content');
        }
    },
});
