import { tool } from 'ai';
import { z } from 'zod';
import { DetachGroupPolicyCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsDetachGroupPolicy = tool({
  description: 'Detach a managed policy from an IAM group. Use it to detach or remove access.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    groupName: z.string().describe('Name of the group'),
    policyArn: z.string().describe('ARN of the managed policy to detach'),
  }),
  execute: async ({ awsCredentials, region, groupName, policyArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new DetachGroupPolicyCommand({
          GroupName: groupName,
          PolicyArn: policyArn,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to detach a managed policy from an IAM group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
