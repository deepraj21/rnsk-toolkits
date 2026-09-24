import { tool } from 'ai';
import { z } from 'zod';
import { BatchGetBuildBatchesCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsBatchGetCodebuildBuildBatches = tool({
  description: 'Retrieves information about one or more batch builds. Use it to operate on multiple resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    ids: z.array(z.string()).describe('An array that contains the batch build identifiers to retrieve'),
  }),
  execute: async ({ awsCredentials, region, ids }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      const command = new BatchGetBuildBatchesCommand({
          ids: ids,
      });
      const response = await client.send(command);
      return {
                  buildBatches: response.buildBatches || [],
                  buildBatchesNotFound: response.buildBatchesNotFound || [],
              };
    } catch (err) {
      return { error: 'Failed to retrieves information about one or more batch builds', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
