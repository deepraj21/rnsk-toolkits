import { tool } from 'ai';
import { z } from 'zod';
import { GetAccountPasswordPolicyCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsGetAccountPasswordPolicy = tool({
  description: 'Get the password policy for the AWS account.. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
  }),
  execute: async ({ awsCredentials, region }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new GetAccountPasswordPolicyCommand({});
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to get the password policy for the AWS account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
