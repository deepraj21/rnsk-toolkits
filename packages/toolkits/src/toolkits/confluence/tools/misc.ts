// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { conf } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const cloudField = z.string().optional().describe('Optional Confluence Cloud site ID. If omitted, your first accessible site is used automatically.');

export const confluenceGetAuditLogs = tool({
    description: 'Fetch Confluence audit records for compliance or troubleshooting. Filter by date range (epoch ms) and free text. Requires admin permission and a paid plan.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        start: z.number().int().min(0).optional().describe('Zero-based offset.'),
        limit: z.number().int().min(1).optional().describe('Max records per page.'),
        searchString: z.string().optional().describe("Free-text filter, e.g. 'user login'."),
        startDate: z.number().int().optional().describe('Range start, epoch milliseconds.'),
        endDate: z.number().int().optional().describe('Range end, epoch milliseconds.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, start, limit, searchString, startDate, endDate }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: '/rest/api/audit',
            query: { start, limit, searchString, startDate, endDate },
        });
    },
});

export const confluenceGetContentRestrictions = tool({
    description: 'Show view/edit restrictions on a page or blog post — who is allowed to read or update it.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Content ID of the page or blog post.'),
        expand: z.array(z.string()).optional().describe("Expansions, e.g. ['restrictables.operation', 'user']."),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id, expand }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/rest/api/content/${encodeURIComponent(id)}/restriction`,
            query: { expand: expand && expand.length > 0 ? expand.join(',') : undefined },
        });
    },
});
