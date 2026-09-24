import { tool } from 'ai';
import { z } from 'zod';
import { ListProjectsCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsListCodebuildProjects = tool({
  description: 'List all CodeBuild build projects. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    sortBy: z.enum(['NAME', 'CREATED_TIME', 'LAST_MODIFIED_TIME']).optional().describe('The criterion to be used to list build project names'),
    sortOrder: z.enum(['ASCENDING', 'DESCENDING']).optional().describe('The order in which to list build projects'),
    nextToken: z.string().optional().describe('During a previous call, if there are more than 100 items in the list, only the first 100 items are returned'),
  }),
  execute: async ({ awsCredentials, region, sortBy, sortOrder, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      const command = new ListProjectsCommand({
          sortBy: sortBy as any,
          sortOrder: sortOrder as any,
          nextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  projects: response.projects || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all CodeBuild build projects', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
