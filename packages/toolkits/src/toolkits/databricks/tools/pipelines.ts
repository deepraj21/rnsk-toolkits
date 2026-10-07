// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { databricksRequest, failedResult, toDatabricksError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Databricks credentials JSON with workspaceUrl (e.g. https://my-workspace.cloud.databricks.com) and token (PAT or OAuth)',
  );

export const databricksListPipelines = tool({
  description: 'List Delta Live Tables pipelines with states and latest updates.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
  }),
  execute: async ({ databricksCredentials }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/pipelines');
      if (!result.ok) return failedResult('Failed to list pipelines', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing pipelines');
    }
  },
});

export const databricksGetPipeline = tool({
  description: 'Get one pipeline with its full spec (libraries, clusters, configuration).',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    pipelineId: z.string().describe('Pipeline ID'),
  }),
  execute: async ({ databricksCredentials, pipelineId }) => {
    try {
      const result = await databricksRequest(databricksCredentials, `/2.0/pipelines/${pipelineId}`);
      if (!result.ok) return failedResult('Failed to get pipeline', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting pipeline');
    }
  },
});

export const databricksCreatePipeline = tool({
  description:
    'Create a Delta Live Tables pipeline: name, libraries (notebooks/files), catalog/schema targets, clusters, and mode (development/production).',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    pipeline: z
      .record(z.string(), z.any())
      .describe(
        'Pipeline spec: name, libraries [{notebook:{path}, file:{path}}], catalog, target (schema), clusters [{label, autoscale}], development, continuous, configuration, photon',
      ),
  }),
  execute: async ({ databricksCredentials, pipeline }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/pipelines', {
        method: 'POST',
        body: pipeline,
      });
      if (!result.ok) return failedResult('Failed to create pipeline', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error creating pipeline');
    }
  },
});

export const databricksEditPipeline = tool({
  description: 'Edit a pipeline spec (name, libraries, clusters, configuration).',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    pipelineId: z.string().describe('Pipeline ID'),
    pipeline: z.record(z.string(), z.any()).describe('Pipeline fields to update'),
  }),
  execute: async ({ databricksCredentials, pipelineId, pipeline }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.0/pipelines/${pipelineId}`,
        {
          method: 'PUT',
          body: pipeline,
        },
      );
      if (!result.ok) return failedResult('Failed to edit pipeline', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error editing pipeline');
    }
  },
});

export const databricksDeletePipeline = tool({
  description: 'Delete a pipeline (stops active updates first).',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    pipelineId: z.string().describe('Pipeline ID'),
  }),
  execute: async ({ databricksCredentials, pipelineId }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.0/pipelines/${pipelineId}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok) return failedResult('Failed to delete pipeline', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error deleting pipeline');
    }
  },
});

export const databricksStartPipeline = tool({
  description: 'Start a pipeline update (full refresh optional). Returns the update_id.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    pipelineId: z.string().describe('Pipeline ID'),
    fullRefresh: z.boolean().optional().describe('Full refresh of all datasets'),
  }),
  execute: async ({ databricksCredentials, pipelineId, fullRefresh }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.0/pipelines/${pipelineId}/updates`,
        {
          method: 'POST',
          body: fullRefresh === true ? { full_refresh: true } : {},
        },
      );
      if (!result.ok) return failedResult('Failed to start pipeline', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error starting pipeline');
    }
  },
});

export const databricksStopPipeline = tool({
  description: 'Stop the active update of a pipeline.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    pipelineId: z.string().describe('Pipeline ID'),
  }),
  execute: async ({ databricksCredentials, pipelineId }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.0/pipelines/${pipelineId}/stop`,
        { method: 'POST', body: {} },
      );
      if (!result.ok) return failedResult('Failed to stop pipeline', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error stopping pipeline');
    }
  },
});

export const databricksListPipelineUpdates = tool({
  description: 'List updates (runs) of an active pipeline with states.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    pipelineId: z.string().describe('Pipeline ID'),
    maxResults: z.number().int().min(1).optional().describe('Maximum updates to return'),
    pageToken: z.string().optional().describe('Page token from a previous response'),
  }),
  execute: async ({ databricksCredentials, pipelineId, maxResults, pageToken }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.0/pipelines/${pipelineId}/updates`,
        { query: { max_results: maxResults, page_token: pageToken } },
      );
      if (!result.ok) return failedResult('Failed to list pipeline updates', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing pipeline updates');
    }
  },
});

export const databricksGetPipelineUpdate = tool({
  description: 'Get one pipeline update with dataset states and cluster details.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    pipelineId: z.string().describe('Pipeline ID'),
    updateId: z.string().describe('Update ID'),
  }),
  execute: async ({ databricksCredentials, pipelineId, updateId }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.0/pipelines/${pipelineId}/updates/${updateId}`,
      );
      if (!result.ok) return failedResult('Failed to get pipeline update', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting pipeline update');
    }
  },
});

export const databricksListRepos = tool({
  description: 'List Git-linked repos (folders) with provider and branch info.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    pathPrefix: z.string().optional().describe('Only repos under this workspace path prefix'),
  }),
  execute: async ({ databricksCredentials, pathPrefix }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/repos', {
        query: { path_prefix: pathPrefix },
      });
      if (!result.ok) return failedResult('Failed to list repos', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing repos');
    }
  },
});

export const databricksGetRepo = tool({
  description: 'Get one repo with URL, provider, branch, and head commit.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    repoId: z.number().int().describe('Repo ID'),
  }),
  execute: async ({ databricksCredentials, repoId }) => {
    try {
      const result = await databricksRequest(databricksCredentials, `/2.0/repos/${repoId}`);
      if (!result.ok) return failedResult('Failed to get repo', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting repo');
    }
  },
});

export const databricksCreateRepo = tool({
  description:
    'Link a Git repository into the workspace (GitHub, Bitbucket, Azure DevOps, GitLab, AWS CodeCommit).',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    url: z.string().describe('Git repository URL'),
    provider: z
      .string()
      .optional()
      .describe(
        'Git provider: gitHub, bitbucketCloud, azureDevOpsServices, gitLab, awsCodeCommit (auto-detected when omitted)',
      ),
    path: z.string().optional().describe('Workspace checkout path (defaults under /Repos)'),
  }),
  execute: async ({ databricksCredentials, url, provider, path }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/repos', {
        method: 'POST',
        body: {
          url,
          ...(provider !== undefined ? { provider } : {}),
          ...(path !== undefined ? { path } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create repo', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error creating repo');
    }
  },
});

export const databricksUpdateRepo = tool({
  description: 'Checkout a branch or tag in a linked repo (pulls latest on that ref).',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    repoId: z.number().int().describe('Repo ID'),
    branch: z.string().optional().describe('Branch to checkout (mutually exclusive with tag)'),
    tag: z.string().optional().describe('Tag to checkout (mutually exclusive with branch)'),
  }),
  execute: async ({ databricksCredentials, repoId, branch, tag }) => {
    try {
      const result = await databricksRequest(databricksCredentials, `/2.0/repos/${repoId}`, {
        method: 'PATCH',
        body: {
          ...(branch !== undefined ? { branch } : {}),
          ...(tag !== undefined ? { tag } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to update repo', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error updating repo');
    }
  },
});

export const databricksDeleteRepo = tool({
  description: 'Unlink (delete the checkout of) a Git repo. Remote repository is untouched.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    repoId: z.number().int().describe('Repo ID'),
  }),
  execute: async ({ databricksCredentials, repoId }) => {
    try {
      const result = await databricksRequest(databricksCredentials, `/2.0/repos/${repoId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete repo', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error deleting repo');
    }
  },
});
