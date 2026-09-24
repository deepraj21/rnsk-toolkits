import { tool } from 'ai';
import { z } from 'zod';
import { CancelInstanceRefreshCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsCancelAutoscalingInstanceRefresh = tool({
  description: 'Cancel an instance refresh. Use it to cancel a running operation.',
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

      const command = new CancelInstanceRefreshCommand({
          AutoScalingGroupName: autoScalingGroupName,
      });
      const response = await client.send(command);
      return {
                  instanceRefreshId: response.InstanceRefreshId,
              };
    } catch (err) {
      return { error: 'Failed to cancel an instance refresh', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
