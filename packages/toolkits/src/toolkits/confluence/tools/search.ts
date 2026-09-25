// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { conf, resolveSpaceId } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const cloudField = z.string().optional().describe('Optional Confluence Cloud site ID. If omitted, your first accessible site is used automatically.');
const limitField = z.number().int().min(1).max(250).optional().describe('Max items to return.');
const cursorField = z.string().optional().describe('Opaque pagination cursor from a previous response _links.next.');

export const confluenceCqlSearch = tool({
    description: 'Full CQL search across Confluence: full-text (text ~ "..."), title, label, space, type, creator, date filters with AND/OR/NOT and ORDER BY.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        cql: z.string().describe('CQL query, e.g. \'text ~ "api" AND space = DOCS AND type = page\'.'),
        limit: z.number().int().min(1).max(250).optional().describe('Max results.'),
        start: z.number().int().min(0).optional().describe('Zero-based offset.'),
        expand: z.string().optional().describe("Expansions, e.g. 'content.space,content.version'."),
        excerpt: z.enum(['highlight', 'indexed', 'none']).optional().describe('Snippet style for matches.'),
        includeArchivedSpaces: z.boolean().optional().describe('Include archived spaces.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, cql, limit, start, expand, excerpt, includeArchivedSpaces }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: '/rest/api/search',
            query: { cql, limit, start, expand, excerpt, includeArchivedSpaces },
        });
    },
});

export const confluenceSearchContent = tool({
    description: 'Title search over one batch of pages with exact-phrase/all-words/partial ranking. Call again with the next cursor to scan further. For full-text or filtered search use CQL.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        query: z.string().describe('Words to match in page titles (case-insensitive).'),
        spaceKey: z.string().optional().describe('Limit scan to a space key.'),
        limit: limitField,
        start: z.number().int().min(0).optional().describe('Offset within the current batch.'),
        cursor: cursorField,
        expand: z.string().optional().describe("Expansions, e.g. 'space,version'."),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, query, spaceKey, limit, start, cursor, expand }) => {
        const sid = spaceKey ? await resolveSpaceId(confluenceToken, confluenceCloudId, spaceKey) : undefined;
        if (spaceKey && !sid) return { error: `Could not resolve space key '${spaceKey}'.` };
        const data = await conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: '/api/v2/pages',
            query: { 'space-id': sid ? [sid] : undefined, limit: limit ?? 25, cursor },
        });
        if (data?.error) return data;
        const words = query.toLowerCase().split(/\s+/).filter(Boolean);
        const phrase = query.toLowerCase();
        const scored = (data?.results ?? []).map((p) => {
            const title = String(p?.title ?? '').toLowerCase();
            let rank = 0;
            if (title.includes(phrase)) rank = 3;
            else if (words.length > 0 && words.every((w) => title.includes(w))) rank = 2;
            else if (words.some((w) => w && title.includes(w))) rank = 1;
            return { page: p, rank };
        }).filter((s) => s.rank > 0);
        scored.sort((a, b) => b.rank - a.rank);
        const sliced = typeof start === 'number' ? scored.slice(start) : scored;
        return { results: sliced.map((s) => s.page), size: sliced.length, _links: data?._links };
    },
});

export const confluenceSearchSpaces = tool({
    description: 'Find spaces by partial name/key match plus type, status and label filters. Name matching is client-side over the fetched batch.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        query: z.string().optional().describe('Case-insensitive partial match on name or key. Empty lists all matching other filters.'),
        spaceKey: z.union([z.string(), z.array(z.string())]).optional().describe('Exact key(s) filter.'),
        type: z.enum(['global', 'personal']).optional().describe('Type filter.'),
        status: z.enum(['current', 'archived']).optional().describe('Status filter.'),
        label: z.union([z.string(), z.array(z.string())]).optional().describe('Label(s) filter.'),
        expand: z.array(z.string()).optional().describe("Extra details, e.g. ['description', 'icon']."),
        limit: z.number().int().min(1).max(200).optional().describe('Max spaces per page.'),
        cursor: cursorField,
    }),
    execute: async ({ confluenceToken, confluenceCloudId, query, spaceKey, type, status, label, expand, limit, cursor }) => {
        const keys = spaceKey === undefined ? undefined : Array.isArray(spaceKey) ? spaceKey : [spaceKey];
        const labels = label === undefined ? undefined : Array.isArray(label) ? label : [label];
        const data = await conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: '/api/v2/spaces',
            query: {
                keys,
                type,
                status,
                labels,
                'description-format': expand?.includes('description') ? 'plain' : undefined,
                'include-icon': expand?.includes('icon') ? true : undefined,
                limit,
                cursor,
            },
        });
        if (data?.error) return data;
        if (!query) return data;
        const q = query.toLowerCase();
        return { ...data, results: (data?.results ?? []).filter((s) => String(s?.name ?? '').toLowerCase().includes(q) || String(s?.key ?? '').toLowerCase().includes(q)) };
    },
});

export const confluenceSearchUsers = tool({
    description: 'Look up a user by account ID, or browse users. Use to resolve account IDs for assignees and audit fields.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        accountId: z.string().optional().describe('Exact Atlassian account ID to look up.'),
        limit: z.number().int().min(1).max(200).optional().describe('Max users per page.'),
        start: z.number().int().min(0).optional().describe('Zero-based offset.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, accountId, limit, start }) => {
        if (accountId) {
            return conf(confluenceToken, {
                cloudId: confluenceCloudId,
                path: '/rest/api/user',
                query: { accountId },
            });
        }
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: '/rest/api/search/user',
            query: { limit, start },
        });
    },
});
