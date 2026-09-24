import { tool } from 'ai';
import { z } from 'zod';
import { DescribeWarmPoolCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsDescribeAutoscalingWarmPool = tool({
  description: 'Describe warm pool configuration. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
  }),
  execute: async ({ awsCredentials, region, autoScalingGroupName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new DescribeWarmPoolCommand({
          AutoScalingGroupName: autoScalingGroupName,
      });
      const response = await client.send(command);
      return {
                  warmPoolConfiguration: response.WarmPoolConfiguration,
                  instances: response.Instances,
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to describe warm pool configuration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
