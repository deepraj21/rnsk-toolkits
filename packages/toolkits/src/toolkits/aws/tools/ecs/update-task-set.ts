import { tool } from 'ai';
import { z } from 'zod';
import { UpdateTaskSetCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsUpdateEcsTaskSet = tool({
  description: 'Update a task set. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cluster: z.string().describe('The name of the cluster'),
    service: z.string().describe('The name of the service'),
    taskSet: z.string().describe('The task set ID or ARN'),
    scale: z.record(z.any()).optional().describe('Scale configuration'),
  }),
  execute: async ({ awsCredentials, region, cluster, service, taskSet, scale }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new UpdateTaskSetCommand({
          cluster: cluster,
          service: service,
          taskSet: taskSet,
          scale: scale,
      });
      const response = await client.send(command);
      return {
                  taskSet: response.taskSet,
              };
    } catch (err) {
      return { error: 'Failed to update a task set', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
