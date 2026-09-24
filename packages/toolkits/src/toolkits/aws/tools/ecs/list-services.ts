import { tool } from 'ai';
import { z } from 'zod';
import { ListServicesCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsListEcsServices = tool({
  description: 'List all services in an ECS cluster. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cluster: z.string().describe('The name of the cluster'),
    maxResults: z.number().optional().describe('Maximum number of services to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
    launchType: z.enum(['EC2', 'FARGATE', 'EXTERNAL']).optional().describe('Filter by launch type (EC2, FARGATE, EXTERNAL)'),
    schedulingStrategy: z.enum(['REPLICA', 'DAEMON']).optional().describe('Filter by scheduling strategy (REPLICA, DAEMON)'),
  }),
  execute: async ({ awsCredentials, region, cluster, maxResults, nextToken, launchType, schedulingStrategy }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new ListServicesCommand({
          cluster: cluster,
          maxResults: maxResults,
          nextToken: nextToken,
          launchType: launchType as any,
          schedulingStrategy: schedulingStrategy as any,
      });
      const response = await client.send(command);
      return {
                  serviceArns: response.serviceArns || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all services in an ECS cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
