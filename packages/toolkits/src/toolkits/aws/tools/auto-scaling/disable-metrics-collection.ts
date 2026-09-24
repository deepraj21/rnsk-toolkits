import { tool } from 'ai';
import { z } from 'zod';
import { DisableMetricsCollectionCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsDisableAutoscalingMetricsCollection = tool({
  description: 'Disable metrics collection for an Auto Scaling group. Use it to disable a feature.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
    metrics: z.array(z.string()).optional().describe('Metrics to disable'),
  }),
  execute: async ({ awsCredentials, region, autoScalingGroupName, metrics }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new DisableMetricsCollectionCommand({
          AutoScalingGroupName: autoScalingGroupName,
          Metrics: metrics,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Metrics collection disabled for Auto Scaling group ${autoScalingGroupName}`,
              };
    } catch (err) {
      return { error: 'Failed to disable metrics collection for an Auto Scaling group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
