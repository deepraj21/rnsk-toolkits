import { tool } from 'ai';
import { z } from 'zod';
import { GetRoleCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsGetIamRole = tool({
  description: 'Get detailed information about a specific IAM role. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    roleName: z.string().describe('Name of the IAM role to retrieve'),
  }),
  execute: async ({ awsCredentials, region, roleName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new GetRoleCommand({
          RoleName: roleName,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to get detailed information about a specific IAM role', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
