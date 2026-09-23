// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { NOTION_VERSION_VIEWS, notionRequest, toNotionError } from './client.js';

const tokenField = z.string().optional().describe('Token provided by the system; do not provide');
const V = NOTION_VERSION_VIEWS;

export const notionCreateView = tool({
    description: 'Create a view (table, board, list, calendar, timeline, gallery, form, chart, map, dashboard) over a data source. Provide exactly one of databaseId, viewId (dashboard widget), or createDatabase (linked view).',
    inputSchema: z.object({
        dataSourceId: z.string().describe('Data source UUID the view is over'),
        name: z.string().describe('View name'),
        type: z.enum(['table', 'board', 'list', 'calendar', 'timeline', 'gallery', 'form', 'chart', 'map', 'dashboard']).describe('View layout type'),
        databaseId: z.string().optional().describe('Database UUID for a top-level view'),
        viewId: z.string().optional().describe('Dashboard view UUID to add this as a widget'),
        createDatabase: z.any().optional().describe('Linked-view creation: {parent: {type:"page_id", page_id}, position?}'),
        filter: z.any().optional().describe('View filter in data-source query format'),
        sorts: z.array(z.any()).max(100).optional().describe('View sorts'),
        quickFilters: z.any().optional().describe('Pinned quick filters map'),
        configuration: z.any().optional().describe('Type-specific presentation config (type field must match view type)'),
        position: z.any().optional().describe('Tab-bar position: {type:"start"|"end"|"after_view", view_id?}'),
        placement: z.any().optional().describe('Dashboard widget placement'),
        notionToken: tokenField,
    }),
    execute: async ({ dataSourceId, name, type, databaseId, viewId, createDatabase, filter, sorts, quickFilters, configuration, position, placement, notionToken }) => {
        try {
            return await notionRequest(notionToken, '/views', {
                method: 'POST',
                version: V,
                body: {
                    data_source_id: dataSourceId,
                    name,
                    type,
                    database_id: databaseId,
                    view_id: viewId,
                    create_database: createDatabase,
                    filter,
                    sorts,
                    quick_filters: quickFilters,
                    configuration,
                    position,
                    placement,
                },
            });
        } catch (error) {
            return toNotionError(error, 'Notion create view failed');
        }
    },
});

export const notionListViews = tool({
    description: 'List view references for a database or data source (minimal id objects; retrieve each for full config).',
    inputSchema: z.object({
        databaseId: z.string().optional().describe('Database UUID (one of databaseId/dataSourceId required)'),
        dataSourceId: z.string().optional().describe('Data source UUID (one of databaseId/dataSourceId required)'),
        pageSize: z.number().min(1).max(100).optional().describe('Views per page (max 100)'),
        startCursor: z.string().optional().describe('next_cursor from a previous response'),
        notionToken: tokenField,
    }),
    execute: async ({ databaseId, dataSourceId, pageSize, startCursor, notionToken }) => {
        try {
            if (!databaseId && !dataSourceId) return { error: 'Provide databaseId or dataSourceId' };
            return await notionRequest(notionToken, '/views', {
                version: V,
                query: { database_id: databaseId, data_source_id: dataSourceId, page_size: pageSize, start_cursor: startCursor },
            });
        } catch (error) {
            return toNotionError(error, 'Notion list views failed');
        }
    },
});

export const notionRetrieveView = tool({
    description: 'Retrieve a view with full configuration (filters, sorts, layout settings) by ID.',
    inputSchema: z.object({
        viewId: z.string().describe('UUID of the view'),
        notionToken: tokenField,
    }),
    execute: async ({ viewId, notionToken }) => {
        try {
            return await notionRequest(notionToken, `/views/${viewId}`, { version: V });
        } catch (error) {
            return toNotionError(error, 'Notion retrieve view failed');
        }
    },
});

export const notionUpdateView = tool({
    description: 'Update a view name, filter, sorts, quick filters, or configuration. Only provided fields change.',
    inputSchema: z.object({
        viewId: z.string().describe('UUID of the view'),
        name: z.string().optional().describe('New view name'),
        filter: z.any().optional().describe('New filter (null clears)'),
        sorts: z.array(z.any()).max(100).optional().describe('New sorts'),
        quickFilters: z.any().optional().describe('New quick filters'),
        configuration: z.any().optional().describe('New presentation configuration'),
        notionToken: tokenField,
    }),
    execute: async ({ viewId, name, filter, sorts, quickFilters, configuration, notionToken }) => {
        try {
            return await notionRequest(notionToken, `/views/${viewId}`, {
                method: 'PATCH',
                version: V,
                body: { name, filter, sorts, quick_filters: quickFilters, configuration },
            });
        } catch (error) {
            return toNotionError(error, 'Notion update view failed');
        }
    },
});

export const notionDeleteView = tool({
    description: 'Permanently delete a view by ID. A database must keep at least one view.',
    inputSchema: z.object({
        viewId: z.string().describe('UUID of the view'),
        notionToken: tokenField,
    }),
    execute: async ({ viewId, notionToken }) => {
        try {
            return await notionRequest(notionToken, `/views/${viewId}`, { method: 'DELETE', version: V });
        } catch (error) {
            return toNotionError(error, 'Notion delete view failed');
        }
    },
});

export const notionCreateViewQuery = tool({
    description: 'Execute a view query (applies the view filter/sorts) and return the first page of page references plus a query ID for paging.',
    inputSchema: z.object({
        viewId: z.string().describe('UUID of the view to query'),
        pageSize: z.number().min(1).max(100).optional().describe('Results in the first page (max 100)'),
        notionToken: tokenField,
    }),
    execute: async ({ viewId, pageSize, notionToken }) => {
        try {
            return await notionRequest(notionToken, `/views/${viewId}/queries`, {
                method: 'POST',
                version: V,
                body: { page_size: pageSize },
            });
        } catch (error) {
            return toNotionError(error, 'Notion create view query failed');
        }
    },
});

export const notionGetViewQueryResults = tool({
    description: 'Get a page of results from a cached view query using its query ID.',
    inputSchema: z.object({
        viewId: z.string().describe('UUID of the view'),
        queryId: z.string().describe('Cached query ID from create view query'),
        pageSize: z.number().min(1).max(100).optional().describe('Results per page (max 100)'),
        startCursor: z.string().optional().describe('next_cursor from a previous page'),
        notionToken: tokenField,
    }),
    execute: async ({ viewId, queryId, pageSize, startCursor, notionToken }) => {
        try {
            return await notionRequest(notionToken, `/views/${viewId}/queries/${queryId}`, {
                version: V,
                query: { page_size: pageSize, start_cursor: startCursor },
            });
        } catch (error) {
            return toNotionError(error, 'Notion get view query results failed');
        }
    },
});

export const notionDeleteViewQuery = tool({
    description: 'Delete a cached view query by view ID and query ID.',
    inputSchema: z.object({
        viewId: z.string().describe('UUID of the view'),
        queryId: z.string().describe('Cached query ID to delete'),
        notionToken: tokenField,
    }),
    execute: async ({ viewId, queryId, notionToken }) => {
        try {
            return await notionRequest(notionToken, `/views/${viewId}/queries/${queryId}`, {
                method: 'DELETE',
                version: V,
            });
        } catch (error) {
            return toNotionError(error, 'Notion delete view query failed');
        }
    },
});
