// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { posthogRequest } from './client.js';

export const posthogListDashboards = tool({
  description:
    'Lists dashboards in a project — name, description, tags, pinned state, and last view time. Filter by text search, folder, creator, or pinned status. Use the returned id with the other dashboard tools. Needs dashboard:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    search: z.string().optional().describe('Match name, description, and tag names'),
    pinned: z.boolean().optional().describe('Only pinned dashboards'),
    folder: z
      .string()
      .optional()
      .describe(
        'Only dashboards filed directly in this project-tree folder, e.g. "Unfiled/Marketing"',
      ),
    createdBy: z.string().optional().describe('Only dashboards created by this user UUID'),
    excludeGenerated: z.boolean().optional().describe('Exclude dashboards PostHog generated'),
    ordering: z
      .enum(['-last_viewed_at'])
      .optional()
      .describe('Sort: -last_viewed_at puts recently viewed dashboards first'),
    limit: z.number().int().min(1).optional().describe('Max dashboards per page'),
    offset: z.number().int().min(0).optional().describe('Rows to skip for pagination'),
  }),
  execute: async ({
    posthogCredentials,
    projectId,
    search,
    pinned,
    folder,
    createdBy,
    excludeGenerated,
    ordering,
    limit,
    offset,
  }) => {
    if (!projectId) return { error: 'projectId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/dashboards/`,
      {
        query: {
          search,
          pinned,
          folder,
          created_by: createdBy,
          exclude_generated: excludeGenerated,
          ordering,
          limit,
          offset,
        },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogGetDashboard = tool({
  description:
    'Gets one dashboard by id with its full definition — tiles, the insights on them, filters, variables, and layout. Use this to read what a dashboard shows or to get tile/insight ids before editing. Needs dashboard:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    dashboardId: z.coerce.number().int().describe('Dashboard id (from posthogListDashboards)'),
  }),
  execute: async ({ posthogCredentials, projectId, dashboardId }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!dashboardId) return { error: 'dashboardId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/dashboards/${dashboardId}/`,
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogCreateDashboard = tool({
  description:
    'Creates an empty dashboard — returns its id, which you pass to posthogAddDashboardInsight to attach charts. Optionally set a description, pin it, add tags, or file it in a folder. Needs dashboard:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    name: z.string().min(1).describe('Dashboard title, e.g. "Growth overview"'),
    description: z.string().optional().describe('Short description of what the dashboard tracks'),
    pinned: z.boolean().optional().describe('Pin the dashboard (shown first in the list)'),
    tags: z.array(z.string()).optional().describe('Tags to apply'),
    folder: z
      .string()
      .optional()
      .describe('Project-tree folder path to file it under, e.g. "Unfiled/Marketing"'),
  }),
  execute: async ({ posthogCredentials, projectId, name, description, pinned, tags, folder }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!name) return { error: 'name is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/dashboards/`,
      {
        method: 'POST',
        body: { name, description, pinned, tags, folder },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogDeleteDashboard = tool({
  description:
    'Deletes a dashboard permanently. The insights on it are not deleted — they remain in the insight list — but the dashboard and its layout are gone. Confirm with the user first. Needs dashboard:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    dashboardId: z.coerce.number().int().describe('Dashboard id to delete'),
  }),
  execute: async ({ posthogCredentials, projectId, dashboardId }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!dashboardId) return { error: 'dashboardId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/dashboards/${dashboardId}/`,
      { method: 'DELETE' },
    );
    if (result.error) return result;

    return { deleted: true, status: result.status, data: result.data ?? null };
  },
});

export const posthogAddDashboardInsight = tool({
  description:
    'Attaches an existing insight to a dashboard as a new tile. Pass the insight’s numeric id (the id field, not short_id) from the insight list or creation response. Needs dashboard:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    dashboardId: z.coerce.number().int().describe('Dashboard to add the tile to'),
    insightId: z.coerce.number().int().describe('Numeric insight id (not short_id) to attach'),
  }),
  execute: async ({ posthogCredentials, projectId, dashboardId, insightId }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!dashboardId) return { error: 'dashboardId is required.' };
    if (!insightId) return { error: 'insightId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/dashboards/${dashboardId}/add_insight/`,
      { method: 'POST', body: { insight_id: insightId } },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
