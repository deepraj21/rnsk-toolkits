import { tool } from 'ai';
import { z } from 'zod';
import { DescribeAccountLimitsCommand } from '@aws-sdk/client-cloudformation';
import { createCloudFormationClient } from '../client.js';

export const awsDescribeCloudformationAccountLimits = tool({
  description: 'Describe CloudFormation account limits. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
  }),
  execute: async ({ awsCredentials, region }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFormationClient(awsCredentials, region);

      const command = new DescribeAccountLimitsCommand({});
      const response = await client.send(command);
      return { accountLimits: response.AccountLimits, nextToken: response.NextToken };
    } catch (err) {
      return { error: 'Failed to describe CloudFormation account limits', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
