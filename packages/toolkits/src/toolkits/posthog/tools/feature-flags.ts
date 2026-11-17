// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { posthogRequest } from './client.js';

export const posthogListFeatureFlags = tool({
  description:
    'Lists feature flags in a project — key, name, active state, rollout filters, variants, tags, and type (boolean, experiment, multivariant, remote config). Filter by exact key, text search, active/archived state, ids, or tags. Needs feature_flag:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    key: z.string().optional().describe('Exact flag key match (case insensitive)'),
    search: z.string().optional().describe('Search flag key or name'),
    active: z
      .string()
      .optional()
      .describe('Serving state filter: "true", "false", or "STALE" (enabled but stale)'),
    archived: z
      .boolean()
      .optional()
      .describe('true = only archived, false = only not archived (default omits archived)'),
    deleted: z.boolean().optional().describe('true = only soft-deleted flags (restorable)'),
    ids: z
      .array(z.coerce.number().int())
      .optional()
      .describe('Specific flag ids (max 200, comma-joined)'),
    tags: z
      .array(z.string())
      .optional()
      .describe('Flags carrying any of these tags (JSON-encoded)'),
    type: z
      .enum(['boolean', 'experiment', 'multivariant', 'remote_config'])
      .optional()
      .describe('Restrict to one flag type'),
    evaluationRuntime: z
      .enum(['all', 'client', 'server'])
      .optional()
      .describe('Only flags evaluated on the client, server, or both'),
    limit: z.number().int().min(1).optional().describe('Max flags per page'),
    offset: z.number().int().min(0).optional().describe('Rows to skip for pagination'),
  }),
  execute: async ({
    posthogCredentials,
    projectId,
    key,
    search,
    active,
    archived,
    deleted,
    ids,
    tags,
    type,
    evaluationRuntime,
    limit,
    offset,
  }) => {
    if (!projectId) return { error: 'projectId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/feature_flags/`,
      {
        query: {
          key,
          search,
          active,
          archived,
          deleted,
          ids,
          tags: tags ? JSON.stringify(tags) : undefined,
          type,
          evaluation_runtime: evaluationRuntime,
          limit,
          offset,
        },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogCreateFeatureFlag = tool({
  description:
    'Creates a feature flag. key is the flag key checked in code; filters define targeting — groups of person properties with a rollout percentage, or multivariate variants with payloads. If filters is omitted the flag defaults to 100% rollout for everyone when active. Needs feature_flag:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    key: z.string().min(1).describe('Flag key used in code, e.g. "new-checkout-flow"'),
    name: z.string().optional().describe('Human-readable flag name'),
    filters: z
      .record(z.any())
      .optional()
      .describe(
        'Targeting filters — {"groups":[{"properties":[{"key":"plan","value":"pro","operator":"exact","type":"person"}],"rollout_percentage":50}]} or {"multivariate":{"variants":[{"name":"control","rollout_percentage":50},{"name":"test","rollout_percentage":50}]}}',
      ),
    active: z.boolean().optional().describe('Whether the flag serves (default true)'),
    archived: z.boolean().optional().describe('Create it pre-archived'),
    tags: z.array(z.string()).optional().describe('Tags to apply'),
    payloads: z
      .record(z.any())
      .optional()
      .describe('Variant payloads keyed by variant name, e.g. {"test":{"css":"..."}}'),
    aggregationGroupTypeIndex: z.coerce
      .number()
      .int()
      .optional()
      .describe('Roll out by group (e.g. organizations) instead of persons — group type index'),
    ensureExperienceContinuity: z
      .boolean()
      .optional()
      .describe('Keep the same variant for a user across sessions (server-side flags)'),
  }),
  execute: async ({
    posthogCredentials,
    projectId,
    key,
    name,
    filters,
    active,
    archived,
    tags,
    payloads,
    aggregationGroupTypeIndex,
    ensureExperienceContinuity,
  }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!key) return { error: 'key is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/feature_flags/`,
      {
        method: 'POST',
        body: {
          key,
          name,
          filters: filters ?? { groups: [{ properties: [], rollout_percentage: 100 }] },
          active,
          archived,
          tags,
          payloads,
          aggregation_group_type_index: aggregationGroupTypeIndex,
          ensure_experience_continuity: ensureExperienceContinuity,
        },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogUpdateFeatureFlag = tool({
  description:
    'Updates a feature flag — rename its key, edit targeting filters/rollouts, enable or disable it (active true/false), archive or unarchive it (archived), or change tags and payloads. Send only the fields to change. Needs feature_flag:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    flagId: z.coerce.number().int().describe('Feature flag id (from posthogListFeatureFlags)'),
    key: z.string().optional().describe('New flag key (renames the flag)'),
    name: z.string().optional().describe('New display name'),
    filters: z.record(z.any()).optional().describe('Replacement targeting filters'),
    active: z.boolean().optional().describe('true = enable serving, false = disable'),
    archived: z.boolean().optional().describe('true = archive, false = unarchive'),
    tags: z.array(z.string()).optional().describe('Replacement tag list'),
    payloads: z.record(z.any()).optional().describe('Replacement variant payloads'),
  }),
  execute: async ({
    posthogCredentials,
    projectId,
    flagId,
    key,
    name,
    filters,
    active,
    archived,
    tags,
    payloads,
  }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!flagId) return { error: 'flagId is required.' };
    if (
      key === undefined &&
      name === undefined &&
      filters === undefined &&
      active === undefined &&
      archived === undefined &&
      tags === undefined &&
      payloads === undefined
    ) {
      return {
        error:
          'Provide at least one field to update (key, name, filters, active, archived, tags, payloads).',
      };
    }

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/feature_flags/${flagId}/`,
      { method: 'PATCH', body: { key, name, filters, active, archived, tags, payloads } },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogDeleteFeatureFlag = tool({
  description:
    'Deletes a feature flag permanently — code checking it will start falling back to the default. Confirm with the user first; to hide it without breaking code prefer posthogUpdateFeatureFlag with archived: true. Needs feature_flag:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    flagId: z.coerce.number().int().describe('Feature flag id to delete'),
  }),
  execute: async ({ posthogCredentials, projectId, flagId }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!flagId) return { error: 'flagId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/feature_flags/${flagId}/`,
      { method: 'DELETE' },
    );
    if (result.error) return result;

    return { deleted: true, status: result.status, data: result.data ?? null };
  },
});

export const posthogTestFeatureFlag = tool({
  description:
    'Evaluates a feature flag for one distinct id (or person) and returns the value/variant that user would get, with the matching rationale — use it to verify targeting before rolling out. Needs feature_flag:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    flagId: z.coerce.number().int().describe('Feature flag id to evaluate'),
    distinctId: z.string().min(1).describe('Distinct id to evaluate for, e.g. "user-123"'),
    personId: z.string().optional().describe('Person uuid to evaluate for instead of distinct id'),
    groups: z
      .record(z.any())
      .optional()
      .describe('Group context for group-targeted flags, e.g. {"organization": "acme"}'),
    timestamp: z.string().optional().describe('Evaluate as of this ISO timestamp (backdated test)'),
  }),
  execute: async ({
    posthogCredentials,
    projectId,
    flagId,
    distinctId,
    personId,
    groups,
    timestamp,
  }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!flagId) return { error: 'flagId is required.' };
    if (!distinctId) return { error: 'distinctId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/feature_flags/${flagId}/test_evaluation/`,
      {
        method: 'POST',
        body: { distinct_id: distinctId, person_id: personId, groups, timestamp },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
