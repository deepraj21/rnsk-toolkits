import { tool } from 'ai';
import { z } from 'zod';
import { DetachRolePolicyCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsDetachRolePolicy = tool({
  description: 'Detach a managed policy from an IAM role. Use it to detach or remove access.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    roleName: z.string().describe('Name of the IAM role'),
    policyArn: z.string().describe('ARN of the managed policy to detach'),
  }),
  execute: async ({ awsCredentials, region, roleName, policyArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new DetachRolePolicyCommand({
          RoleName: roleName,
          PolicyArn: policyArn,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to detach a managed policy from an IAM role', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
