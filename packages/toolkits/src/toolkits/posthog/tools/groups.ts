// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { posthogRequest } from './client.js';

export const posthogListGroupTypes = tool({
  description:
    'Lists the group types defined for a project — e.g. organization, company, project — with their group type indexes. Run this first: the index is required by posthogListGroups and posthogGetGroup. Needs group:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
  }),
  execute: async ({ posthogCredentials, projectId }) => {
    if (!projectId) return { error: 'projectId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/group_types/`,
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogListGroups = tool({
  description:
    'Lists the entities of one group type in a project (e.g. every organization), paged — key, group name, and properties aggregated from events. Requires the groupTypeIndex from posthogListGroupTypes. Needs group:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    groupTypeIndex: z.coerce
      .number()
      .int()
      .describe('Group type index (from posthogListGroupTypes)'),
    limit: z.number().int().min(1).optional().describe('Max groups per page'),
    offset: z.number().int().min(0).optional().describe('Rows to skip for pagination'),
    search: z.string().optional().describe('Search group key or name'),
  }),
  execute: async ({ posthogCredentials, projectId, groupTypeIndex, limit, offset, search }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (groupTypeIndex === undefined || groupTypeIndex === null) {
      return { error: 'groupTypeIndex is required (from posthogListGroupTypes).' };
    }

    const result = await posthogRequest(posthogCredentials, `/api/projects/${projectId}/groups/`, {
      query: { group_type_index: groupTypeIndex, limit, offset, search },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogGetGroup = tool({
  description:
    'Gets one group by its key within a group type — aggregated properties, group stats, and the persons/events associated with it. Requires both groupKey and groupTypeIndex. Needs group:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    groupKey: z.string().min(1).describe('Group key, e.g. the organization id "acme"'),
    groupTypeIndex: z.coerce
      .number()
      .int()
      .describe('Group type index (from posthogListGroupTypes)'),
  }),
  execute: async ({ posthogCredentials, projectId, groupKey, groupTypeIndex }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!groupKey) return { error: 'groupKey is required.' };
    if (groupTypeIndex === undefined || groupTypeIndex === null) {
      return { error: 'groupTypeIndex is required (from posthogListGroupTypes).' };
    }

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/groups/find/`,
      {
        query: { group_key: groupKey, group_type_index: groupTypeIndex },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
