// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { digitalOceanRequest, missingKey, toDigitalOceanError } from './client.js';

const authField = {
  digitalOceanApiKey: z.string().optional().describe('Injected by system; do not provide'),
};

export const digitalOceanListApps = tool({
  description:
    'List App Platform apps with metadata, live URLs, and deployment status. Use to discover app IDs by name or enumerate every app with pagination.',
  inputSchema: z.object({
    ...authField,
    page: z.number().int().min(1).optional().describe('Page of results to return (>= 1)'),
    perPage: z
      .number()
      .int()
      .min(1)
      .max(200)
      .optional()
      .describe('Number of items per page (1-200)'),
    withProjects: z.boolean().optional().describe('Include each app project_id in the response'),
  }),
  execute: async ({ digitalOceanApiKey, page, perPage, withProjects }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'GET', '/apps', {
        query: { page, per_page: perPage, with_projects: withProjects },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to list apps');
    }
  },
});
