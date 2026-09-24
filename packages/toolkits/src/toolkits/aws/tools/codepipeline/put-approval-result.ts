import { tool } from 'ai';
import { z } from 'zod';
import { PutApprovalResultCommand } from '@aws-sdk/client-codepipeline';
import { createCodePipelineClient } from '../client.js';

export const awsPutCodepipelineApprovalResult = tool({
  description: 'Put approval result for an approval action. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    pipelineName: z.string().describe('Name of the pipeline'),
    stageName: z.string().describe('Name of the stage'),
    actionName: z.string().describe('Name of the action'),
    result: z.enum(['Approved', 'Rejected']).describe('Approval result'),
    token: z.string().describe('Approval token'),
  }),
  execute: async ({ awsCredentials, region, pipelineName, stageName, actionName, result, token }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodePipelineClient(awsCredentials, region);

      const command = new PutApprovalResultCommand({
          pipelineName: pipelineName,
          stageName: stageName,
          actionName: actionName,
          result: result,
          token: token,
      } as any);
      await client.send(command);
      return {
                  message: 'Approval result submitted successfully',
              };
    } catch (err) {
      return { error: 'Failed to put approval result for an approval action', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
