import { tool } from 'ai';
import { z } from 'zod';
import { PutJobSuccessResultCommand } from '@aws-sdk/client-codepipeline';
import { createCodePipelineClient } from '../client.js';

export const awsPutCodepipelineJobSuccessResult = tool({
  description: 'Put success result for a job. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    jobId: z.string().describe('Job ID'),
    currentRevision: z.record(z.any()).optional().describe('Current revision'),
    continuationToken: z.string().optional().describe('Continuation token'),
    executionDetails: z.record(z.any()).optional().describe('Execution details'),
    outputVariables: z.record(z.any()).optional().describe('Output variables'),
  }),
  execute: async ({ awsCredentials, region, jobId, currentRevision, continuationToken, executionDetails, outputVariables }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodePipelineClient(awsCredentials, region);

      const command = new PutJobSuccessResultCommand({
          jobId: jobId,
          currentRevision: currentRevision,
          continuationToken: continuationToken,
          executionDetails: executionDetails,
          outputVariables: outputVariables,
      } as any);
      await client.send(command);
      return {
                  message: 'Job success result submitted successfully',
              };
    } catch (err) {
      return { error: 'Failed to put success result for a job', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
