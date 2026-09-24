import { tool } from 'ai';
import { z } from 'zod';
import { DescribeAutoScalingInstancesCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsDescribeAutoscalingInstances = tool({
  description: 'Describe Auto Scaling instances. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    instanceIds: z.array(z.string()).optional().describe('Instance IDs'),
    maxRecords: z.number().optional().describe('Maximum number of records to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, instanceIds, maxRecords, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new DescribeAutoScalingInstancesCommand({
          InstanceIds: instanceIds,
          MaxRecords: maxRecords,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  autoScalingInstances: response.AutoScalingInstances,
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to describe Auto Scaling instances', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
