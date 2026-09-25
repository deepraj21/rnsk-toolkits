// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { conf, resolveSpaceId } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const cloudField = z.string().optional().describe('Optional Confluence Cloud site ID. If omitted, your first accessible site is used automatically.');
const limitField = z.number().int().min(1).max(250).optional().describe('Max items to return.');
const cursorField = z.string().optional().describe('Opaque pagination cursor from a previous response _links.next.');

const storageBody = z
    .object({
        value: z.string().describe('Page content in Confluence storage format (XHTML).'),
        representation: z.enum(['storage', 'atlas_doc_format']).optional().describe("Body representation, 'storage' or 'atlas_doc_format' (default 'storage')."),
    })
    .optional()
    .describe('Page body. If omitted, an empty page is created.');

export const confluenceCreatePage = tool({
    description: 'Create a new Confluence page in a space, optionally as a child of another page. Use for new documentation or content.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        title: z.string().describe('Page title. Must be unique among siblings under the same parent.'),
        spaceId: z.string().describe('Space numeric ID or space key (keys are resolved automatically).'),
        parentId: z.string().optional().describe('Parent page numeric ID for a child page. Omit to place under the space homepage.'),
        body: storageBody,
    }),
    execute: async ({ confluenceToken, confluenceCloudId, title, spaceId, parentId, body }) => {
        const sid = await resolveSpaceId(confluenceToken, confluenceCloudId, spaceId);
        if (!sid) return { error: `Could not resolve space '${spaceId}' to a numeric space ID.` };
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: '/api/v2/pages',
            method: 'POST',
            body: {
                title,
                spaceId: sid,
                parentId,
                body: body ? { storage: { value: body.value, representation: body.representation ?? 'storage' } } : undefined,
            },
        });
    },
});

export const confluenceGetPageById = tool({
    description: 'Get a Confluence page by ID with metadata and storage-format body. Fetch here first for the latest version number before updating (avoids 409 conflicts).',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Numeric page ID.'),
        draft: z.boolean().optional().describe('Return the unpublished draft instead of the published page.'),
        version: z.number().int().min(1).optional().describe('Specific version number (default: latest).'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id, draft, version }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/pages/${encodeURIComponent(id)}`,
            query: { 'body-format': 'storage', 'get-draft': draft, version },
        });
    },
});

export const confluenceUpdatePage = tool({
    description: 'Update a Confluence page title and/or full body content. Replaces the entire body — always send complete content. Version auto-detects (current + 1) when omitted.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Page ID.'),
        title: z.string().describe('Page title (must stay unique within the space).'),
        body: z
            .object({
                value: z.string().describe('Full updated content — replaces the entire body.'),
                representation: z.enum(['storage', 'atlas_doc_format']).describe("Body representation: 'storage' (XHTML) or 'atlas_doc_format' (ADF)."),
            })
            .describe('Updated page body.'),
        spaceId: z.string().optional().describe('Space ID or key (only when moving spaces).'),
        version: z
            .object({
                number: z.number().int().min(1).optional().describe('Next version number. Omit to auto-detect (current + 1).'),
                message: z.string().optional().describe('Version comment.'),
            })
            .optional()
            .describe('Version info. On 409 conflict, refetch the page and retry.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id, title, body, spaceId, version }) => {
        let number = version?.number;
        if (!number) {
            const current = await conf(confluenceToken, {
                cloudId: confluenceCloudId,
                path: `/api/v2/pages/${encodeURIComponent(id)}`,
            });
            if (current?.error) return current;
            number = (current?.version?.number ?? 0) + 1;
        }
        const sid = spaceId ? await resolveSpaceId(confluenceToken, confluenceCloudId, spaceId) : undefined;
        if (spaceId && !sid) return { error: `Could not resolve space '${spaceId}' to a numeric space ID.` };
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/pages/${encodeURIComponent(id)}`,
            method: 'PUT',
            body: {
                title,
                spaceId: sid,
                body: { [body.representation]: { value: body.value, representation: body.representation } },
                version: { number, message: version?.message },
            },
        });
    },
});

export const confluenceDeletePage = tool({
    description: 'Move a Confluence page to trash (recoverable). In migration workflows, confirm targets were created first — deletion plus partial creation means data loss.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Page ID to delete.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/pages/${encodeURIComponent(id)}`,
            method: 'DELETE',
        });
    },
});

export const confluenceGetPages = tool({
    description: 'List Confluence pages with filters (space, status, title, subtype). Results are permission-scoped; labels are not included (use page-labels tool).',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        spaceId: z.union([z.string(), z.array(z.string())]).optional().describe('Space numeric ID(s) or key(s).'),
        status: z.union([z.string(), z.array(z.string())]).optional().describe('current, archived, deleted or trashed.'),
        title: z.string().optional().describe('Exact title match filter.'),
        subtype: z.string().optional().describe('live or page.'),
        sort: z.string().optional().describe("Sort order, e.g. 'created-date', '-modified-date', 'title'."),
        bodyFormat: z.enum(['storage', 'atlas_doc_format']).optional().describe('Include body in this format.'),
        limit: limitField,
        cursor: cursorField,
    }),
    execute: async ({ confluenceToken, confluenceCloudId, spaceId, status, title, subtype, sort, bodyFormat, limit, cursor }) => {
        const ids = spaceId === undefined ? undefined : await Promise.all(
            (Array.isArray(spaceId) ? spaceId : [spaceId]).map((s) => resolveSpaceId(confluenceToken, confluenceCloudId, s)),
        );
        if (ids && ids.some((v) => !v)) return { error: 'Could not resolve one of the provided spaces.' };
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: '/api/v2/pages',
            query: {
                'space-id': ids,
                status: typeof status === 'string' ? status.split(',').map((s) => s.trim()) : status,
                title,
                subtype,
                sort,
                'body-format': bodyFormat,
                limit,
                cursor,
            },
        });
    },
});

