import { tool } from 'ai';
import { z } from 'zod';
import { DeregisterTaskDefinitionCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsDeregisterEcsTaskDefinition = tool({
  description: 'Deregister a task definition. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    taskDefinition: z.string().describe('The family and revision of the task definition'),
  }),
  execute: async ({ awsCredentials, region, taskDefinition }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new DeregisterTaskDefinitionCommand({
          taskDefinition: taskDefinition,
      });
      const response = await client.send(command);
      return {
                  taskDefinition: response.taskDefinition,
              };
    } catch (err) {
      return { error: 'Failed to deregister a task definition', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
