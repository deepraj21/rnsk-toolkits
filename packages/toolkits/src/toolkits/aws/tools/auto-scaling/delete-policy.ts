import { tool } from 'ai';
import { z } from 'zod';
import { DeletePolicyCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsDeleteAutoscalingPolicy = tool({
  description: 'Delete a scaling policy. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
    policyName: z.string().describe('The name of the policy'),
  }),
  execute: async ({ awsCredentials, region, autoScalingGroupName, policyName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new DeletePolicyCommand({
          AutoScalingGroupName: autoScalingGroupName,
          PolicyName: policyName,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Policy ${policyName} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a scaling policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
