// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { circleCiRequest, failedResult, toCircleCiError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const circleCiListWorkflows = tool({
  description: 'List workflows for a pipeline (GET /pipeline/{pipeline-id}/workflow).',
  inputSchema: z.object({
    circleCiCredentials: credField,
    pipelineId: z.string().describe('Pipeline ID'),
    pageToken: z.string().optional(),
  }),
  execute: async ({ circleCiCredentials, pipelineId, pageToken }) => {
    try {
      const result = await circleCiRequest(
        circleCiCredentials,
        `/pipeline/${pipelineId}/workflow`,
        { query: { 'page-token': pageToken } },
      );
      if (!result.ok) return failedResult('Failed to list workflows', result);
      return result.data;
    } catch (error) {
      return toCircleCiError(error, 'Error listing workflows');
    }
  },
});

export const circleCiGetWorkflow = tool({
  description: 'Get workflow status by ID (GET /workflow/{workflow-id}).',
  inputSchema: z.object({
    circleCiCredentials: credField,
    workflowId: z.string().describe('Workflow ID'),
  }),
  execute: async ({ circleCiCredentials, workflowId }) => {
    try {
      const result = await circleCiRequest(circleCiCredentials, `/workflow/${workflowId}`);
      if (!result.ok) return failedResult('Failed to get workflow', result);
      return result.data;
    } catch (error) {
      return toCircleCiError(error, 'Error getting workflow');
    }
  },
});

export const circleCiListWorkflowJobs = tool({
  description: 'List jobs in a workflow (GET /workflow/{workflow-id}/job).',
  inputSchema: z.object({
    circleCiCredentials: credField,
    workflowId: z.string().describe('Workflow ID'),
    pageToken: z.string().optional(),
  }),
  execute: async ({ circleCiCredentials, workflowId, pageToken }) => {
    try {
      const result = await circleCiRequest(circleCiCredentials, `/workflow/${workflowId}/job`, {
        query: { 'page-token': pageToken },
      });
      if (!result.ok) return failedResult('Failed to list workflow jobs', result);
      return result.data;
    } catch (error) {
      return toCircleCiError(error, 'Error listing workflow jobs');
    }
  },
});

export const circleCiCancelWorkflow = tool({
  description: 'Cancel a running workflow (POST /workflow/{workflow-id}/cancel).',
  inputSchema: z.object({
    circleCiCredentials: credField,
    workflowId: z.string().describe('Workflow ID'),
  }),
  execute: async ({ circleCiCredentials, workflowId }) => {
    try {
      const result = await circleCiRequest(circleCiCredentials, `/workflow/${workflowId}/cancel`, {
        method: 'POST',
      });
      if (!result.ok) return failedResult('Failed to cancel workflow', result);
      return result.data ?? { canceled: true, workflowId };
    } catch (error) {
      return toCircleCiError(error, 'Error canceling workflow');
    }
  },
});

export const circleCiRerunWorkflow = tool({
  description:
    'Rerun a workflow from failed jobs or from start (POST /workflow/{workflow-id}/rerun).',
  inputSchema: z.object({
    circleCiCredentials: credField,
    workflowId: z.string().describe('Workflow ID'),
    fromFailed: z.boolean().optional().describe('Rerun from failed job onward'),
    sparseTree: z.boolean().optional().describe('Sparse tree rerun mode'),
  }),
  execute: async ({ circleCiCredentials, workflowId, fromFailed, sparseTree }) => {
    try {
      const body: Record<string, boolean> = {};
      if (fromFailed !== undefined) body.from_failed = fromFailed;
      if (sparseTree !== undefined) body.sparse_tree = sparseTree;
      const result = await circleCiRequest(circleCiCredentials, `/workflow/${workflowId}/rerun`, {
        method: 'POST',
        body: Object.keys(body).length ? body : {},
      });
      if (!result.ok) return failedResult('Failed to rerun workflow', result);
      return result.data;
    } catch (error) {
      return toCircleCiError(error, 'Error rerunning workflow');
    }
  },
});

export const circleCiGetJob = tool({
  description: 'Get job details (GET /project/{project-slug}/job/{job-number}).',
  inputSchema: z.object({
    circleCiCredentials: credField,
    projectSlug: z.string().describe('Project slug'),
    jobNumber: z.number().int().describe('Job number'),
  }),
  execute: async ({ circleCiCredentials, projectSlug, jobNumber }) => {
    try {
      const slug = encodeURIComponent(projectSlug);
      const result = await circleCiRequest(
        circleCiCredentials,
        `/project/${slug}/job/${jobNumber}`,
      );
      if (!result.ok) return failedResult('Failed to get job', result);
      return result.data;
    } catch (error) {
      return toCircleCiError(error, 'Error getting job');
    }
  },
});

export const circleCiCancelJob = tool({
  description: 'Cancel a job (POST /project/{project-slug}/job/{job-number}/cancel).',
  inputSchema: z.object({
    circleCiCredentials: credField,
    projectSlug: z.string().describe('Project slug'),
    jobNumber: z.number().int().describe('Job number'),
  }),
  execute: async ({ circleCiCredentials, projectSlug, jobNumber }) => {
    try {
      const slug = encodeURIComponent(projectSlug);
      const result = await circleCiRequest(
        circleCiCredentials,
        `/project/${slug}/job/${jobNumber}/cancel`,
        { method: 'POST' },
      );
      if (!result.ok) return failedResult('Failed to cancel job', result);
      return result.data ?? { canceled: true, jobNumber };
    } catch (error) {
      return toCircleCiError(error, 'Error canceling job');
    }
  },
});

export const circleCiGetJobArtifacts = tool({
  description: 'List artifacts for a job (GET /project/{project-slug}/{job-number}/artifacts).',
  inputSchema: z.object({
    circleCiCredentials: credField,
    projectSlug: z.string().describe('Project slug'),
    jobNumber: z.number().int().describe('Job number'),
    pageToken: z.string().optional(),
  }),
  execute: async ({ circleCiCredentials, projectSlug, jobNumber, pageToken }) => {
    try {
      const slug = encodeURIComponent(projectSlug);
      const result = await circleCiRequest(
        circleCiCredentials,
        `/project/${slug}/${jobNumber}/artifacts`,
        { query: { 'page-token': pageToken } },
      );
      if (!result.ok) return failedResult('Failed to list job artifacts', result);
      return result.data;
    } catch (error) {
      return toCircleCiError(error, 'Error listing job artifacts');
    }
  },
});
