import { tool } from 'ai';
import { z } from 'zod';
import { StopBuildBatchCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsStopCodebuildBuildBatch = tool({
  description: 'Stops a running batch build. Use it to stop a running resource (billable config may remain).',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    id: z.string().describe('The identifier of the batch build to stop'),
  }),
  execute: async ({ awsCredentials, region, id }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      const command = new StopBuildBatchCommand({
          id: id,
      });
      const response = await client.send(command);
      return {
                  buildBatch: response.buildBatch,
              };
    } catch (err) {
      return { error: 'Failed to stops a running batch build', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
