// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { circleCiRequest, failedResult, toCircleCiError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');
const slugField = z.string().describe('Project slug, e.g. gh/org/repo');

export const circleCiListPipelines = tool({
  description: 'List pipelines for a project with optional branch filter and pagination.',
  inputSchema: z.object({
    circleCiCredentials: credField,
    projectSlug: slugField,
    branch: z.string().optional().describe('Filter by branch name'),
    pageToken: z.string().optional().describe('next_page_token from prior response'),
  }),
  execute: async ({ circleCiCredentials, projectSlug, branch, pageToken }) => {
    try {
      const slug = encodeURIComponent(projectSlug);
      const result = await circleCiRequest(circleCiCredentials, `/project/${slug}/pipeline`, {
        query: { branch, 'page-token': pageToken },
      });
      if (!result.ok) return failedResult('Failed to list pipelines', result);
      return result.data;
    } catch (error) {
      return toCircleCiError(error, 'Error listing pipelines');
    }
  },
});

export const circleCiGetPipeline = tool({
  description: 'Get one pipeline by ID (GET /pipeline/{pipeline-id}).',
  inputSchema: z.object({
    circleCiCredentials: credField,
    pipelineId: z.string().describe('Pipeline ID'),
  }),
  execute: async ({ circleCiCredentials, pipelineId }) => {
    try {
      const result = await circleCiRequest(circleCiCredentials, `/pipeline/${pipelineId}`);
      if (!result.ok) return failedResult('Failed to get pipeline', result);
      return result.data;
    } catch (error) {
      return toCircleCiError(error, 'Error getting pipeline');
    }
  },
});

export const circleCiGetPipelineConfig = tool({
  description: 'Get compiled config for a pipeline (GET /pipeline/{pipeline-id}/config).',
  inputSchema: z.object({
    circleCiCredentials: credField,
    pipelineId: z.string().describe('Pipeline ID'),
  }),
  execute: async ({ circleCiCredentials, pipelineId }) => {
    try {
      const result = await circleCiRequest(circleCiCredentials, `/pipeline/${pipelineId}/config`);
      if (!result.ok) return failedResult('Failed to get pipeline config', result);
      return result.data;
    } catch (error) {
      return toCircleCiError(error, 'Error getting pipeline config');
    }
  },
});

export const circleCiTriggerPipeline = tool({
  description:
    'Trigger a new pipeline on a branch (POST /project/{project-slug}/pipeline) with optional pipeline parameters.',
  inputSchema: z.object({
    circleCiCredentials: credField,
    projectSlug: slugField,
    branch: z.string().describe('Git branch to run'),
    parameters: z
      .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
      .optional()
      .describe('Pipeline parameters map'),
    tag: z.string().optional().describe('Git tag (instead of branch)'),
  }),
  execute: async ({ circleCiCredentials, projectSlug, branch, parameters, tag }) => {
    try {
      const slug = encodeURIComponent(projectSlug);
      const body: Record<string, unknown> = { branch };
      if (parameters !== undefined) body.parameters = parameters;
      if (tag !== undefined) body.tag = tag;
      const result = await circleCiRequest(circleCiCredentials, `/project/${slug}/pipeline`, {
        method: 'POST',
        body,
      });
      if (!result.ok) return failedResult('Failed to trigger pipeline', result);
      return result.data;
    } catch (error) {
      return toCircleCiError(error, 'Error triggering pipeline');
    }
  },
});
