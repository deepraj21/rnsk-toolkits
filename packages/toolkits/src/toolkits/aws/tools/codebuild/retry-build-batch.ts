import { tool } from 'ai';
import { z } from 'zod';
import { RetryBuildBatchCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsRetryCodebuildBuildBatch = tool({
  description: 'Restarts a failed batch build. Use it to retry a failed operation.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    id: z.string().describe('Specifies the identifier of the batch build to restart'),
    idempotencyToken: z.string().optional().describe('idempotencyToken'),
    retryType: z.enum(['RETRY_ALL_BUILDS', 'RETRY_FAILED_BUILDS']).optional().describe('Specifies the type of retry to perform'),
  }),
  execute: async ({ awsCredentials, region, id, idempotencyToken, retryType }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      const command = new RetryBuildBatchCommand({
          id: id,
          idempotencyToken: idempotencyToken,
          retryType: retryType as any,
      });
      const response = await client.send(command);
      return {
                  buildBatch: response.buildBatch,
              };
    } catch (err) {
      return { error: 'Failed to restarts a failed batch build', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
