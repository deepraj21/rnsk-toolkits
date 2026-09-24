import { tool } from 'ai';
import { z } from 'zod';
import { DescribeInstanceRefreshesCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsDescribeAutoscalingInstanceRefreshes = tool({
  description: 'Describe instance refreshes. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
    instanceRefreshIds: z.array(z.string()).optional().describe('Instance refresh IDs'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxRecords: z.number().optional().describe('Maximum number of records to return'),
  }),
  execute: async ({ awsCredentials, region, autoScalingGroupName, instanceRefreshIds, nextToken, maxRecords }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new DescribeInstanceRefreshesCommand({
          AutoScalingGroupName: autoScalingGroupName,
          InstanceRefreshIds: instanceRefreshIds,
          NextToken: nextToken,
          MaxRecords: maxRecords,
      });
      const response = await client.send(command);
      return {
                  instanceRefreshes: response.InstanceRefreshes,
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to describe instance refreshes', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
