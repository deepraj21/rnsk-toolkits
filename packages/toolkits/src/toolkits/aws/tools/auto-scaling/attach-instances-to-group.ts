import { tool } from 'ai';
import { z } from 'zod';
import { AttachInstancesCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsAttachInstancesToAutoscalingGroup = tool({
  description: 'Attach instances to an Auto Scaling group. Use it to attach a policy or resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    instanceIds: z.array(z.string()).optional().describe('Instance IDs to attach'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
  }),
  execute: async ({ awsCredentials, region, instanceIds, autoScalingGroupName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new AttachInstancesCommand({
          InstanceIds: instanceIds,
          AutoScalingGroupName: autoScalingGroupName,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Instances attached to Auto Scaling group ${autoScalingGroupName} successfully`,
              };
    } catch (err) {
      return { error: 'Failed to attach instances to an Auto Scaling group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
