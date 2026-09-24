import { tool } from 'ai';
import { z } from 'zod';
import { BatchGetProjectsCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsGetCodebuildProject = tool({
  description: 'Get information about a CodeBuild build project. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name of the build project'),
  }),
  execute: async ({ awsCredentials, region, name }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      const command = new BatchGetProjectsCommand({
          names: [name],
      });
      const response = await client.send(command);
      return {
                  project: response.projects?.[0] || null,
                  projectsNotFound: response.projectsNotFound || [],
              };
    } catch (err) {
      return { error: 'Failed to get information about a CodeBuild build project', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
