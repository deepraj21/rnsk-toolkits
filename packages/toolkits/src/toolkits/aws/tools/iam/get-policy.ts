import { tool } from 'ai';
import { z } from 'zod';
import { GetPolicyCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsGetIamPolicy = tool({
  description: 'Get metadata about a managed policy. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    policyArn: z.string().describe('ARN of the policy'),
  }),
  execute: async ({ awsCredentials, region, policyArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new GetPolicyCommand({
          PolicyArn: policyArn,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to get metadata about a managed policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
