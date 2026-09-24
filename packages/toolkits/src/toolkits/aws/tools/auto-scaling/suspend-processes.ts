import { tool } from 'ai';
import { z } from 'zod';
import { SuspendProcessesCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsSuspendAutoscalingProcesses = tool({
  description: 'Suspend processes for an Auto Scaling group. Use it to pause a process.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
    scalingProcesses: z.array(z.string()).optional().describe('Processes to suspend'),
  }),
  execute: async ({ awsCredentials, region, autoScalingGroupName, scalingProcesses }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new SuspendProcessesCommand({
          AutoScalingGroupName: autoScalingGroupName,
          ScalingProcesses: scalingProcesses,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Processes suspended for Auto Scaling group ${autoScalingGroupName}`,
              };
    } catch (err) {
      return { error: 'Failed to suspend processes for an Auto Scaling group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
