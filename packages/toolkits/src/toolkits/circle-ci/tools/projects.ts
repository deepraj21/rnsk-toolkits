// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { circleCiRequest, failedResult, toCircleCiError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');
const slugField = z
  .string()
  .describe('Project slug, e.g. gh/org/repo or circleci/<org-uuid>/<project-uuid>');

export const circleCiGetMe = tool({
  description: 'Get the authenticated CircleCI user (GET /me).',
  inputSchema: z.object({ circleCiCredentials: credField }),
  execute: async ({ circleCiCredentials }) => {
    try {
      const result = await circleCiRequest(circleCiCredentials, '/me');
      if (!result.ok) return failedResult('Failed to get current user', result);
      return result.data;
    } catch (error) {
      return toCircleCiError(error, 'Error getting current user');
    }
  },
});

export const circleCiListFollowedProjects = tool({
  description: 'List projects the current user follows (GET /me/followed-projects).',
  inputSchema: z.object({
    circleCiCredentials: credField,
    pageToken: z.string().optional().describe('Pagination token from next_page_token'),
  }),
  execute: async ({ circleCiCredentials, pageToken }) => {
    try {
      const result = await circleCiRequest(circleCiCredentials, '/me/followed-projects', {
        query: { 'page-token': pageToken },
      });
      if (!result.ok) return failedResult('Failed to list followed projects', result);
      return result.data;
    } catch (error) {
      return toCircleCiError(error, 'Error listing followed projects');
    }
  },
});

export const circleCiGetProject = tool({
  description: 'Get project details by slug (GET /project/{project-slug}).',
  inputSchema: z.object({
    circleCiCredentials: credField,
    projectSlug: slugField,
  }),
  execute: async ({ circleCiCredentials, projectSlug }) => {
    try {
      const slug = encodeURIComponent(projectSlug);
      const result = await circleCiRequest(circleCiCredentials, `/project/${slug}`);
      if (!result.ok) return failedResult('Failed to get project', result);
      return result.data;
    } catch (error) {
      return toCircleCiError(error, 'Error getting project');
    }
  },
});

export const circleCiGetProjectSettings = tool({
  description: 'Get project settings (GET /project/{project-slug}/settings).',
  inputSchema: z.object({
    circleCiCredentials: credField,
    projectSlug: slugField,
  }),
  execute: async ({ circleCiCredentials, projectSlug }) => {
    try {
      const slug = encodeURIComponent(projectSlug);
      const result = await circleCiRequest(circleCiCredentials, `/project/${slug}/settings`);
      if (!result.ok) return failedResult('Failed to get project settings', result);
      return result.data;
    } catch (error) {
      return toCircleCiError(error, 'Error getting project settings');
    }
  },
});
