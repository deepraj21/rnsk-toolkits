// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { ddApi, toDatadogError } from './client.js';

const credsField = z.string().describe('Datadog credentials JSON with apiKey and appKey (injected by system)');

const widgetSchema = z.object({
    definition: z.record(z.any()).describe('Widget definition with type, requests, styling'),
    id: z.number().optional().describe('Widget ID (auto-generated when omitted)'),
    layout: z.record(z.any()).optional().describe('Layout (x, y, width, height for free layouts)'),
});

const templateVariableSchema = z.object({
    name: z.string().describe('Variable name'),
    prefix: z.string().optional().describe('Variable prefix'),
    default: z.string().optional().describe('Default value'),
    available_values: z.array(z.string()).optional().describe('Allowed values'),
});

export const datadogCreateDashboard = tool({
    description:
        'Create a dashboard with widgets for unified monitoring views. For log/APM/RUM widget queries keep group_by inside the query object, not at request level.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        title: z.string().min(1).max(80).describe('Dashboard title'),
        widgets: z.array(widgetSchema).min(1).describe('Widgets to include'),
        description: z.string().max(500).optional().describe('Dashboard description'),
        layout_type: z.enum(['ordered', 'free']).optional().describe('Layout (default ordered)'),
        tags: z.array(z.string()).optional().describe('Dashboard tags'),
        notify_list: z.array(z.string()).optional().describe('Users to notify of changes'),
        template_variables: z.array(templateVariableSchema).optional().describe('Template variables'),
    }),
    execute: async ({ datadogCredentials, ...body }) => {
        try {
            const data = await ddApi(datadogCredentials, 'POST', '/api/v1/dashboard', { body });
            return { ...(data as object), success: true };
        } catch (error) {
            return toDatadogError(error, 'Failed to create dashboard');
        }
    },
});

export const datadogGetDashboard = tool({
    description:
        'Get a dashboard by ID with widgets, layout, and template variables. Keep reflow_type and pause_auto_refresh from the response for round-trip updates.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        dashboard_id: z.string().describe('Dashboard ID'),
    }),
    execute: async ({ datadogCredentials, dashboard_id }) => {
        try {
            return await ddApi(datadogCredentials, 'GET', `/api/v1/dashboard/${dashboard_id}`);
        } catch (error) {
            return toDatadogError(error, 'Failed to get dashboard');
        }
    },
});

export const datadogUpdateDashboard = tool({
    description:
        'Update a dashboard; only provided fields change. Omit reflow_type and pause_auto_refresh to preserve existing values.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        dashboard_id: z.string().describe('Dashboard ID to update'),
        title: z.string().min(1).max(80).optional().describe('Dashboard title'),
        widgets: z.array(widgetSchema).optional().describe('Replacement widgets'),
        description: z.string().max(500).optional().describe('Dashboard description'),
        layout_type: z.string().optional().describe("Layout: 'ordered' or 'free'"),
        tags: z.array(z.string()).optional().describe('Replacement tags'),
        notify_list: z.array(z.string()).optional().describe('Replacement notify list'),
        template_variables: z.array(templateVariableSchema).optional().describe('Replacement variables'),
        reflow_type: z.string().optional().describe("Reflow for ordered layouts: 'auto' or 'fixed'"),
        is_read_only: z.boolean().optional().describe('Read-only flag'),
        pause_auto_refresh: z.boolean().optional().describe('Pause automatic refresh'),
    }),
    execute: async ({ datadogCredentials, dashboard_id, ...body }) => {
        try {
            const data = await ddApi(datadogCredentials, 'PUT', `/api/v1/dashboard/${dashboard_id}`, { body });
            return { ...(data as object), success: true };
        } catch (error) {
            return toDatadogError(error, 'Failed to update dashboard');
        }
    },
});

export const datadogDeleteDashboard = tool({
    description:
        'Permanently delete a dashboard. Irreversible — confirm with the user first.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        dashboard_id: z.string().describe('Dashboard ID to delete'),
    }),
    execute: async ({ datadogCredentials, dashboard_id }) => {
        try {
            const data = await ddApi(datadogCredentials, 'DELETE', `/api/v1/dashboard/${dashboard_id}`);
            return {
                deleted_dashboard_id: (data as any)?.deleted_dashboard_id ?? dashboard_id,
                message: 'Dashboard deleted',
                success: true,
            };
        } catch (error) {
            return toDatadogError(error, 'Failed to delete dashboard');
        }
    },
});

export const datadogListDashboards = tool({
    description:
        'List dashboards with shared/deleted filters and start/count pagination.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        filter_shared: z.boolean().optional().describe('Filter by shared status'),
        filter_deleted: z.boolean().optional().describe('Include deleted dashboards'),
        count: z.number().optional().describe('Max dashboards to return'),
        start: z.number().optional().describe('Offset: skip this many dashboards'),
    }),
    execute: async ({ datadogCredentials, filter_shared, filter_deleted, count, start }) => {
        try {
            const data = await ddApi(datadogCredentials, 'GET', '/api/v1/dashboard', {
                query: {
                    'filter[shared]': filter_shared,
                    'filter[deleted]': filter_deleted,
                    count,
                    start,
                },
            });
            const dashboards = (data as any)?.dashboards ?? (Array.isArray(data) ? data : []);
            return { dashboards, total_count: dashboards.length };
        } catch (error) {
            return toDatadogError(error, 'Failed to list dashboards');
        }
    },
});
