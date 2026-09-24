import { tool } from 'ai';
import { z } from 'zod';
import { ListContainerInstancesCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsListEcsContainerInstances = tool({
  description: 'List all container instances in an ECS cluster. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cluster: z.string().describe('The name of the cluster'),
    maxResults: z.number().optional().describe('Maximum number of instances to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
    filter: z.string().optional().describe('Filter expression'),
    status: z.enum(['ACTIVE', 'DRAINING']).optional().describe('Filter by status (ACTIVE, DRAINING)'),
  }),
  execute: async ({ awsCredentials, region, cluster, maxResults, nextToken, filter, status }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new ListContainerInstancesCommand({
          cluster: cluster,
          maxResults: maxResults,
          nextToken: nextToken,
          filter: filter,
          status: status as any,
      });
      const response = await client.send(command);
      return {
                  containerInstanceArns: response.containerInstanceArns || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all container instances in an ECS cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
