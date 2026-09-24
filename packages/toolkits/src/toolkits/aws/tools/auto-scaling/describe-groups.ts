import { tool } from 'ai';
import { z } from 'zod';
import { DescribeAutoScalingGroupsCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsDescribeAutoscalingGroups = tool({
  description: 'Describe one or more Auto Scaling groups. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    autoScalingGroupNames: z.array(z.string()).optional().describe('Names of Auto Scaling groups'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxRecords: z.number().optional().describe('Maximum number of records to return'),
  }),
  execute: async ({ awsCredentials, region, autoScalingGroupNames, nextToken, maxRecords }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new DescribeAutoScalingGroupsCommand({
          AutoScalingGroupNames: autoScalingGroupNames,
          NextToken: nextToken,
          MaxRecords: maxRecords,
      });
      const response = await client.send(command);
      return {
                  autoScalingGroups: response.AutoScalingGroups,
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to describe one or more Auto Scaling groups', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
