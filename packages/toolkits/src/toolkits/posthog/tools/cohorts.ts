// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { posthogRequest } from './client.js';

export const posthogListCohorts = tool({
  description:
    'Lists cohorts in a project — dynamic (auto-updating) and static (fixed member list) — with their filters, member counts, and calculation status. Filter by name search, type, or creator. Needs cohort:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    search: z.string().optional().describe('Case-insensitive substring match on cohort name'),
    type: z.enum(['dynamic', 'static']).optional().describe('Only dynamic or only static cohorts'),
    basic: z
      .boolean()
      .optional()
      .describe('Lightweight payload (omits query/groups/errors) — faster'),
    createdBy: z.coerce.number().int().optional().describe('Only cohorts created by this user id'),
    hideBehavioral: z
      .boolean()
      .optional()
      .describe('Exclude behavioral (event-based) cohorts — those cannot back feature flags'),
    limit: z.number().int().min(1).optional().describe('Max cohorts per page'),
    offset: z.number().int().min(0).optional().describe('Rows to skip for pagination'),
  }),
  execute: async ({
    posthogCredentials,
    projectId,
    search,
    type,
    basic,
    createdBy,
    hideBehavioral,
    limit,
    offset,
  }) => {
    if (!projectId) return { error: 'projectId is required.' };

    const result = await posthogRequest(posthogCredentials, `/api/projects/${projectId}/cohorts/`, {
      query: {
        search,
        type,
        basic,
        created_by_id: createdBy,
        hide_behavioral_cohorts: hideBehavioral,
        limit,
        offset,
      },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogGetCohort = tool({
  description:
    'Gets one cohort by id with its filter definition, current member count, calculation status, and last error if recalculation failed. Needs cohort:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    cohortId: z.coerce.number().int().describe('Cohort id (from posthogListCohorts)'),
  }),
  execute: async ({ posthogCredentials, projectId, cohortId }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!cohortId) return { error: 'cohortId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/cohorts/${cohortId}/`,
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogCreateCohort = tool({
  description:
    'Creates a cohort. For a dynamic cohort pass filters like {"properties":{"type":"OR","values":[{"key":"plan","value":"pro","operator":"exact","type":"person"}]}}; for a fixed audience set isStatic: true and add members afterwards with posthogAddCohortPersons. Needs cohort:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    name: z.string().min(1).describe('Cohort name, e.g. "Pro plan users"'),
    filters: z
      .record(z.any())
      .optional()
      .describe(
        'Dynamic cohort filter — {"properties":{"type":"AND","values":[...person/event conditions...]},"filter_test_accounts":true}',
      ),
    isStatic: z
      .boolean()
      .optional()
      .describe('Create an empty static cohort (members added explicitly later)'),
    description: z.string().optional().describe('What this audience represents'),
  }),
  execute: async ({ posthogCredentials, projectId, name, filters, isStatic, description }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!name) return { error: 'name is required.' };
    if (!filters && !isStatic) {
      return { error: 'Provide filters (dynamic cohort) or isStatic: true (fixed cohort).' };
    }

    const result = await posthogRequest(posthogCredentials, `/api/projects/${projectId}/cohorts/`, {
      method: 'POST',
      body: { name, filters, is_static: isStatic, description },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogDeleteCohort = tool({
  description:
    'Deletes a cohort. Feature flags, experiments, or insights referencing it will lose that segment — confirm with the user first. Needs cohort:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    cohortId: z.coerce.number().int().describe('Cohort id to delete'),
  }),
  execute: async ({ posthogCredentials, projectId, cohortId }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!cohortId) return { error: 'cohortId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/cohorts/${cohortId}/`,
      { method: 'DELETE' },
    );
    if (result.error) return result;

    return { deleted: true, status: result.status, data: result.data ?? null };
  },
});

export const posthogListCohortPersons = tool({
  description:
    'Lists the persons currently in a cohort, paged — each row has the person uuid and properties. Use it to see who matches a segment or to collect uuids for posthogAddCohortPersons. Needs cohort:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    cohortId: z.coerce.number().int().describe('Cohort id whose members to list'),
    limit: z.number().int().min(1).optional().describe('Max members per page'),
    offset: z.number().int().min(0).optional().describe('Rows to skip for pagination'),
  }),
  execute: async ({ posthogCredentials, projectId, cohortId, limit, offset }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!cohortId) return { error: 'cohortId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/cohorts/${cohortId}/persons/`,
      { query: { limit, offset } },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogAddCohortPersons = tool({
  description:
    'Adds persons to a STATIC cohort by their person UUIDs (the uuid field from posthogListPersons — not the numeric id). Dynamic cohorts update themselves from their filters and cannot take manual members. Needs cohort:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    cohortId: z.coerce.number().int().describe('Static cohort id to add members to'),
    personIds: z
      .array(z.string().min(1))
      .min(1)
      .describe('Person UUIDs to add, e.g. ["095be615-a8ad-4c33-8e9c-c7612fbf6c9f"]'),
  }),
  execute: async ({ posthogCredentials, projectId, cohortId, personIds }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!cohortId) return { error: 'cohortId is required.' };
    if (!personIds || !personIds.length)
      return { error: 'personIds is required (at least one person uuid).' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/cohorts/${cohortId}/add_persons_to_static_cohort/`,
      { method: 'PATCH', body: { person_ids: personIds } },
    );
    if (result.error) return result;

    return result.data ?? { added: personIds.length, status: result.status };
  },
});
