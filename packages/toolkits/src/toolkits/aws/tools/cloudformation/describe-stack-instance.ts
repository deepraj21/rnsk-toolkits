import { tool } from 'ai';
import { z } from 'zod';
import { DescribeStackInstanceCommand } from '@aws-sdk/client-cloudformation';
import { createCloudFormationClient } from '../client.js';

export const awsDescribeCloudformationStackInstance = tool({
  description: 'Describe a stack instance in a stack set. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    stackSetName: z.string().describe('Name of the stack set'),
    stackInstanceAccount: z.string().describe('Account ID'),
    stackInstanceRegion: z.string().describe('Region name'),
  }),
  execute: async ({ awsCredentials, region, stackSetName, stackInstanceAccount, stackInstanceRegion }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFormationClient(awsCredentials, region);

      const command = new DescribeStackInstanceCommand({
          StackSetName: stackSetName,
          StackInstanceAccount: stackInstanceAccount,
          StackInstanceRegion: stackInstanceRegion,
      });
      const response = await client.send(command);
      return { stackInstance: response.StackInstance };
    } catch (err) {
      return { error: 'Failed to describe a stack instance in a stack set', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
