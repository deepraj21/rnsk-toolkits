import { tool } from 'ai';
import { z } from 'zod';
import { DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { createCloudFormationClient } from '../client.js';

export const awsDescribeCloudformationStacks = tool({
  description: 'Describe CloudFormation stacks. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    stackName: z.string().optional().describe('Name of a specific stack'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, stackName, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFormationClient(awsCredentials, region);

      const command = new DescribeStacksCommand({
          StackName: stackName,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return { stacks: response.Stacks, nextToken: response.NextToken };
    } catch (err) {
      return { error: 'Failed to describe CloudFormation stacks', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
