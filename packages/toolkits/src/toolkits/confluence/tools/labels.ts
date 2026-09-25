// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { conf } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const cloudField = z.string().optional().describe('Optional Confluence Cloud site ID. If omitted, your first accessible site is used automatically.');

export const confluenceAddContentLabel = tool({
    description: 'Tag a page or blog post with metadata labels for organization and search. Each label needs a prefix (global/team/my) and a lowercase hyphenated name.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Content ID of the page or blog post to label.'),
        contentType: z.enum(['page', 'blogpost']).optional().describe("Content type hint (default 'page')."),
        labels: z
            .array(
                z.object({
                    prefix: z.enum(['global', 'team', 'my']).describe('Label scope.'),
                    name: z.string().describe('Lowercase alphanumeric/hyphenated label name.'),
                }),
            )
            .min(1)
            .describe('Labels to add.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id, labels }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/rest/api/content/${encodeURIComponent(id)}/label`,
            method: 'POST',
            body: labels.map((l) => ({ prefix: l.prefix, name: l.name })),
        });
    },
});

export const confluenceGetLabels = tool({
    description: 'Browse all site labels for discovery and paging. For page-specific labels use the page-labels tool.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        limit: z.number().int().min(1).optional().describe('Max labels per page.'),
        cursor: z.string().optional().describe('Pagination cursor from a previous _links.next.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, limit, cursor }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: '/api/v2/labels',
            query: { limit, cursor },
        });
    },
});

export const confluenceGetPageLabels = tool({
    description: 'List labels on a page. Labels live here (not in page-get responses) — paginate with cursor past 25.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Page ID.'),
        limit: z.number().int().min(1).optional().describe('Max labels per page.'),
        cursor: z.string().optional().describe('Pagination cursor from a previous _links.next.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id, limit, cursor }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/pages/${encodeURIComponent(id)}/labels`,
            query: { limit, cursor },
        });
    },
});
