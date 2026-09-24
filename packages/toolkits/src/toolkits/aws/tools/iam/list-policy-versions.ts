import { tool } from 'ai';
import { z } from 'zod';
import { ListPolicyVersionsCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsListPolicyVersions = tool({
  description: 'List all versions of a policy. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    policyArn: z.string().describe('ARN of the policy'),
    maxItems: z.number().optional().describe('Maximum number of versions to return'),
    marker: z.string().optional().describe('Pagination marker'),
  }),
  execute: async ({ awsCredentials, region, policyArn, maxItems, marker }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new ListPolicyVersionsCommand({
          PolicyArn: policyArn,
          MaxItems: maxItems,
          Marker: marker,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to list all versions of a policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
