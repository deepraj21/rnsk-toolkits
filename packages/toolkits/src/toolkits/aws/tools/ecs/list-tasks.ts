import { tool } from 'ai';
import { z } from 'zod';
import { ListTasksCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsListEcsTasks = tool({
  description: 'List all tasks in an ECS cluster or service. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cluster: z.string().describe('The name of the cluster'),
    serviceName: z.string().optional().describe('Filter by service name'),
    desiredStatus: z.enum(['RUNNING', 'PENDING', 'STOPPED']).optional().describe('Filter by desired status (RUNNING, PENDING, STOPPED)'),
    family: z.string().optional().describe('Filter by task definition family'),
    maxResults: z.number().optional().describe('Maximum number of tasks to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
    launchType: z.enum(['EC2', 'FARGATE', 'EXTERNAL']).optional().describe('Filter by launch type (EC2, FARGATE, EXTERNAL)'),
  }),
  execute: async ({ awsCredentials, region, cluster, serviceName, desiredStatus, family, maxResults, nextToken, launchType }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new ListTasksCommand({
          cluster: cluster,
          serviceName: serviceName,
          desiredStatus: desiredStatus as any,
          family: family,
          maxResults: maxResults,
          nextToken: nextToken,
          launchType: launchType as any,
      });
      const response = await client.send(command);
      return {
                  taskArns: response.taskArns || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all tasks in an ECS cluster or service', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
