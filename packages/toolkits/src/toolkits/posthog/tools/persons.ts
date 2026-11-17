// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { posthogRequest } from './client.js';

export const posthogListPersons = tool({
  description:
    'Lists persons (users) in a project — search by email, name, person id, or distinct id, or filter by person properties. Each row includes the uuid (used for cohort membership) and distinct ids. Needs person:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    search: z
      .string()
      .optional()
      .describe(
        'Free-text search across email, name, person id, and distinct id (partial matches)',
      ),
    email: z.string().optional().describe('Exact email match'),
    distinctId: z.string().optional().describe('Only the person with this distinct id'),
    properties: z
      .record(z.any())
      .optional()
      .describe(
        'Property filter, e.g. {"type":"AND","values":[{"key":"plan","value":"pro","operator":"exact","type":"person"}]}',
      ),
    includeMatchedFields: z
      .boolean()
      .optional()
      .describe('Tag each search hit with the fields the term was found in'),
    limit: z.number().int().min(1).optional().describe('Max persons per page'),
    offset: z.number().int().min(0).optional().describe('Rows to skip for pagination'),
  }),
  execute: async ({
    posthogCredentials,
    projectId,
    search,
    email,
    distinctId,
    properties,
    includeMatchedFields,
    limit,
    offset,
  }) => {
    if (!projectId) return { error: 'projectId is required.' };

    const result = await posthogRequest(posthogCredentials, `/api/projects/${projectId}/persons/`, {
      query: {
        search,
        email,
        distinct_id: distinctId,
        properties,
        include_matched_fields: includeMatchedFields,
        limit,
        offset,
      },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogUpdatePerson = tool({
  description:
    'Updates a person — rename them, merge in additional distinct ids, or replace their properties object. For changing a single property without touching the rest, prefer posthogUpdatePersonProperty. Needs person:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    personId: z.coerce.number().int().describe('Numeric person id (from posthogListPersons)'),
    name: z.string().optional().describe('New display name for the person'),
    properties: z
      .record(z.any())
      .optional()
      .describe(
        'Full replacement of the person properties object, e.g. {"plan":"pro","role":"admin"}',
      ),
    distinctIds: z
      .array(z.string())
      .optional()
      .describe('Complete list of distinct ids belonging to this person (merges identities)'),
  }),
  execute: async ({ posthogCredentials, projectId, personId, name, properties, distinctIds }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!personId) return { error: 'personId is required.' };
    if (name === undefined && properties === undefined && distinctIds === undefined) {
      return { error: 'Provide at least one field to update: name, properties, or distinctIds.' };
    }

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/persons/${personId}/`,
      {
        method: 'PATCH',
        body: { name, properties, distinct_ids: distinctIds },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogDeletePerson = tool({
  description:
    'Deletes a person and all their events and properties from the project. Permanent and irreversible — confirm with the user before calling (use for GDPR/CCPA deletion requests). Needs person:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    personId: z.coerce.number().int().describe('Numeric person id to delete'),
  }),
  execute: async ({ posthogCredentials, projectId, personId }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!personId) return { error: 'personId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/persons/${personId}/`,
      { method: 'DELETE' },
    );
    if (result.error) return result;

    return { deleted: true, status: result.status, data: result.data ?? null };
  },
});

export const posthogUpdatePersonProperty = tool({
  description:
    'Sets one person property to a value without replacing their other properties — e.g. mark a user as {"key":"is_trial","value":true}. Pass value null to clear it. Needs person:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    personId: z.coerce.number().int().describe('Numeric person id'),
    key: z.string().min(1).describe('Property name to set, e.g. "plan"'),
    value: z.any().describe('New value (string, number, boolean, or null to clear)'),
  }),
  execute: async ({ posthogCredentials, projectId, personId, key, value }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!personId) return { error: 'personId is required.' };
    if (!key) return { error: 'key is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/persons/${personId}/update_property/`,
      { method: 'POST', body: { key, value: value === undefined ? null : value } },
    );
    if (result.error) return result;

    return result.data ?? { updated: true };
  },
});
