// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { wizGraphql, failedResult, toWizError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

const PROJECTS_QUERY = `query Projects {
  projects {
    nodes {
      id
      name
      slug
      description
      archived
    }
  }
}`;

export const wizListProjects = tool({
  description: 'List Wiz projects (GraphQL projects).',
  inputSchema: z.object({
    wizCredentials: credField,
  }),
  execute: async ({ wizCredentials }) => {
    try {
      const result = await wizGraphql(wizCredentials, PROJECTS_QUERY);
      if (!result.ok) return failedResult('Failed to list Wiz projects', result);
      return result.data;
    } catch (error) {
      return toWizError(error, 'Error listing Wiz projects');
    }
  },
});

export const wizGraphqlQuery = tool({
  description:
    'Run a read-only Wiz GraphQL query with variables. Use list/get tools first; this is for advanced reporting when the service account scope allows.',
  inputSchema: z.object({
    wizCredentials: credField,
    query: z.string().describe('GraphQL query string (mutations rejected)'),
    variables: z.record(z.string(), z.any()).optional().describe('Query variables object'),
  }),
  execute: async ({ wizCredentials, query, variables }) => {
    const trimmed = query.trim();
    if (/^\s*mutation\b/i.test(trimmed)) {
      return {
        error:
          'Mutations are not allowed through this tool. Use dedicated write tools when available.',
      };
    }
    try {
      const result = await wizGraphql(wizCredentials, query, variables);
      if (!result.ok) return failedResult('Wiz GraphQL query failed', result);
      return result.data;
    } catch (error) {
      return toWizError(error, 'Error running Wiz GraphQL query');
    }
  },
});
