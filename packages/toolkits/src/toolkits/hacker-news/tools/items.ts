// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { hnFirebase } from './client.js';

export const hackerNewsGetItem = tool({
    description:
        'Get a Hacker News item (story, comment, job, poll, or pollopt) by its numeric ID. Returns author, score, title, text, timestamps, and comment IDs.',
    inputSchema: z.object({
        id: z.number().int().positive().describe('Unique numeric ID of the item to retrieve'),
    }),
    execute: async ({ id }: { id: number }) => {
        const item = await hnFirebase(`/item/${id}.json`);
        if (item && typeof item === 'object' && 'error' in item) return item;
        if (item === null) return { error: `Hacker News item ${id} not found` };
        return item;
    },
});

function truncate(text: unknown, enabled: boolean): unknown {
    if (!enabled || typeof text !== 'string' || text.length <= 500) return text;
    return text.slice(0, 500);
}

async function resolveChildren(
    kids: number[] | undefined,
    depth: number,
    maxDepth: number,
    maxChildren: number,
    truncateText: boolean,
): Promise<{ children: unknown[]; truncated: boolean; depthReached: boolean }> {
    if (depth > maxDepth || !kids || kids.length === 0 || maxChildren === 0) {
        return { children: [], truncated: (kids?.length ?? 0) > 0 && depth <= maxDepth && maxChildren === 0, depthReached: depth > maxDepth };
    }
    const shown = kids.slice(0, maxChildren);
    const children = [];
    for (const kidId of shown) {
        const raw = await hnFirebase(`/item/${kidId}.json`);
        if (!raw || typeof raw !== 'object' || 'error' in raw || raw === null) continue;
        const item = raw as Record<string, unknown>;
        const nested = await resolveChildren(
            item.kids as number[] | undefined,
            depth + 1,
            maxDepth,
            maxChildren,
            truncateText,
        );
        children.push({
            id: item.id,
            type: item.type,
            author: item.by ?? null,
            text: truncate(item.text ?? null, truncateText),
            createdAt: typeof item.time === 'number' ? new Date(item.time * 1000).toISOString() : null,
            createdAtI: item.time ?? null,
            parentId: item.parent ?? null,
            children: nested.children,
            childrenTruncated: nested.truncated,
            maxDepthReached: nested.depthReached,
        });
    }
    return { children, truncated: kids.length > shown.length, depthReached: false };
}

export const hackerNewsGetItemWithId = tool({
    description:
        'Get a Hacker News item with nested comment replies. Limits depth, child count, and text length to prevent context overflow. Use for reading stories with their discussion.',
    inputSchema: z.object({
        itemId: z.string().describe('Numeric ID of the item (story, comment, job, poll, or pollopt)'),
        maxDepth: z.number().int().min(0).max(10).optional().describe('Nested reply depth to include (0 = no children). Defaults to 2.'),
        maxChildren: z.number().int().min(0).max(100).optional().describe('Direct child comments per item. Defaults to 10.'),
        truncateText: z.boolean().optional().describe('Truncate long text to 500 characters. Defaults to true.'),
    }),
    execute: async ({
        itemId,
        maxDepth = 2,
        maxChildren = 10,
        truncateText = true,
    }: {
        itemId: string;
        maxDepth?: number;
        maxChildren?: number;
        truncateText?: boolean;
    }) => {
        const id = Number(itemId);
        if (!Number.isInteger(id) || id <= 0) {
            return { found: false, item: null, errorMessage: `Invalid item ID: ${itemId}` };
        }
        const raw = await hnFirebase(`/item/${id}.json`);
        if (raw && typeof raw === 'object' && 'error' in raw) {
            return { found: false, item: null, errorMessage: (raw as { error: string }).error };
        }
        if (raw === null) {
            return { found: false, item: null, errorMessage: `Item ${id} not found` };
        }
        const item = raw as Record<string, unknown>;
        const nested = await resolveChildren(item.kids as number[] | undefined, 1, maxDepth, maxChildren, truncateText);
        return {
            found: true,
            item: {
                id: item.id,
                type: item.type,
                author: item.by ?? null,
                title: truncate(item.title ?? null, truncateText),
                url: item.url ?? null,
                text: truncate(item.text ?? null, truncateText),
                points: item.score ?? null,
                parentId: item.parent ?? null,
                storyId: null,
                createdAt: typeof item.time === 'number' ? new Date(item.time * 1000).toISOString() : null,
                createdAtI: item.time ?? null,
                options: item.parts ?? null,
                children: nested.children,
                childrenShown: nested.children.length,
                totalChildrenCount: Array.isArray(item.kids) ? item.kids.length : 0,
                childrenTruncated: nested.truncated,
                maxDepthReached: nested.depthReached,
            },
        };
    },
});

export const hackerNewsGetUser = tool({
    description:
        'Get a Hacker News user public profile by username. Returns username, karma, and bio. Use to look up HN community members.',
    inputSchema: z.object({
        username: z.string().describe('Case-sensitive HN username, e.g. "pg"'),
    }),
    execute: async ({ username }: { username: string }) => {
        const user = await hnFirebase(`/user/${username}.json`);
        if (user && typeof user === 'object' && 'error' in user) return user;
        if (user === null) return { error: `Hacker News user "${username}" not found` };
        const u = user as Record<string, unknown>;
        return { username: u.id, karma: u.karma, about: u.about ?? null };
    },
});

export const hackerNewsGetUserByUsername = tool({
    description:
        'Get detailed Hacker News user info by username, including creation date, karma, bio, and submission history.',
    inputSchema: z.object({
        username: z.string().describe('Case-sensitive HN username, e.g. "pg"'),
    }),
    execute: async ({ username }: { username: string }) => {
        const user = await hnFirebase(`/user/${username}.json`);
        if (user && typeof user === 'object' && 'error' in user) return user;
        if (user === null) return { error: `Hacker News user "${username}" not found` };
        return user;
    },
});
