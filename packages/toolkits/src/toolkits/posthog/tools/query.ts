// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { posthogRequest } from './client.js';

export const posthogRunQuery = tool({
  description:
    'Runs an analytics query against a project. Pass a query object whose kind selects the query type: TrendsQuery, FunnelsQuery, RetentionQuery, LifecycleQuery, PathsQuery, StickinessQuery, EventsQuery (raw event rows), SessionsQuery, ActorsQuery, GroupsQuery, HogQLQuery (SQL, {"query":"SELECT ..."}), InsightVizNode, or DataTableNode. For slow queries pass async: true and poll posthogGetQuery with the returned id. Needs query:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    query: z
      .record(z.any())
      .describe(
        'Query definition with a kind, e.g. {"kind":"EventsQuery","select":["timestamp","event"],"limit":10} or {"kind":"HogQLQuery","query":"SELECT count() FROM events"}',
      ),
    name: z.string().optional().describe('Optional label for the query (shown while it runs)'),
    async: z
      .boolean()
      .optional()
      .describe(
        'Run in the background and return an id to poll with posthogGetQuery instead of blocking',
      ),
    clientQueryId: z
      .string()
      .optional()
      .describe('Client-generated id to deduplicate/reuse a cached query run'),
    filtersOverride: z
      .record(z.any())
      .optional()
      .describe(
        'Override dashboard-style filters for this run (date_from, interval, properties, ...)',
      ),
  }),
  execute: async ({
    posthogCredentials,
    projectId,
    query,
    name,
    async,
    clientQueryId,
    filtersOverride,
  }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!query || typeof query !== 'object') return { error: 'query is required.' };
    if (!query.kind) {
      return { error: 'query.kind is required (e.g. "TrendsQuery", "EventsQuery", "HogQLQuery").' };
    }

    const result = await posthogRequest(posthogCredentials, `/api/projects/${projectId}/query/`, {
      method: 'POST',
      body: {
        query,
        name,
        async,
        client_query_id: clientQueryId,
        filters_override: filtersOverride,
      },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogGetQuery = tool({
  description:
    'Gets the status and results of a query started with posthogRunQuery (async: true) by its id — returns the run state (running, done, failed) and, once done, the result rows. Also re-fetches any saved query run. Needs query:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    queryId: z
      .string()
      .min(1)
      .describe('Query run id returned by posthogRunQuery (often under query_status.id)'),
  }),
  execute: async ({ posthogCredentials, projectId, queryId }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!queryId) return { error: 'queryId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/query/${encodeURIComponent(queryId)}/`,
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
