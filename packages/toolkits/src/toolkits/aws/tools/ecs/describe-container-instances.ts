import { tool } from 'ai';
import { z } from 'zod';
import { DescribeContainerInstancesCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsDescribeEcsContainerInstances = tool({
  description: 'Get details about one or more container instances. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cluster: z.string().describe('The name of the cluster'),
    containerInstances: z.array(z.string()).describe('List of container instance ARNs to describe'),
    include: z.array(z.string()).optional().describe('Additional information to include (TAGS, CONTAINER_INSTANCE_HEALTH)'),
  }),
  execute: async ({ awsCredentials, region, cluster, containerInstances, include }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new DescribeContainerInstancesCommand({
          cluster: cluster,
          containerInstances: containerInstances,
          include: include as any,
      });
      const response = await client.send(command);
      return {
                  containerInstances: response.containerInstances || [],
                  failures: response.failures || [],
              };
    } catch (err) {
      return { error: 'Failed to get details about one or more container instances', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
