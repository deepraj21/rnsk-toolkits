import { tool } from 'ai';
import { z } from 'zod';
import { AssociateDRTRoleCommand } from '@aws-sdk/client-shield';
import { createShieldClient } from '../client.js';

export const awsAssociateDrtRole = tool({
  description: 'Grant DRT access to your account during attacks. Use it to connect resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    roleArn: z.string().describe('ARN of IAM role that grants DRT access to CloudWatch and WAF'),
  }),
  execute: async ({ awsCredentials, region, roleArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createShieldClient(awsCredentials, region);

      const command = new AssociateDRTRoleCommand({
          RoleArn: roleArn,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to grant DRT access to your account during attacks', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
