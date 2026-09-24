import { tool } from 'ai';
import { z } from 'zod';
import { BatchGetProjectsCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsBatchGetCodebuildProjects = tool({
  description: 'Get information about one or more build projects. Use it to operate on multiple resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    names: z.array(z.string()).describe('The names or ARNs of the build projects'),
  }),
  execute: async ({ awsCredentials, region, names }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      const command = new BatchGetProjectsCommand({
          names: names,
      });
      const response = await client.send(command);
      return {
                  projects: response.projects || [],
                  projectsNotFound: response.projectsNotFound || [],
              };
    } catch (err) {
      return { error: 'Failed to get information about one or more build projects', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
