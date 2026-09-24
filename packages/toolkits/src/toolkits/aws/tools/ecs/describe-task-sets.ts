import { tool } from 'ai';
import { z } from 'zod';
import { DescribeTaskSetsCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsDescribeEcsTaskSets = tool({
  description: 'Get details about one or more task sets. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cluster: z.string().describe('The name of the cluster'),
    service: z.string().describe('The name of the service'),
    taskSets: z.array(z.string()).optional().describe('List of task set IDs or ARNs to describe'),
    include: z.array(z.string()).optional().describe('Additional information to include (TAGS)'),
  }),
  execute: async ({ awsCredentials, region, cluster, service, taskSets, include }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new DescribeTaskSetsCommand({
          cluster: cluster,
          service: service,
          taskSets: taskSets,
          include: include as any,
      });
      const response = await client.send(command);
      return {
                  taskSets: response.taskSets || [],
                  failures: response.failures || [],
              };
    } catch (err) {
      return { error: 'Failed to get details about one or more task sets', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
