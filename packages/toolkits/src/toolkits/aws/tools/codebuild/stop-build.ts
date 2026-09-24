import { tool } from 'ai';
import { z } from 'zod';
import { StopBuildCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsStopCodebuildBuild = tool({
  description: 'Stop a running build. Use it to stop a running resource (billable config may remain).',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    id: z.string().describe('The ID of the build'),
  }),
  execute: async ({ awsCredentials, region, id }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      const command = new StopBuildCommand({
          id: id,
      });
      const response = await client.send(command);
      return {
                  build: response.build,
              };
    } catch (err) {
      return { error: 'Failed to stop a running build', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
