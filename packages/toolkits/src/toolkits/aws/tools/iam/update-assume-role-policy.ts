import { tool } from 'ai';
import { z } from 'zod';
import { UpdateAssumeRolePolicyCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsUpdateAssumeRolePolicy = tool({
  description: 'Update the trust policy of an IAM role. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    roleName: z.string().describe('Name of the IAM role'),
    policyDocument: z.string().describe('New JSON trust policy document'),
  }),
  execute: async ({ awsCredentials, region, roleName, policyDocument }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new UpdateAssumeRolePolicyCommand({
          RoleName: roleName,
          PolicyDocument: policyDocument,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to update the trust policy of an IAM role', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
