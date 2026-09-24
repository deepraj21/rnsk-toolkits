import { tool } from 'ai';
import { z } from 'zod';
import { PutThirdPartyJobSuccessResultCommand } from '@aws-sdk/client-codepipeline';
import { createCodePipelineClient } from '../client.js';

export const awsPutCodepipelineThirdPartyJobSuccessResult = tool({
  description: 'Put success result for a third-party job. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    jobId: z.string().describe('Job ID'),
    clientToken: z.string().describe('Client token for idempotency'),
    currentRevision: z.record(z.any()).optional().describe('Current revision'),
    continuationToken: z.string().optional().describe('Continuation token'),
    executionDetails: z.record(z.any()).optional().describe('Execution details'),
  }),
  execute: async ({ awsCredentials, region, jobId, clientToken, currentRevision, continuationToken, executionDetails }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodePipelineClient(awsCredentials, region);

      const command = new PutThirdPartyJobSuccessResultCommand({
          jobId: jobId,
          clientToken: clientToken,
          currentRevision: currentRevision,
          continuationToken: continuationToken,
          executionDetails: executionDetails,
      } as any);
      await client.send(command);
      return {
                  message: 'Third-party job success result submitted successfully',
              };
    } catch (err) {
      return { error: 'Failed to put success result for a third-party job', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
