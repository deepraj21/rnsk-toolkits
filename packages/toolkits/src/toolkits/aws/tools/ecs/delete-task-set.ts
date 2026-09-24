import { tool } from 'ai';
import { z } from 'zod';
import { DeleteTaskSetCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsDeleteEcsTaskSet = tool({
  description: 'Delete a task set. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cluster: z.string().describe('The name of the cluster'),
    service: z.string().describe('The name of the service'),
    taskSet: z.string().describe('The task set ID or ARN to delete'),
    force: z.boolean().optional().describe('Force delete the task set'),
  }),
  execute: async ({ awsCredentials, region, cluster, service, taskSet, force }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new DeleteTaskSetCommand({
          cluster: cluster,
          service: service,
          taskSet: taskSet,
          force: force,
      });
      const response = await client.send(command);
      return {
                  taskSet: response.taskSet,
              };
    } catch (err) {
      return { error: 'Failed to delete a task set', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
