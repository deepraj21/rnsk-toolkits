import { tool } from 'ai';
import { z } from 'zod';
import { DeleteProjectCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsDeleteCodebuildProject = tool({
  description: 'Delete a CodeBuild build project. Use it to permanently remove the resource.',
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

      const command = new DeleteProjectCommand({
          name: name,
      });
      await client.send(command);
      return {
                  message: 'Project deleted successfully',
                  name: name,
              };
    } catch (err) {
      return { error: 'Failed to delete a CodeBuild build project', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
