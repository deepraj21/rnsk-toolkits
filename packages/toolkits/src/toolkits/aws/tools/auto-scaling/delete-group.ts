import { tool } from 'ai';
import { z } from 'zod';
import { DeleteAutoScalingGroupCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsDeleteAutoscalingGroup = tool({
  description: 'Delete an Auto Scaling group. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
    forceDelete: z.boolean().optional().describe('Whether to force delete even if instances are running'),
  }),
  execute: async ({ awsCredentials, region, autoScalingGroupName, forceDelete }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new DeleteAutoScalingGroupCommand({
          AutoScalingGroupName: autoScalingGroupName,
          ForceDelete: forceDelete,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Auto Scaling group ${autoScalingGroupName} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete an Auto Scaling group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
