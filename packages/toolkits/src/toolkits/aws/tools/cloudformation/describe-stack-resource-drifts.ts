import { tool } from 'ai';
import { z } from 'zod';
import { DescribeStackResourceDriftsCommand } from '@aws-sdk/client-cloudformation';
import { createCloudFormationClient } from '../client.js';

export const awsDescribeCloudformationStackResourceDrifts = tool({
  description: 'Describe resource drifts in a CloudFormation stack. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    stackName: z.string().describe('Name of the stack'),
    stackResourceDriftStatusFilters: z.array(z.string()).optional().describe('Filter by drift status'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, stackName, stackResourceDriftStatusFilters, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFormationClient(awsCredentials, region);

      const command = new DescribeStackResourceDriftsCommand({
          StackName: stackName,
          StackResourceDriftStatusFilters: stackResourceDriftStatusFilters as any,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return { stackResourceDrifts: response.StackResourceDrifts, nextToken: response.NextToken };
    } catch (err) {
      return { error: 'Failed to describe resource drifts in a CloudFormation stack', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
