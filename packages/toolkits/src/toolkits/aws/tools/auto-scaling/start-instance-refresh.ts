import { tool } from 'ai';
import { z } from 'zod';
import { StartInstanceRefreshCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsStartAutoscalingInstanceRefresh = tool({
  description: 'Start an instance refresh. Use it to start a stopped resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
    strategy: z.enum(['Rolling', 'RollingWithInstanceWarmup']).optional().describe('Refresh strategy'),
    desiredConfiguration: z.record(z.any()).optional().describe('Desired configuration'),
    preferences: z.record(z.any()).optional().describe('Refresh preferences'),
  }),
  execute: async ({ awsCredentials, region, autoScalingGroupName, strategy, desiredConfiguration, preferences }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new StartInstanceRefreshCommand({
          AutoScalingGroupName: autoScalingGroupName,
          Strategy: strategy,
          DesiredConfiguration: desiredConfiguration,
          Preferences: preferences,
      } as any);
      const response = await client.send(command);
      return {
                  instanceRefreshId: response.InstanceRefreshId,
              };
    } catch (err) {
      return { error: 'Failed to start an instance refresh', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
