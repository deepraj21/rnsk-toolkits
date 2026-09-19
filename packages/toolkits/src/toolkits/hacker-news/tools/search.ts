// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { hnSearch } from './client.js';

const tagsField = z
    .array(z.string())
    .optional()
    .describe(
        'Filter tags (ANDed). Available: story, comment, poll, pollopt, show_hn, ask_hn, front_page, author_<USERNAME>, story_<ID>.',
    );

export const hackerNewsGetLatestPosts = tool({
    description:
        'Get latest Hacker News posts with optional tag filters. Use to browse recent stories or comments, optionally filtered by type or author.',
    inputSchema: z.object({
        page: z.number().int().min(0).optional().describe('Page number, 0-indexed. Defaults to 0.'),
        size: z.number().int().min(0).optional().describe('Max results to return. Defaults to 5. Set to 0 for the full page (up to 20).'),
        tags: tagsField,
    }),
    execute: async ({ page = 0, size = 5, tags }: { page?: number; size?: number; tags?: string[] }) => {
        const result = await hnSearch({ page, hitsPerPage: size && size > 0 ? size : 20, tags });
        if (result && typeof result === 'object' && 'error' in result) return result;
        const hits = Array.isArray((result as { hits: unknown[] }).hits) ? (result as { hits: unknown[] }).hits : [];
        return { ...(result as object), hits: size && size > 0 ? hits.slice(0, size) : hits };
    },
});

export const hackerNewsSearchPosts = tool({
    description:
        'Full-text search of Hacker News stories and comments via Algolia. Supports AND/OR/NOT operators plus tag and author filters.',
    inputSchema: z.object({
        query: z.string().describe('Full-text search query'),
        page: z.number().int().min(0).optional().describe('Page number, 0-indexed. Defaults to 0.'),
        size: z.number().int().min(0).optional().describe('Max results to return. Defaults to 5. Set to 0 for the full page (up to 20).'),
        tags: tagsField,
    }),
    execute: async ({
        query,
        page = 0,
        size = 5,
        tags,
    }: {
        query: string;
        page?: number;
        size?: number;
        tags?: string[];
    }) => {
        const result = await hnSearch({ query, page, hitsPerPage: size && size > 0 ? size : 20, tags });
        if (result && typeof result === 'object' && 'error' in result) return result;
        const hits = Array.isArray((result as { hits: unknown[] }).hits) ? (result as { hits: unknown[] }).hits : [];
        return { ...(result as object), hits: size && size > 0 ? hits.slice(0, size) : hits };
    },
});
