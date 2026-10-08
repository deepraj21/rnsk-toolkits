// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { launchdarklyRequest, failedResult, toLaunchdarklyError } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const launchdarklyListFlags = tool({
  description: 'List feature flags in a project (GET /flags/{projectKey}).',
  inputSchema: z.object({
    launchdarklyApiToken: tokenField,
    projectKey: z.string().describe('Project key'),
    env: z.string().optional().describe('Environment key to include env-specific state'),
    limit: z.number().int().optional(),
    offset: z.number().int().optional(),
    filter: z.string().optional(),
    tag: z.string().optional().describe('Filter by tag'),
  }),
  execute: async ({ launchdarklyApiToken, projectKey, env, limit, offset, filter, tag }) => {
    try {
      const result = await launchdarklyRequest(
        launchdarklyApiToken,
        `/flags/${encodeURIComponent(projectKey)}`,
        { query: { env, limit, offset, filter, tag } },
      );
      if (!result.ok) return failedResult('Failed to list flags', result);
      return result.data;
    } catch (error) {
      return toLaunchdarklyError(error, 'Error listing flags');
    }
  },
});

export const launchdarklyGetFlag = tool({
  description: 'Get a feature flag (GET /flags/{projectKey}/{featureFlagKey}).',
  inputSchema: z.object({
    launchdarklyApiToken: tokenField,
    projectKey: z.string().describe('Project key'),
    featureFlagKey: z.string().describe('Feature flag key'),
    env: z.string().optional().describe('Environment key for env-specific evaluation'),
  }),
  execute: async ({ launchdarklyApiToken, projectKey, featureFlagKey, env }) => {
    try {
      const result = await launchdarklyRequest(
        launchdarklyApiToken,
        `/flags/${encodeURIComponent(projectKey)}/${encodeURIComponent(featureFlagKey)}`,
        { query: env ? { env } : undefined },
      );
      if (!result.ok) return failedResult('Failed to get flag', result);
      return result.data;
    } catch (error) {
      return toLaunchdarklyError(error, 'Error getting flag');
    }
  },
});

export const launchdarklyCreateFlag = tool({
  description: 'Create a feature flag (POST /flags/{projectKey}).',
  inputSchema: z.object({
    launchdarklyApiToken: tokenField,
    projectKey: z.string().describe('Project key'),
    key: z.string().describe('New flag key'),
    name: z.string().describe('Human-readable flag name'),
    description: z.string().optional(),
    variations: z
      .array(z.record(z.string(), z.any()))
      .optional()
      .describe('Flag variations (defaults to boolean if omitted)'),
    clientSideAvailability: z.record(z.string(), z.any()).optional(),
    temporary: z.boolean().optional(),
  }),
  execute: async ({
    launchdarklyApiToken,
    projectKey,
    key,
    name,
    description,
    variations,
    clientSideAvailability,
    temporary,
  }) => {
    try {
      const body: Record<string, unknown> = { key, name };
      if (description !== undefined) body.description = description;
      if (variations !== undefined) body.variations = variations;
      if (clientSideAvailability !== undefined) {
        body.clientSideAvailability = clientSideAvailability;
      }
      if (temporary !== undefined) body.temporary = temporary;
      const result = await launchdarklyRequest(
        launchdarklyApiToken,
        `/flags/${encodeURIComponent(projectKey)}`,
        { method: 'POST', body },
      );
      if (!result.ok) return failedResult('Failed to create flag', result);
      return result.data;
    } catch (error) {
      return toLaunchdarklyError(error, 'Error creating flag');
    }
  },
});

export const launchdarklyPatchFlag = tool({
  description:
    'Patch a feature flag with JSON Patch instructions (PATCH /flags/{projectKey}/{featureFlagKey}).',
  inputSchema: z.object({
    launchdarklyApiToken: tokenField,
    projectKey: z.string().describe('Project key'),
    featureFlagKey: z.string().describe('Feature flag key'),
    patch: z
      .array(z.record(z.string(), z.any()))
      .describe('JSON Patch array, e.g. [{op, path, value}]'),
    comment: z.string().optional().describe('Change comment for audit log'),
  }),
  execute: async ({ launchdarklyApiToken, projectKey, featureFlagKey, patch, comment }) => {
    try {
      const result = await launchdarklyRequest(
        launchdarklyApiToken,
        `/flags/${encodeURIComponent(projectKey)}/${encodeURIComponent(featureFlagKey)}`,
        {
          method: 'PATCH',
          body: { patch, ...(comment !== undefined ? { comment } : {}) },
        },
      );
      if (!result.ok) return failedResult('Failed to patch flag', result);
      return result.data;
    } catch (error) {
      return toLaunchdarklyError(error, 'Error patching flag');
    }
  },
});

export const launchdarklySetFlagEnvironment = tool({
  description:
    'Turn a flag on or off in an environment using semantic patch (PATCH flag with environment instruction).',
  inputSchema: z.object({
    launchdarklyApiToken: tokenField,
    projectKey: z.string().describe('Project key'),
    featureFlagKey: z.string().describe('Feature flag key'),
    environmentKey: z.string().describe('Environment key'),
    on: z.boolean().describe('Whether the flag is on in this environment'),
    comment: z.string().optional(),
  }),
  execute: async ({
    launchdarklyApiToken,
    projectKey,
    featureFlagKey,
    environmentKey,
    on,
    comment,
  }) => {
    try {
      const patch = [
        {
          op: 'replace',
          path: `/environments/${environmentKey}/on`,
          value: on,
        },
      ];
      const result = await launchdarklyRequest(
        launchdarklyApiToken,
        `/flags/${encodeURIComponent(projectKey)}/${encodeURIComponent(featureFlagKey)}`,
        {
          method: 'PATCH',
          body: { patch, ...(comment !== undefined ? { comment } : {}) },
        },
      );
      if (!result.ok) return failedResult('Failed to update flag environment', result);
      return result.data;
    } catch (error) {
      return toLaunchdarklyError(error, 'Error updating flag environment');
    }
  },
});

export const launchdarklyDeleteFlag = tool({
  description: 'Delete a feature flag (DELETE /flags/{projectKey}/{featureFlagKey}).',
  inputSchema: z.object({
    launchdarklyApiToken: tokenField,
    projectKey: z.string().describe('Project key'),
    featureFlagKey: z.string().describe('Feature flag key'),
  }),
  execute: async ({ launchdarklyApiToken, projectKey, featureFlagKey }) => {
    try {
      const result = await launchdarklyRequest(
        launchdarklyApiToken,
        `/flags/${encodeURIComponent(projectKey)}/${encodeURIComponent(featureFlagKey)}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete flag', result);
      return result.data ?? { deleted: true, featureFlagKey };
    } catch (error) {
      return toLaunchdarklyError(error, 'Error deleting flag');
    }
  },
});
