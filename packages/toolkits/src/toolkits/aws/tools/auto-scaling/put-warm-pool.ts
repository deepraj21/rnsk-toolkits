import { tool } from 'ai';
import { z } from 'zod';
import { PutWarmPoolCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsPutAutoscalingWarmPool = tool({
  description: 'Create or update warm pool configuration. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
    maxGroupPreparedCapacity: z.number().optional().describe('Maximum group prepared capacity'),
    minSize: z.number().optional().describe('Minimum size'),
    poolState: z.enum(['Stopped', 'Running', 'Hibernated']).optional().describe('Pool state'),
    instanceReusePolicy: z.record(z.any()).optional().describe('Instance reuse policy'),
  }),
  execute: async ({ awsCredentials, region, autoScalingGroupName, maxGroupPreparedCapacity, minSize, poolState, instanceReusePolicy }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new PutWarmPoolCommand({
          AutoScalingGroupName: autoScalingGroupName,
          MaxGroupPreparedCapacity: maxGroupPreparedCapacity,
          MinSize: minSize,
          PoolState: poolState,
          InstanceReusePolicy: instanceReusePolicy,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Warm pool configuration created/updated successfully`,
              };
    } catch (err) {
      return { error: 'Failed to create or update warm pool configuration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
