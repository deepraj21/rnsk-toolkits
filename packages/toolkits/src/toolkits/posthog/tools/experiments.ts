// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { posthogRequest } from './client.js';

export const posthogListExperiments = tool({
  description:
    'Lists experiments in a project — name, status (draft, running, paused, complete), linked feature flag, and metrics. Filter by text search, status, feature flag, tags, or creator. Needs experiment:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    search: z
      .string()
      .optional()
      .describe('Free-text search on experiment name and feature flag key'),
    status: z
      .enum(['all', 'draft', 'running', 'paused', 'exposure_frozen', 'complete', 'stopped'])
      .optional()
      .describe('Filter by lifecycle status'),
    archived: z.boolean().optional().describe('Include archived experiments'),
    featureFlagId: z.coerce
      .number()
      .int()
      .optional()
      .describe('Only experiments linked to this flag id'),
    featureFlagIds: z
      .array(z.coerce.number().int())
      .optional()
      .describe('Only experiments linked to any of these flag ids (max 200, comma-joined)'),
    tags: z
      .array(z.string())
      .optional()
      .describe('Experiments carrying any of these tags (JSON-encoded)'),
    limit: z.number().int().min(1).optional().describe('Max experiments per page'),
    offset: z.number().int().min(0).optional().describe('Rows to skip for pagination'),
    order: z
      .string()
      .optional()
      .describe('Sort field with optional - prefix, e.g. "-created_at" or "name"'),
  }),
  execute: async ({
    posthogCredentials,
    projectId,
    search,
    status,
    archived,
    featureFlagId,
    featureFlagIds,
    tags,
    limit,
    offset,
    order,
  }) => {
    if (!projectId) return { error: 'projectId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/experiments/`,
      {
        query: {
          search,
          status,
          archived,
          feature_flag_id: featureFlagId,
          feature_flag_ids: featureFlagIds,
          tags: tags ? JSON.stringify(tags) : undefined,
          limit,
          offset,
          order,
        },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogGetExperiment = tool({
  description:
    'Gets one experiment by id with its full definition — variants, feature flag linkage, parameters, dates, status, and computed results. Use it to read experiment performance. Needs experiment:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    experimentId: z.coerce.number().int().describe('Experiment id (from posthogListExperiments)'),
  }),
  execute: async ({ posthogCredentials, projectId, experimentId }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!experimentId) return { error: 'experimentId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/experiments/${experimentId}/`,
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogCreateExperiment = tool({
  description:
    'Creates an experiment together with its linked feature flag — name and featureFlagKey are required. Define variants via featureFlag.filters (multivariate variants with rollout percentages) and statistical parameters via parameters like {"minimum_detectable_effect":5}. Needs experiment:write (and feature_flag:write for the flag).',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    name: z.string().min(1).describe('Experiment name, e.g. "New checkout flow"'),
    featureFlagKey: z
      .string()
      .min(1)
      .describe('Key for the feature flag created alongside the experiment, e.g. "checkout-v2"'),
    description: z.string().optional().describe('Hypothesis / background for the team'),
    featureFlag: z
      .record(z.any())
      .optional()
      .describe(
        'Flag definition controlling variants, e.g. {"filters":{"multivariate":{"variants":[{"name":"control","rollout_percentage":50},{"name":"test","rollout_percentage":50}]}}}',
      ),
    parameters: z
      .record(z.any())
      .optional()
      .describe('Statistical parameters, e.g. {"minimum_detectable_effect":5}'),
    secondaryMetrics: z
      .array(z.record(z.any()))
      .optional()
      .describe('Additional metric definitions to track'),
  }),
  execute: async ({
    posthogCredentials,
    projectId,
    name,
    featureFlagKey,
    description,
    featureFlag,
    parameters,
    secondaryMetrics,
  }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!name) return { error: 'name is required.' };
    if (!featureFlagKey) return { error: 'featureFlagKey is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/experiments/`,
      {
        method: 'POST',
        body: {
          name,
          feature_flag_key: featureFlagKey,
          description,
          feature_flag: featureFlag,
          parameters,
          secondary_metrics: secondaryMetrics,
        },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogDeleteExperiment = tool({
  description:
    'Deletes an experiment permanently; its feature flag is left behind (delete it separately if unwanted). Confirm with the user first. Needs experiment:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    experimentId: z.coerce.number().int().describe('Experiment id to delete'),
  }),
  execute: async ({ posthogCredentials, projectId, experimentId }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!experimentId) return { error: 'experimentId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/experiments/${experimentId}/`,
      { method: 'DELETE' },
    );
    if (result.error) return result;

    return { deleted: true, status: result.status, data: result.data ?? null };
  },
});

export const posthogChangeExperimentStatus = tool({
  description:
    'Changes an experiment’s lifecycle: launch (start collecting exposure), pause, resume, or end. When ending, optionally record a conclusion (won, lost, inconclusive, stopped_early, invalid) and a comment. Needs experiment:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    experimentId: z.coerce.number().int().describe('Experiment id to act on'),
    action: z
      .enum(['launch', 'pause', 'resume', 'end'])
      .describe(
        'launch = start, pause = halt collection, resume = continue, end = finish the experiment',
      ),
    conclusion: z
      .enum(['won', 'lost', 'inconclusive', 'stopped_early', 'invalid'])
      .optional()
      .describe('Outcome recorded when action=end'),
    conclusionComment: z.string().optional().describe('Team note recorded when action=end'),
  }),
  execute: async ({
    posthogCredentials,
    projectId,
    experimentId,
    action,
    conclusion,
    conclusionComment,
  }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!experimentId) return { error: 'experimentId is required.' };
    if (!action) return { error: 'action is required (launch, pause, resume, or end).' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/experiments/${experimentId}/${action}/`,
      {
        method: 'POST',
        body: action === 'end' ? { conclusion, conclusion_comment: conclusionComment } : undefined,
      },
    );
    if (result.error) return result;

    return result.data ?? { status: result.status, action };
  },
});
