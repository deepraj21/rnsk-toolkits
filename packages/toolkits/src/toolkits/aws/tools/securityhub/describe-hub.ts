import { tool } from 'ai';
import { z } from 'zod';
import { DescribeHubCommand } from '@aws-sdk/client-securityhub';
import { createSecurityHubClient } from '../client.js';

export const awsDescribeHub = tool({
  description: 'Get information about the Security Hub hub resource. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    hubArn: z.string().optional().describe('ARN of the hub (optional)'),
  }),
  execute: async ({ awsCredentials, region, hubArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSecurityHubClient(awsCredentials, region);

      const command = new DescribeHubCommand({
          HubArn: hubArn,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to get information about the Security Hub hub resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
