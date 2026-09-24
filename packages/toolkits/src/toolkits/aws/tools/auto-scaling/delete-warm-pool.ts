import { tool } from 'ai';
import { z } from 'zod';
import { DeleteWarmPoolCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsDeleteAutoscalingWarmPool = tool({
  description: 'Delete warm pool configuration. Use it to permanently remove the resource.',
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

      const command = new DeleteWarmPoolCommand({
          AutoScalingGroupName: autoScalingGroupName,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Warm pool configuration deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete warm pool configuration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