export const confluenceSearchPages = tool({
    description: 'Search pages by exact title, space and status filters. For full-text search use CQL search; for fuzzy title matching use content search.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        title: z.string().optional().describe('Exact page title filter.'),
        spaceId: z.string().optional().describe('Space numeric ID or key.'),
        status: z.string().optional().describe("Page status, e.g. 'current' (default), 'archived'. Comma-separated supported."),
        bodyFormat: z.enum(['storage', 'atlas_doc_format']).optional().describe('Include body in this format.'),
        limit: limitField,
        cursor: cursorField,
    }),
    execute: async ({ confluenceToken, confluenceCloudId, title, spaceId, status, bodyFormat, limit, cursor }) => {
        const sid = spaceId ? await resolveSpaceId(confluenceToken, confluenceCloudId, spaceId) : undefined;
        if (spaceId && !sid) return { error: `Could not resolve space '${spaceId}'.` };
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: '/api/v2/pages',
            query: {
                title,
                'space-id': sid ? [sid] : undefined,
                status: status?.split(',').map((s) => s.trim()),
                'body-format': bodyFormat,
                limit,
                cursor,
            },
        });
    },
});

export const confluenceGetChildPages = tool({
    description: 'List direct child pages of a parent page. Paginate with cursor until no _links.next to get all children.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Parent page ID.'),
        sort: z.string().optional().describe("Sort order, e.g. 'child-position', '-modified-date'."),
        limit: limitField,
        cursor: cursorField,
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id, sort, limit, cursor }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/pages/${encodeURIComponent(id)}/children`,
            query: { sort, limit, cursor },
        });
    },
});

export const confluenceGetPageAncestors = tool({
    description: 'Get the ancestor chain of a page from root to immediate parent. Use for breadcrumb context and hierarchy navigation.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Page ID.'),
        limit: z.number().int().min(1).max(250).optional().describe('Max ancestors (default 25).'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id, limit }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/pages/${encodeURIComponent(id)}/ancestors`,
            query: { limit },
        });
    },
});

export const confluenceGetPageVersions = tool({
    description: 'List version history of a page. Use to audit edits and to get the latest version number before updating.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Page ID.'),
        limit: z.number().int().min(1).max(200).optional().describe('Max versions per page.'),
        cursor: cursorField,
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id, limit, cursor }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/pages/${encodeURIComponent(id)}/versions`,
            query: { limit, cursor },
        });
    },
});

export const confluenceGetPageLikeCount = tool({
    description: 'Get the total like count of a Confluence page.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Page ID.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id }) => {
        const data = await conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/pages/${encodeURIComponent(id)}/likes/count`,
        });
        if (data?.error) return data;
        const count = typeof data?.count === 'number' ? data.count : (data?.size ?? data?.results?.length);
        return { count, ...((data && typeof data === 'object' && !Array.isArray(data)) ? data : {}) };
    },
});

export const confluenceFindTextSelections = tool({
    description: 'Find text occurrences in a page body with character offsets and surrounding context. Use to locate match index/count before creating inline comments.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        pageId: z.string().describe('Numeric page ID.'),
        searchText: z.string().describe('Text to find in the page content.'),
        maxResults: z.number().int().min(1).max(100).optional().describe('Max matches (default 25).'),
        contextChars: z.number().int().min(0).max(500).optional().describe('Context characters around each match (default 100).'),
        caseInsensitive: z.boolean().optional().describe('Case-insensitive matching (default false).'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, pageId, searchText, maxResults, contextChars, caseInsensitive }) => {
        const page = await conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/pages/${encodeURIComponent(pageId)}`,
            query: { 'body-format': 'storage' },
        });
        if (page?.error) return page;
        const html = page?.body?.storage?.value ?? '';
        const text = html
            .replace(/<[^>]*>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, ' ');
        const needle = caseInsensitive ? searchText.toLowerCase() : searchText;
        const haystack = caseInsensitive ? text.toLowerCase() : text;
        const selections = [];
        const ctx = contextChars ?? 100;
        let from = 0;
        while (selections.length < (maxResults ?? 25)) {
            const idx = haystack.indexOf(needle, from);
            if (idx === -1) break;
            selections.push({
                matched_text: text.slice(idx, idx + searchText.length),
                character_offset: idx,
                context_before: text.slice(Math.max(0, idx - ctx), idx),
                context_after: text.slice(idx + searchText.length, idx + searchText.length + ctx),
                original_selection: text.slice(idx, idx + searchText.length),
            });
            from = idx + Math.max(needle.length, 1);
            if (needle.length === 0) break;
        }
        return { page_id: pageId, page_title: page?.title, search_text: searchText, total_matches: selections.length, selections };
    },
});
