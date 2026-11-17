// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { posthogRequest } from './client.js';

export const posthogListEvents = tool({
  description:
    'Lists raw events captured in a project, newest first — filter by event name (e.g. "user sign up", "$pageview"), time range, distinct id, person id, or property filters, and optionally embed the person on each row. Use select/where for HogQL expressions. Needs query:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    event: z
      .string()
      .optional()
      .describe('Only this event name, e.g. "user sign up" or "$pageview"'),
    after: z
      .string()
      .optional()
      .describe(
        'Only events timestamped after this time (ISO 8601 or relative); default now - 24 hours',
      ),
    before: z
      .string()
      .optional()
      .describe(
        'Only events timestamped before this time (ISO 8601 or relative); default now + 5 seconds',
      ),
    distinctId: z.string().optional().describe('Only events sent by this distinct id'),
    personId: z.coerce
      .number()
      .int()
      .optional()
      .describe('Only events belonging to this person id'),
    properties: z
      .record(z.any())
      .optional()
      .describe(
        'Property filter, e.g. {"type":"AND","values":[{"key":"plan","value":"pro","operator":"exact","type":"event"}]}',
      ),
    includePerson: z
      .boolean()
      .optional()
      .describe('Embed person details on each event row (default false)'),
    select: z
      .array(z.string())
      .optional()
      .describe(
        'HogQL expressions to return as columns, e.g. ["timestamp", "event", "properties.$current_url"] (JSON-encoded)',
      ),
    where: z
      .array(z.string())
      .optional()
      .describe(
        'HogQL conditions every row must pass, e.g. ["properties.$current_url LIKE \'%pricing%\'"] (JSON-encoded)',
      ),
    limit: z.number().int().min(1).optional().describe('Max events to return (default 100)'),
    offset: z.number().int().min(0).optional().describe('Rows to skip for pagination'),
  }),
  execute: async ({
    posthogCredentials,
    projectId,
    event,
    after,
    before,
    distinctId,
    personId,
    properties,
    includePerson,
    select,
    where,
    limit,
    offset,
  }) => {
    if (!projectId) return { error: 'projectId is required.' };

    const result = await posthogRequest(posthogCredentials, `/api/projects/${projectId}/events/`, {
      query: {
        event,
        after,
        before,
        distinct_id: distinctId,
        person_id: personId,
        properties,
        include_person: includePerson,
        select: select ? JSON.stringify(select) : undefined,
        where: where ? JSON.stringify(where) : undefined,
        limit,
        offset,
      },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogGetEventValues = tool({
  description:
    'Lists the distinct values seen for an event or person property, with usage counts — use it to discover valid property values (countries, URLs, plan names) before building filters, queries, or cohorts. Needs query:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    key: z.string().describe('Property name to list values for, e.g. "$current_url" or "plan"'),
    value: z.string().optional().describe('Only values containing this text'),
    eventName: z
      .array(z.string())
      .optional()
      .describe('Restrict to values seen on these event names, e.g. ["$pageview"]'),
    isColumn: z
      .boolean()
      .optional()
      .describe('Treat the key as a raw column (HogQL) instead of a property'),
  }),
  execute: async ({ posthogCredentials, projectId, key, value, eventName, isColumn }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!key) return { error: 'key is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/events/values/`,
      {
        query: { key, value, event_name: eventName, is_column: isColumn },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
