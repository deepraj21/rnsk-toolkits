// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { posthogRequest } from './client.js';

export const posthogListInsights = tool({
  description:
    'Lists saved insights (charts) in a project — trends, funnels, retention, paths, lifecycle, stickiness, and SQL. Filter by text search, dashboard, insight type, tags, favorites, or date ranges; set basic: true for fast metadata-only results. Needs insight:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    search: z.string().optional().describe('Search name, derived name, description, and tags'),
    dashboards: z
      .array(z.coerce.number().int())
      .optional()
      .describe('Only insights attached to all of these dashboard ids (JSON-encoded)'),
    insight: z
      .enum([
        'BI',
        'FUNNELS',
        'JOURNEYS',
        'JSON',
        'LIFECYCLE',
        'PATHS',
        'RETENTION',
        'SQL',
        'STICKINESS',
        'TRENDS',
      ])
      .optional()
      .describe('Restrict to one insight type'),
    favorited: z.boolean().optional().describe('Only insights marked favorited'),
    tags: z
      .array(z.string())
      .optional()
      .describe('Insights carrying any of these tags (JSON-encoded)'),
    dateFrom: z
      .string()
      .optional()
      .describe('Only insights modified after this date (2025-04-23 or -7d)'),
    dateTo: z.string().optional().describe('Only insights modified before this date'),
    createdDateFrom: z.string().optional().describe('Only insights created after this date'),
    createdDateTo: z.string().optional().describe('Only insights created before this date'),
    basic: z.boolean().optional().describe('Metadata only — much faster, no query results'),
    refresh: z
      .string()
      .optional()
      .describe(
        'Recompute results while listing: force_cache, force_blocking, force_async, async, lazy_async, ...',
      ),
    order: z
      .string()
      .optional()
      .describe('Sort field with optional - prefix, e.g. "-last_modified_at" or "last_viewed_at"'),
    limit: z.number().int().min(1).optional().describe('Max insights per page'),
    offset: z.number().int().min(0).optional().describe('Rows to skip for pagination'),
  }),
  execute: async ({
    posthogCredentials,
    projectId,
    search,
    dashboards,
    insight,
    favorited,
    tags,
    dateFrom,
    dateTo,
    createdDateFrom,
    createdDateTo,
    basic,
    refresh,
    order,
    limit,
    offset,
  }) => {
    if (!projectId) return { error: 'projectId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/insights/`,
      {
        query: {
          search,
          dashboards: dashboards ? JSON.stringify(dashboards) : undefined,
          insight,
          favorited,
          tags: tags ? JSON.stringify(tags) : undefined,
          date_from: dateFrom,
          date_to: dateTo,
          created_date_from: createdDateFrom,
          created_date_to: createdDateTo,
          basic,
          refresh,
          order,
          limit,
          offset,
        },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogGetInsight = tool({
  description:
    'Gets one insight by id (numeric id or short_id) with its query definition and results. Pass refresh to recompute (e.g. "blocking" waits for fresh numbers) — use this to read a chart’s latest data. Needs insight:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    insightId: z
      .union([z.number().int(), z.string().min(1)])
      .describe('Insight numeric id or short_id (e.g. "AbCdEf12")'),
    refresh: z
      .string()
      .optional()
      .describe('Recompute mode: blocking, force_blocking, force_cache, async, lazy_async, ...'),
    fromDashboard: z.coerce
      .number()
      .int()
      .optional()
      .describe('Read the insight in the context of this dashboard (applies its filters)'),
  }),
  execute: async ({ posthogCredentials, projectId, insightId, refresh, fromDashboard }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!insightId) return { error: 'insightId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/insights/${encodeURIComponent(insightId)}/`,
      { query: { refresh, from_dashboard: fromDashboard } },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogCreateInsight = tool({
  description:
    'Creates a saved insight (chart). Pass name plus either query (new query API — e.g. {"kind":"InsightVizNode","source":{"kind":"TrendsQuery","series":[{"event":"$pageview","math":"total"}]}}) or filters (legacy trends filters); optionally attach it to dashboards by id and add tags/description. Needs insight:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    name: z.string().min(1).describe('Insight title, e.g. "Weekly signups"'),
    query: z
      .record(z.any())
      .optional()
      .describe(
        'Query definition (InsightVizNode / TrendsQuery / FunnelsQuery / HogQLQuery / ...)',
      ),
    filters: z
      .record(z.any())
      .optional()
      .describe(
        'Legacy filters object ({events, date_from, interval, ...}) — used when query is omitted',
      ),
    description: z.string().optional().describe('Longer explanation shown on the insight'),
    tags: z.array(z.string()).optional().describe('Tags to apply'),
    dashboards: z
      .array(z.coerce.number().int())
      .optional()
      .describe('Dashboard ids to attach the new insight to'),
  }),
  execute: async ({
    posthogCredentials,
    projectId,
    name,
    query,
    filters,
    description,
    tags,
    dashboards,
  }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!name) return { error: 'name is required.' };
    if (!query && !filters) {
      return { error: 'Provide query or filters so the insight knows what to chart.' };
    }

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/insights/`,
      {
        method: 'POST',
        body: { name, query, filters, description, tags, dashboards },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogUpdateInsight = tool({
  description:
    'Updates an existing insight — rename it, edit its query or filters, change description/tags, reattach it to dashboards, or favorite it. Send only the fields to change. Needs insight:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    insightId: z
      .union([z.number().int(), z.string().min(1)])
      .describe('Insight numeric id or short_id'),
    name: z.string().optional().describe('New title'),
    description: z.string().optional().describe('New description'),
    query: z.record(z.any()).optional().describe('Replacement query definition'),
    filters: z.record(z.any()).optional().describe('Replacement legacy filters object'),
    tags: z.array(z.string()).optional().describe('Replacement tag list'),
    dashboards: z
      .array(z.coerce.number().int())
      .optional()
      .describe('Replacement list of dashboard ids the insight belongs to'),
    favorited: z.boolean().optional().describe('Mark the insight as a favorite'),
  }),
  execute: async ({
    posthogCredentials,
    projectId,
    insightId,
    name,
    description,
    query,
    filters,
    tags,
    dashboards,
    favorited,
  }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!insightId) return { error: 'insightId is required.' };
    if (
      name === undefined &&
      description === undefined &&
      query === undefined &&
      filters === undefined &&
      tags === undefined &&
      dashboards === undefined &&
      favorited === undefined
    ) {
      return {
        error:
          'Provide at least one field to update (name, description, query, filters, tags, dashboards, favorited).',
      };
    }

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/insights/${encodeURIComponent(insightId)}/`,
      {
        method: 'PATCH',
        body: { name, description, query, filters, tags, dashboards, favorited },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogDeleteInsight = tool({
  description:
    'Deletes an insight permanently from the project (dashboards that show it lose the tile). Confirm with the user first. Needs insight:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    insightId: z
      .union([z.number().int(), z.string().min(1)])
      .describe('Insight numeric id or short_id to delete'),
  }),
  execute: async ({ posthogCredentials, projectId, insightId }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!insightId) return { error: 'insightId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/insights/${encodeURIComponent(insightId)}/`,
      { method: 'DELETE' },
    );
    if (result.error) return result;

    return { deleted: true, status: result.status, data: result.data ?? null };
  },
});
