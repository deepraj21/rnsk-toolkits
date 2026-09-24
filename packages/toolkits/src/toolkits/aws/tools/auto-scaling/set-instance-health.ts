import { tool } from 'ai';
import { z } from 'zod';
import { SetInstanceHealthCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsSetAutoscalingInstanceHealth = tool({
  description: 'Set the health status of an instance. Use it to change the configuration of the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    instanceId: z.string().describe('The instance ID'),
    healthStatus: z.enum(['Healthy', 'Unhealthy']).describe('Health status'),
    shouldRespectGracePeriod: z.boolean().optional().describe('Whether to respect grace period'),
  }),
  execute: async ({ awsCredentials, region, instanceId, healthStatus, shouldRespectGracePeriod }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new SetInstanceHealthCommand({
          InstanceId: instanceId,
          HealthStatus: healthStatus,
          ShouldRespectGracePeriod: shouldRespectGracePeriod,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Health status set to ${healthStatus} for instance ${instanceId}`,
              };
    } catch (err) {
      return { error: 'Failed to set the health status of an instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
