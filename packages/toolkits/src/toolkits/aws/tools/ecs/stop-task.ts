import { tool } from 'ai';
import { z } from 'zod';
import { StopTaskCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsStopEcsTask = tool({
  description: 'Stop a running ECS task. Use it to stop a running resource (billable config may remain).',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cluster: z.string().describe('The name of the cluster'),
    task: z.string().describe('The task ID or ARN to stop'),
    reason: z.string().optional().describe('Reason for stopping the task'),
  }),
  execute: async ({ awsCredentials, region, cluster, task, reason }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new StopTaskCommand({
          cluster: cluster,
          task: task,
          reason: reason,
      });
      const response = await client.send(command);
      return {
                  task: response.task,
              };
    } catch (err) {
      return { error: 'Failed to stop a running ECS task', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
