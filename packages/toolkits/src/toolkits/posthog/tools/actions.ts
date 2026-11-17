// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { posthogRequest } from './client.js';

export const posthogListActions = tool({
  description:
    'Lists event actions (renamed event groups) in a project — name, definition, tags, and how many insights use them. Filter by name, definition text, tags, or usage count. Needs action:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    search: z.string().optional().describe('Search action name and description'),
    id: z.coerce.number().int().optional().describe('Only this action id'),
    ids: z.array(z.coerce.number().int()).optional().describe('Specific action ids (comma-joined)'),
    tags: z
      .array(z.string())
      .optional()
      .describe('Actions carrying any of these tags (JSON-encoded)'),
    limit: z.number().int().min(1).optional().describe('Max actions per page'),
    offset: z.number().int().min(0).optional().describe('Rows to skip for pagination'),
  }),
  execute: async ({ posthogCredentials, projectId, search, id, ids, tags, limit, offset }) => {
    if (!projectId) return { error: 'projectId is required.' };

    const result = await posthogRequest(posthogCredentials, `/api/projects/${projectId}/actions/`, {
      query: {
        search,
        id,
        ids,
        tags: tags ? JSON.stringify(tags) : undefined,
        limit,
        offset,
      },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogGetAction = tool({
  description:
    'Gets one event action by id with its full definition — the underlying events, property filters, and description. Use it before updating or when an insight references an action id. Needs action:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    actionId: z.coerce.number().int().describe('Action id (from posthogListActions)'),
  }),
  execute: async ({ posthogCredentials, projectId, actionId }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!actionId) return { error: 'actionId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/actions/${actionId}/`,
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogCreateAction = tool({
  description:
    'Creates an event action — a named, reusable definition of events (e.g. "Completed checkout" = "checkout complete" or "checkout started"). name and steps are required; each step matches an event, optionally narrowed by property filters. Needs action:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    name: z.string().min(1).describe('Action name, e.g. "Completed checkout"'),
    steps: z
      .array(z.record(z.any()))
      .min(1)
      .describe(
        'Event steps — e.g. [{"id":"0","type":"events","key":"checkout complete","event":"checkout complete"}]; add properties for filters',
      ),
    description: z.string().optional().describe('What this action captures'),
    tags: z.array(z.string()).optional().describe('Tags to apply'),
  }),
  execute: async ({ posthogCredentials, projectId, name, steps, description, tags }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!name) return { error: 'name is required.' };
    if (!steps || !steps.length) return { error: 'steps is required (at least one step).' };

    const result = await posthogRequest(posthogCredentials, `/api/projects/${projectId}/actions/`, {
      method: 'POST',
      body: { name, steps, description, tags },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogDeleteAction = tool({
  description:
    'Deletes an event action. Insights that chart it will break — confirm with the user first; to change what it matches prefer editing it in the app. Needs action:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    actionId: z.coerce.number().int().describe('Action id to delete'),
  }),
  execute: async ({ posthogCredentials, projectId, actionId }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!actionId) return { error: 'actionId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/actions/${actionId}/`,
      { method: 'DELETE' },
    );
    if (result.error) return result;

    return { deleted: true, status: result.status, data: result.data ?? null };
  },
});
