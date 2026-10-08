// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { launchdarklyRequest, failedResult, toLaunchdarklyError } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const launchdarklyListProjects = tool({
  description: 'List LaunchDarkly projects (GET /projects).',
  inputSchema: z.object({
    launchdarklyApiToken: tokenField,
    limit: z.number().int().optional(),
    offset: z.number().int().optional(),
    filter: z.string().optional().describe('Filter query, e.g. query:mobile'),
  }),
  execute: async ({ launchdarklyApiToken, limit, offset, filter }) => {
    try {
      const result = await launchdarklyRequest(launchdarklyApiToken, '/projects', {
        query: { limit, offset, filter },
      });
      if (!result.ok) return failedResult('Failed to list projects', result);
      return result.data;
    } catch (error) {
      return toLaunchdarklyError(error, 'Error listing projects');
    }
  },
});

export const launchdarklyGetProject = tool({
  description: 'Get a project by key (GET /projects/{projectKey}).',
  inputSchema: z.object({
    launchdarklyApiToken: tokenField,
    projectKey: z.string().describe('Project key'),
  }),
  execute: async ({ launchdarklyApiToken, projectKey }) => {
    try {
      const result = await launchdarklyRequest(
        launchdarklyApiToken,
        `/projects/${encodeURIComponent(projectKey)}`,
      );
      if (!result.ok) return failedResult('Failed to get project', result);
      return result.data;
    } catch (error) {
      return toLaunchdarklyError(error, 'Error getting project');
    }
  },
});

export const launchdarklyListEnvironments = tool({
  description: 'List environments in a project (GET /projects/{projectKey}/environments).',
  inputSchema: z.object({
    launchdarklyApiToken: tokenField,
    projectKey: z.string().describe('Project key'),
    limit: z.number().int().optional(),
    offset: z.number().int().optional(),
  }),
  execute: async ({ launchdarklyApiToken, projectKey, limit, offset }) => {
    try {
      const result = await launchdarklyRequest(
        launchdarklyApiToken,
        `/projects/${encodeURIComponent(projectKey)}/environments`,
        { query: { limit, offset } },
      );
      if (!result.ok) return failedResult('Failed to list environments', result);
      return result.data;
    } catch (error) {
      return toLaunchdarklyError(error, 'Error listing environments');
    }
  },
});

export const launchdarklyGetEnvironment = tool({
  description: 'Get one environment (GET /projects/{projectKey}/environments/{environmentKey}).',
  inputSchema: z.object({
    launchdarklyApiToken: tokenField,
    projectKey: z.string().describe('Project key'),
    environmentKey: z.string().describe('Environment key'),
  }),
  execute: async ({ launchdarklyApiToken, projectKey, environmentKey }) => {
    try {
      const result = await launchdarklyRequest(
        launchdarklyApiToken,
        `/projects/${encodeURIComponent(projectKey)}/environments/${encodeURIComponent(environmentKey)}`,
      );
      if (!result.ok) return failedResult('Failed to get environment', result);
      return result.data;
    } catch (error) {
      return toLaunchdarklyError(error, 'Error getting environment');
    }
  },
});
