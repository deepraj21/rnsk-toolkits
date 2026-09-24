import { tool } from 'ai';
import { z } from 'zod';
import { DescribeTaskDefinitionCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsDescribeEcsTaskDefinition = tool({
  description: 'Get details about a task definition. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    taskDefinition: z.string().describe('The family and revision of the task definition'),
    include: z.array(z.string()).optional().describe('Additional information to include (TAGS)'),
  }),
  execute: async ({ awsCredentials, region, taskDefinition, include }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new DescribeTaskDefinitionCommand({
          taskDefinition: taskDefinition,
          include: include as any,
      });
      const response = await client.send(command);
      return {
                  taskDefinition: response.taskDefinition,
                  tags: response.tags || [],
              };
    } catch (err) {
      return { error: 'Failed to get details about a task definition', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
