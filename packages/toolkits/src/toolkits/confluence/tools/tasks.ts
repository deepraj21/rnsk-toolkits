// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { conf } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const cloudField = z.string().optional().describe('Optional Confluence Cloud site ID. If omitted, your first accessible site is used automatically.');

const idList = z.union([z.string(), z.array(z.string())]).optional();

export const confluenceGetTasks = tool({
    description: 'List Confluence tasks (action items) filtered by status, page, space, blog post, assignee, creator or completer — no TODO keyword hunting needed.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        status: z.string().optional().describe("Task status: 'complete' or 'incomplete'."),
        pageId: idList.describe('Page ID(s) filter.'),
        blogpostId: idList.describe('Blog post ID(s) filter.'),
        spaceId: idList.describe('Space ID(s) filter.'),
        taskId: idList.describe('Task ID(s) filter.'),
        assignedTo: idList.describe('Assignee Atlassian account ID(s).'),
        createdBy: idList.describe('Creator Atlassian account ID(s).'),
        completedBy: idList.describe('Completer Atlassian account ID(s).'),
        bodyFormat: z.enum(['storage', 'atlas_doc_format']).optional().describe('Include task bodies in this format.'),
        includeBlankTasks: z.boolean().optional().describe('Include empty tasks.'),
        limit: z.number().int().min(1).max(250).optional().describe('Max tasks.'),
        cursor: z.string().optional().describe('Pagination cursor from a previous _links.next.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, ...filters }) => {
        const toArray = (v) => (v === undefined ? undefined : Array.isArray(v) ? v : [v]);
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: '/api/v2/tasks',
            query: {
                status: filters.status,
                'page-id': toArray(filters.pageId),
                'blogpost-id': toArray(filters.blogpostId),
                'space-id': toArray(filters.spaceId),
                'task-id': toArray(filters.taskId),
                'assigned-to': toArray(filters.assignedTo),
                'created-by': toArray(filters.createdBy),
                'completed-by': toArray(filters.completedBy),
                'body-format': filters.bodyFormat,
                'include-blank-tasks': filters.includeBlankTasks,
                limit: filters.limit,
                cursor: filters.cursor,
            },
        });
    },
});

export const confluenceUpdateTask = tool({
    description: 'Mark a Confluence task complete or incomplete. Use in review workflows and dashboards.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Task ID.'),
        status: z.enum(['complete', 'incomplete']).describe('New task status.'),
        bodyFormat: z.enum(['storage', 'atlas_doc_format']).optional().describe('Body format for the response.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id, status, bodyFormat }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/tasks/${encodeURIComponent(id)}`,
            method: 'PUT',
            query: { 'body-format': bodyFormat },
            body: { status },
        });
    },
});
