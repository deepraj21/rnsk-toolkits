import { tool } from 'ai';
import { z } from 'zod';
import { PutThirdPartyJobFailureResultCommand } from '@aws-sdk/client-codepipeline';
import { createCodePipelineClient } from '../client.js';

export const awsPutCodepipelineThirdPartyJobFailureResult = tool({
  description: 'Put failure result for a third-party job. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    jobId: z.string().describe('Job ID'),
    clientToken: z.string().describe('Client token for idempotency'),
    failureDetails: z.enum(['JobFailed', 'ConfigurationError', 'PermissionError', 'RevisionOutOfSync', 'RevisionUnavailable', 'SystemUnavailable']).describe('Failure details'),
  }),
  execute: async ({ awsCredentials, region, jobId, clientToken, failureDetails }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodePipelineClient(awsCredentials, region);

      const command = new PutThirdPartyJobFailureResultCommand({
          jobId: jobId,
          clientToken: clientToken,
          failureDetails: failureDetails,
      } as any);
      await client.send(command);
      return {
                  message: 'Third-party job failure result submitted successfully',
              };
    } catch (err) {
      return { error: 'Failed to put failure result for a third-party job', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
