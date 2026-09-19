// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { hnFirebase } from './client.js';

const prettyField = z
    .string()
    .optional()
    .describe("Set to 'pretty' for formatted JSON output. Leave unset for compact JSON.");

function feedTool(name: string, description: string, endpoint: string, resultKey: string) {
    return tool({
        description,
        inputSchema: z.object({
            print: prettyField,
        }),
        execute: async ({ print }: { print?: string }) => {
            const ids = await hnFirebase(`/${endpoint}.json`, print ? { print } : {});
            if (ids && typeof ids === 'object' && 'error' in ids) return ids;
            return { [resultKey]: ids, count: Array.isArray(ids) ? ids.length : 0 };
        },
    });
}

export const hackerNewsGetAskStories = feedTool(
    'ask',
    'Get up to 200 latest Ask HN story IDs in ranked order. Use the IDs with HackerNewsGetItem to fetch full story details.',
    'askstories',
    'storyIds',
);

export const hackerNewsGetBestStories = feedTool(
    'best',
    'Get up to 500 best Hacker News story IDs ranked by score. Use the IDs with HackerNewsGetItem to fetch full story details.',
    'beststories',
    'storyIds',
);

export const hackerNewsGetJobStories = tool({
    description:
        'Get up to 200 latest Hacker News job story IDs. Use the IDs with HackerNewsGetItem to fetch full job details.',
    inputSchema: z.object({
        printFormat: z
            .string()
            .optional()
            .describe("Set to 'pretty' for formatted JSON output. Leave unset for compact JSON."),
    }),
    execute: async ({ printFormat }: { printFormat?: string }) => {
        const ids = await hnFirebase('/jobstories.json', printFormat ? { print: printFormat } : {});
        if (ids && typeof ids === 'object' && 'error' in ids) return ids;
        return { jobStoryIds: ids, count: Array.isArray(ids) ? ids.length : 0 };
    },
});

export const hackerNewsGetNewStories = tool({
    description:
        'Get up to 500 newest Hacker News story IDs, most recent first. Use the IDs with HackerNewsGetItem to fetch full story details.',
    inputSchema: z.object({
        printFormat: z
            .string()
            .optional()
            .describe("Set to 'pretty' for formatted JSON output. Leave unset for compact JSON."),
    }),
    execute: async ({ printFormat }: { printFormat?: string }) => {
        const ids = await hnFirebase('/newstories.json', printFormat ? { print: printFormat } : {});
        if (ids && typeof ids === 'object' && 'error' in ids) return ids;
        return { storyIds: ids, count: Array.isArray(ids) ? ids.length : 0 };
    },
});

export const hackerNewsGetShowStories = tool({
    description:
        'Get up to 200 latest Show HN story IDs where people share projects and products. Use the IDs with HackerNewsGetItem to fetch full details.',
    inputSchema: z.object({
        printFormat: z
            .string()
            .optional()
            .describe("Set to 'pretty' for formatted JSON output. Leave unset for compact JSON."),
    }),
    execute: async ({ printFormat }: { printFormat?: string }) => {
        const ids = await hnFirebase('/showstories.json', printFormat ? { print: printFormat } : {});
        if (ids && typeof ids === 'object' && 'error' in ids) return ids;
        return { storyIds: ids, count: Array.isArray(ids) ? ids.length : 0 };
    },
});

export const hackerNewsGetTopStories = feedTool(
    'top',
    'Get up to 500 top Hacker News story IDs in front-page order. Use the IDs with HackerNewsGetItem to fetch full story details.',
    'topstories',
    'storyIds',
);

export const hackerNewsGetMaxItemId = tool({
    description:
        'Get the current largest Hacker News item ID. Use to discover the most recent items or walk backward through all items.',
    inputSchema: z.object({
        print: z
            .string()
            .optional()
            .describe("Set to 'pretty' for formatted JSON output. Leave unset for compact JSON."),
    }),
    execute: async ({ print }: { print?: string }) => {
        const maxId = await hnFirebase('/maxitem.json', print ? { print } : {});
        if (maxId && typeof maxId === 'object' && 'error' in maxId) return maxId;
        return { maxItemId: maxId };
    },
});

export const hackerNewsGetUpdates = tool({
    description:
        'Get recently changed Hacker News item IDs and user profiles. Use to monitor recent activity on the platform.',
    inputSchema: z.object({
        print: z
            .string()
            .optional()
            .describe("Set to 'pretty' for formatted JSON output. Leave unset for compact JSON."),
    }),
    execute: async ({ print }: { print?: string }) => {
        return hnFirebase('/updates.json', print ? { print } : {});
    },
});
